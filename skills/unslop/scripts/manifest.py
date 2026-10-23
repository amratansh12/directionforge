"""Scan design/ for builds and write design/manifest.js for the switcher page (index.html).

A build is any folder with an index.html under design/stage-2/, design/stage-3/, or design/final/ itself.
Optional meta.json next to it: {"title", "direction", "skill", "thesis"}.

Run: python3 -I manifest.py <project-dir>
"""
import json
import pathlib
import sys

STAGES = (
    ('stage-2', 'Directions'),
    ('stage-3', 'Iterations'),
    ('final', 'Final'),
)
META_KEYS = ('title', 'direction', 'skill', 'thesis')


def read_build(design, folder):
    meta = {}
    meta_file = folder / 'meta.json'
    if meta_file.is_file():
        try:
            meta = json.loads(meta_file.read_text())
        except ValueError:
            print(f'warning: {meta_file} is not valid JSON, ignoring it', file=sys.stderr)
    build = {'path': (folder / 'index.html').relative_to(design).as_posix()}
    for key in META_KEYS:
        build[key] = str(meta.get(key) or '')
    build['title'] = build['title'] or folder.name
    return build


def build_manifest(project):
    design = pathlib.Path(project) / 'design'
    stages = []
    for key, label in STAGES:
        root = design / key
        builds = []
        if key == 'final':
            if (root / 'index.html').is_file():
                builds.append(read_build(design, root))
        elif root.is_dir():
            for folder in sorted(p for p in root.iterdir() if p.is_dir()):
                if (folder / 'index.html').is_file():
                    builds.append(read_build(design, folder))
        stages.append({'key': key, 'label': label, 'builds': builds})
    data = {'stages': stages}
    out = design / 'manifest.js'
    out.write_text('window.DS_MANIFEST = ' + json.dumps(data, indent=2) + ';\n')
    return data


def main(argv):
    if len(argv) != 2:
        print('usage: manifest.py <project-dir>', file=sys.stderr)
        return 2
    data = build_manifest(argv[1])
    for stage in data['stages']:
        print(f"{stage['label']}: {len(stage['builds'])} build(s)")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
