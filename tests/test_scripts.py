import importlib.util
import json
import pathlib
import socket
import tempfile
import unittest

SCRIPTS = pathlib.Path(__file__).resolve().parent.parent / 'skills' / 'unslop' / 'scripts'


def load(name):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / f'{name}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


scaffold = load('scaffold')
manifest = load('manifest')
check_deps = load('check_deps')
serve = load('serve')


def read_manifest(project):
    text = (project / 'design' / 'manifest.js').read_text()
    prefix = 'window.DS_MANIFEST = '
    assert text.startswith(prefix)
    return json.loads(text[len(prefix):].rstrip().rstrip(';'))


def make_build(folder, meta=None):
    folder.mkdir(parents=True)
    (folder / 'index.html').write_text('<!doctype html><title>x</title>')
    if meta is not None:
        (folder / 'meta.json').write_text(json.dumps(meta))


class ScaffoldTests(unittest.TestCase):
    def test_scaffold_creates_tree(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            scaffold.scaffold(project)
            design = project / 'design'
            for sub in ('references', 'stage-2', 'stage-3', 'final'):
                self.assertTrue((design / sub).is_dir(), sub)
            for f in ('brief.md', 'decisions.md', 'index.html', 'manifest.js', 'references/gallery.html'):
                self.assertTrue((design / f).is_file(), f)
            self.assertFalse((project / 'DESIGN.md').exists())

    def test_scaffold_keeps_existing_files(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            (project / 'design').mkdir()
            (project / 'design' / 'brief.md').write_text('mine')
            result = scaffold.scaffold(project)
            self.assertEqual((project / 'design' / 'brief.md').read_text(), 'mine')
            self.assertIn(project / 'design' / 'brief.md', result['kept'])


class ManifestTests(unittest.TestCase):
    def test_manifest_reads_meta(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            make_build(project / 'design' / 'stage-2' / '01-paper-impeccable',
                       {'title': 'Print-Tech Paper', 'direction': 'Print-Tech Paper',
                        'skill': 'impeccable', 'thesis': 'Ink on paper.'})
            manifest.build_manifest(project)
            data = read_manifest(project)
            stage2 = next(s for s in data['stages'] if s['key'] == 'stage-2')
            self.assertEqual(stage2['builds'][0], {
                'path': 'stage-2/01-paper-impeccable/index.html', 'title': 'Print-Tech Paper',
                'direction': 'Print-Tech Paper', 'skill': 'impeccable', 'thesis': 'Ink on paper.'})

    def test_manifest_without_meta_uses_folder_name(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            make_build(project / 'design' / 'stage-3' / 'iter-1')
            manifest.build_manifest(project)
            build = read_manifest(project)['stages'][1]['builds'][0]
            self.assertEqual(build['title'], 'iter-1')
            self.assertEqual(build['path'], 'stage-3/iter-1/index.html')

    def test_manifest_sorted_by_folder(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            for name in ('02-b-taste', '01-a-impeccable', '10-c-impeccable'):
                make_build(project / 'design' / 'stage-2' / name)
            manifest.build_manifest(project)
            titles = [b['title'] for b in read_manifest(project)['stages'][0]['builds']]
            self.assertEqual(titles, ['01-a-impeccable', '02-b-taste', '10-c-impeccable'])

    def test_manifest_includes_final_and_skips_folders_without_index(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            make_build(project / 'design' / 'final')
            (project / 'design' / 'stage-2' / 'empty').mkdir(parents=True)
            manifest.build_manifest(project)
            stages = {s['key']: s for s in read_manifest(project)['stages']}
            self.assertEqual(stages['stage-2']['builds'], [])
            self.assertEqual(stages['final']['builds'][0]['path'], 'final/index.html')


    def test_manifest_ignores_meta_that_is_not_an_object(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            make_build(project / 'design' / 'stage-2' / '01-a-impeccable', [1, 2])
            manifest.build_manifest(project)
            build = read_manifest(project)['stages'][0]['builds'][0]
            self.assertEqual(build['title'], '01-a-impeccable')

    def test_manifest_natural_sort(self):
        with tempfile.TemporaryDirectory() as d:
            project = pathlib.Path(d)
            for name in ('iter-10', 'iter-2', 'iter-1'):
                make_build(project / 'design' / 'stage-3' / name)
            manifest.build_manifest(project)
            titles = [b['title'] for b in read_manifest(project)['stages'][1]['builds']]
            self.assertEqual(titles, ['iter-1', 'iter-2', 'iter-10'])

    def test_manifest_cli_without_design_folder(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(manifest.main(['manifest.py', d]), 1)


class CheckDepsTests(unittest.TestCase):
    def test_installed_plugin_wins_over_stale_cache(self):
        with tempfile.TemporaryDirectory() as p, tempfile.TemporaryDirectory() as h:
            project, home = pathlib.Path(p), pathlib.Path(h)
            plugins = home / '.claude' / 'plugins'
            for version in ('aaa-old', 'zzz-new'):
                skill = plugins / 'cache' / 'mkt' / 'taste-skill' / version / 'skills' / 'taste-skill'
                skill.mkdir(parents=True)
                (skill / 'SKILL.md').write_text(f'---\nname: design-taste-frontend\nversion: {version}\n---\n')
            (plugins / 'installed_plugins.json').write_text(json.dumps({'version': 2, 'plugins': {
                'taste-skill@mkt': [{'scope': 'user', 'version': 'zzz-new',
                                     'installPath': str(plugins / 'cache' / 'mkt' / 'taste-skill' / 'zzz-new')}]}}))
            found = check_deps.find_skill('design-taste-frontend', project, home)
            self.assertEqual(found['version'], 'zzz-new')

    def test_cache_only_skill_is_not_reported_when_plugin_index_exists(self):
        with tempfile.TemporaryDirectory() as p, tempfile.TemporaryDirectory() as h:
            project, home = pathlib.Path(p), pathlib.Path(h)
            plugins = home / '.claude' / 'plugins'
            skill = plugins / 'cache' / 'mkt' / 'gone' / 'v1' / 'skills' / 'impeccable'
            skill.mkdir(parents=True)
            (skill / 'SKILL.md').write_text('---\nname: impeccable\n---\n')
            (plugins / 'installed_plugins.json').write_text(json.dumps({'version': 2, 'plugins': {}}))
            self.assertFalse(check_deps.find_skill('impeccable', project, home)['found'])

    def test_cli_rejects_missing_option_value(self):
        self.assertEqual(check_deps.main(['check_deps.py', '--project']), 2)

    def test_find_skill_in_project_then_home(self):
        with tempfile.TemporaryDirectory() as p, tempfile.TemporaryDirectory() as h:
            project, home = pathlib.Path(p), pathlib.Path(h)
            home_skill = home / '.claude' / 'skills' / 'impeccable'
            home_skill.mkdir(parents=True)
            (home_skill / 'SKILL.md').write_text('---\nname: impeccable\nversion: 4.5.2\n---\n')
            found = check_deps.find_skill('impeccable', project, home)
            self.assertEqual(found['where'], str(home_skill))
            self.assertEqual(found['version'], '4.5.2')
            proj_skill = project / '.claude' / 'skills' / 'impeccable'
            proj_skill.mkdir(parents=True)
            (proj_skill / 'SKILL.md').write_text('---\nname: impeccable\n---\n')
            found = check_deps.find_skill('impeccable', project, home)
            self.assertEqual(found['where'], str(proj_skill))
            self.assertIsNone(found['version'])

    def test_find_skill_in_plugin_cache(self):
        with tempfile.TemporaryDirectory() as p, tempfile.TemporaryDirectory() as h:
            project, home = pathlib.Path(p), pathlib.Path(h)
            skill = home / '.claude' / 'plugins' / 'cache' / 'taste-skill' / 'taste-skill' / '2.0.0' / 'skills' / 'taste-skill'
            skill.mkdir(parents=True)
            (skill / 'SKILL.md').write_text('---\nname: design-taste-frontend\n---\n')
            found = check_deps.find_skill('design-taste-frontend', project, home)
            self.assertTrue(found['found'])
            self.assertEqual(found['where'], str(skill))

    def test_missing_skill(self):
        with tempfile.TemporaryDirectory() as p, tempfile.TemporaryDirectory() as h:
            found = check_deps.find_skill('impeccable', pathlib.Path(p), pathlib.Path(h))
            self.assertEqual(found, {'name': 'impeccable', 'found': False, 'where': None, 'version': None})


class ServeTests(unittest.TestCase):
    def test_free_port_skips_busy(self):
        busy = socket.socket()
        busy.bind(('127.0.0.1', 0))
        busy.listen()
        port = busy.getsockname()[1]
        try:
            self.assertGreater(serve.free_port(port), port)
        finally:
            busy.close()

    def test_free_port_skips_port_busy_only_on_ipv6(self):
        if not socket.has_ipv6:
            self.skipTest('no IPv6')
        busy = socket.socket(socket.AF_INET6)
        try:
            busy.bind(('::1', 0))
        except OSError:
            busy.close()
            self.skipTest('::1 not bindable')
        busy.listen()
        port = busy.getsockname()[1]
        try:
            self.assertNotEqual(serve.free_port(port), port)
        finally:
            busy.close()

    def test_cli_rejects_missing_port_value(self):
        with tempfile.TemporaryDirectory() as d:
            (pathlib.Path(d) / 'design').mkdir()
            self.assertEqual(serve.main(['serve.py', d, '--port']), 2)


if __name__ == '__main__':
    unittest.main()
