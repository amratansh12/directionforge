"""Copy design/ to a shareable folder without anything that is not yours to publish.

Reference screenshots are other people's work: they are dropped, and the gallery is rewritten to
link to each source instead (links-only mode). Dot-folders (skill working files) are dropped too.
Builds, the switcher, brief, decision log and DESIGN.md are copied as they are.

Run: python3 -I publish.py <project-dir> <output-dir>
"""
import json
import pathlib
import shutil
import sys

IMAGE_SUFFIXES = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.bmp', '.tif', '.tiff', '.svg', '.heic'}
PREFIX = 'window.DS_GALLERY = '


def links_only(text):
    data = json.loads(text[len(PREFIX):].rstrip().rstrip(';'))
    for group in data.get('groups', []):
        for image in group.get('images', []):
            image.pop('file', None)
    data['linksOnly'] = True
    return PREFIX + json.dumps(data, indent=2, ensure_ascii=False) + ';\n'


def publish(project, out):
    design = (pathlib.Path(project) / 'design').resolve()
    out = pathlib.Path(out).resolve()
    if out == design or design in out.parents:
        raise ValueError('output folder must be outside design/')
    if out.exists():
        shutil.rmtree(out)
    refs = design / 'references'

    def ignore(folder, names):
        folder = pathlib.Path(folder)
        skipped = {n for n in names if n.startswith('.')}
        if folder == refs:
            skipped |= {n for n in names if pathlib.Path(n).suffix.lower() in IMAGE_SUFFIXES}
        return skipped

    shutil.copytree(design, out, ignore=ignore)
    data_file = out / 'references' / 'gallery-data.js'
    if data_file.is_file():
        data_file.write_text(links_only(data_file.read_text()))
    return out


def main(argv):
    if len(argv) != 3:
        print('usage: publish.py <project-dir> <output-dir>', file=sys.stderr)
        return 2
    if not (pathlib.Path(argv[1]) / 'design').is_dir():
        print(f'{argv[1]}/design does not exist', file=sys.stderr)
        return 1
    try:
        out = publish(argv[1], argv[2])
    except ValueError as e:
        print(e, file=sys.stderr)
        return 2
    print(f'published to {out} (reference images removed; gallery links to sources)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
