"""Serve <project>/design on the first free port at or above --port (default 8000).

Run: python3 -I serve.py <project-dir> [--port 8000]
"""
import errno
import functools
import http.server
import pathlib
import socket
import sys


def port_busy(family, host, port):
    with socket.socket(family) as s:
        try:
            s.bind((host, port))
        except OSError as e:
            # A host without IPv6 is not "busy"; only an address in use is.
            return e.errno == errno.EADDRINUSE
    return False


def free_port(start, tries=50):
    # Check IPv4 and IPv6 loopback: dev servers on macOS often hold "localhost" on ::1 only.
    for port in range(start, start + tries):
        if port_busy(socket.AF_INET, '127.0.0.1', port):
            continue
        if socket.has_ipv6 and port_busy(socket.AF_INET6, '::1', port):
            continue
        return port
    raise RuntimeError(f'no free port in {start}-{start + tries - 1}')


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # Builds and manifest.js change between stages; never show a stale copy.
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def main(argv):
    usage = 'usage: serve.py <project-dir> [--port 8000]'
    if len(argv) < 2:
        print(usage, file=sys.stderr)
        return 2
    start = 8000
    if '--port' in argv:
        i = argv.index('--port') + 1
        if i >= len(argv) or not argv[i].isdigit():
            print(usage, file=sys.stderr)
            return 2
        start = int(argv[i])
    design = pathlib.Path(argv[1]) / 'design'
    if not design.is_dir():
        print(f'{design} does not exist; run scaffold.py first', file=sys.stderr)
        return 1
    port = free_port(start)
    handler = functools.partial(NoCacheHandler, directory=str(design))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    print(f'serving {design} at http://127.0.0.1:{port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
