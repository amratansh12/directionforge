"""Serve <project>/design on the first free port at or above --port (default 8000).

Run: python3 -I serve.py <project-dir> [--port 8000]
"""
import functools
import http.server
import pathlib
import socket
import sys


def free_port(start, host='127.0.0.1', tries=50):
    for port in range(start, start + tries):
        with socket.socket() as s:
            try:
                s.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f'no free port in {start}-{start + tries - 1}')


def main(argv):
    if len(argv) < 2:
        print('usage: serve.py <project-dir> [--port 8000]', file=sys.stderr)
        return 2
    design = pathlib.Path(argv[1]) / 'design'
    if not design.is_dir():
        print(f'{design} does not exist; run scaffold.py first', file=sys.stderr)
        return 1
    start = int(argv[argv.index('--port') + 1]) if '--port' in argv else 8000
    port = free_port(start)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(design))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    print(f'serving {design} at http://localhost:{port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
