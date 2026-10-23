"""Create the design/ working tree in a project without touching anything that already exists.

Run: python3 -I scaffold.py <project-dir>
"""
import pathlib
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import manifest  # noqa: E402

SKILL = pathlib.Path(__file__).resolve().parent.parent
FOLDERS = ('references', 'stage-2', 'stage-3', 'final')
# destination inside design/ -> source inside the skill
FILES = {
    'brief.md': 'templates/brief.md',
    'decisions.md': 'templates/decisions.md',
    'index.html': 'assets/index.html',
    'references/gallery.html': 'assets/gallery.html',
    'references/SOURCES.md': 'templates/SOURCES.md',
}


def scaffold(project):
    design = pathlib.Path(project) / 'design'
    created, kept = [], []
    for sub in FOLDERS:
        (design / sub).mkdir(parents=True, exist_ok=True)
    for dest, src in FILES.items():
        target = design / dest
        if target.exists():
            kept.append(target)
            continue
        shutil.copyfile(SKILL / src, target)
        created.append(target)
    if not (design / 'manifest.js').exists():
        # So the switcher shows its empty state instead of a 404 on a fresh tree.
        manifest.build_manifest(project)
        created.append(design / 'manifest.js')
    return {'design': design, 'created': created, 'kept': kept}


def main(argv):
    if len(argv) != 2:
        print('usage: scaffold.py <project-dir>', file=sys.stderr)
        return 2
    result = scaffold(argv[1])
    print(f"design folder: {result['design']}")
    for p in result['created']:
        print(f'  created {p}')
    for p in result['kept']:
        print(f'  kept    {p} (already existed)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
