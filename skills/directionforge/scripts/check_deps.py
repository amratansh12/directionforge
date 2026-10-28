"""Report whether the skills and tools directionforge needs are available.

Skill search order: <project>/.claude/skills/<name>, ~/.claude/skills/<name>,
then any installed plugin under ~/.claude/plugins/cache whose SKILL.md declares that name.

Run: python3 -I check_deps.py [--project DIR] [--json]
"""
import json
import pathlib
import re
import shutil
import subprocess
import sys

SKILLS = ('impeccable', 'design-taste-frontend')
BROWSERS = (
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
)
INSTALL = {
    'impeccable': 'npx -y impeccable@4.8.0 install --project --providers=claude -y   (from the project folder; Node >= 18.19)',
    'design-taste-frontend': 'npx -y skills@1.7.4 add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend --agent claude-code --copy -y',
}


def frontmatter(skill_md):
    text = skill_md.read_text(errors='replace')
    match = re.match(r'---\n(.*?)\n---', text, re.S)
    if not match:
        return {}
    fields = {}
    for line in match.group(1).splitlines():
        if ':' in line and not line.startswith(' '):
            key, _, value = line.partition(':')
            fields[key.strip()] = value.strip().strip('"\'')
    return fields


def result(name, folder):
    if folder is None:
        return {'name': name, 'found': False, 'where': None, 'version': None}
    version = frontmatter(folder / 'SKILL.md').get('version') or None
    return {'name': name, 'found': True, 'where': str(folder), 'version': version}


def matching_skill(root, name):
    for skill_md in sorted(pathlib.Path(root).glob('**/skills/*/SKILL.md')):
        if skill_md.parent.name == name or frontmatter(skill_md).get('name') == name:
            return skill_md.parent
    return None


def plugin_install_paths(plugins_dir):
    """installPath of every installed plugin, or None when there is no plugin index to read."""
    index = plugins_dir / 'installed_plugins.json'
    if not index.is_file():
        return None
    try:
        data = json.loads(index.read_text())
    except ValueError:
        return None
    paths = []
    entries = data.get('plugins', {}) if isinstance(data, dict) else {}
    for installs in entries.values():
        for install in installs if isinstance(installs, list) else [installs]:
            if isinstance(install, dict) and install.get('installPath'):
                paths.append(install['installPath'])
    return paths


def find_skill(name, project, home):
    for base in (pathlib.Path(project) / '.claude' / 'skills', pathlib.Path(home) / '.claude' / 'skills'):
        if (base / name / 'SKILL.md').is_file():
            return result(name, base / name)
    plugins = pathlib.Path(home) / '.claude' / 'plugins'
    installed = plugin_install_paths(plugins)
    # The cache keeps old and uninstalled versions, so only fall back to it without an index.
    roots = installed if installed is not None else [plugins / 'cache']
    for root in roots:
        found = matching_skill(root, name) if pathlib.Path(root).is_dir() else None
        if found:
            return result(name, found)
    return result(name, None)


def tool_version(cmd):
    path = shutil.which(cmd)
    if not path:
        return {'name': cmd, 'found': False, 'where': None, 'version': None}
    try:
        out = subprocess.run([path, '--version'], capture_output=True, text=True, timeout=10)
        version = (out.stdout or out.stderr).strip().splitlines()[0]
    except (OSError, subprocess.SubprocessError, IndexError):
        version = None
    return {'name': cmd, 'found': True, 'where': path, 'version': version}


def find_browser():
    for path in BROWSERS:
        if pathlib.Path(path).exists():
            return {'name': 'chrome', 'found': True, 'where': path, 'version': None}
    for cmd in ('google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge'):
        if shutil.which(cmd):
            return {'name': 'chrome', 'found': True, 'where': shutil.which(cmd), 'version': None}
    return {'name': 'chrome', 'found': False, 'where': None, 'version': None}


def check(project, home):
    deps = [find_skill(n, project, home) for n in SKILLS]
    deps += [tool_version('node'), tool_version('python3'), find_browser()]
    return deps


def main(argv):
    project = pathlib.Path.cwd()
    if '--project' in argv:
        i = argv.index('--project') + 1
        if i >= len(argv) or argv[i].startswith('--'):
            print('usage: check_deps.py [--project DIR] [--json]', file=sys.stderr)
            return 2
        project = pathlib.Path(argv[i])
    deps = check(project, pathlib.Path.home())
    if '--json' in argv:
        print(json.dumps(deps, indent=2))
        return 0
    for d in deps:
        mark = 'ok     ' if d['found'] else 'MISSING'
        detail = d['where'] or ''
        if d['version']:
            detail += f"  ({d['version']})"
        print(f"{mark} {d['name']:<22} {detail}")
        if not d['found'] and d['name'] in INSTALL:
            print(f"      install: {INSTALL[d['name']]}")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
