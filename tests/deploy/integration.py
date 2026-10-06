"""Exercise the real deployment script as root in an isolated Linux fixture.

Only temporary paths and a local Git remote/HTTP server are used. Node, npm, Git,
runuser, GNU file operations and flock are real, including cross-filesystem builds.
"""
import contextlib
import fcntl
import http.server
import json
import os
from pathlib import Path
import pwd
import signal
import subprocess
import tempfile
import threading
import time
import urllib.parse
import urllib.request

PROJECT = Path(__file__).resolve().parents[2]
SCRIPT = PROJECT / 'scripts/deploy.sh'
if os.name != 'posix' or os.uname().sysname != 'Linux' or os.geteuid() != 0:
    raise SystemExit('Run in an isolated Linux environment as root (see the Debian CI job).')


def command(args, *, env=None, user=None, success=True):
    if user:
        args = ['runuser', '-u', user, '--', *map(str, args)]
    result = subprocess.run(args, env=env, text=True, stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT, timeout=90)
    if (result.returncode == 0) != success:
        raise AssertionError(f'{args}: exit {result.returncode}\n{result.stdout}')
    return result.stdout.strip()


def passed(message):
    print(f'PASS: {message}', flush=True)


with contextlib.ExitStack() as stack:
    base = Path(stack.enter_context(tempfile.TemporaryDirectory(prefix='egg-deploy-test-')))
    base.chmod(0o755)
    # Debian CI has /dev/shm on a separate filesystem from the public directory.
    state = Path(stack.enter_context(tempfile.TemporaryDirectory(
        prefix='egg-deploy-state-', dir='/dev/shm' if Path('/dev/shm').is_dir() else None)))
    source, checkout, public = base / 'source', base / 'checkout', base / 'public'
    account = pwd.getpwnam('nobody')
    web = pwd.getpwnam('www-data')
    for path in (source, checkout):
        path.mkdir()
        os.chown(path, account.pw_uid, account.pw_gid)
    build_log = base / 'builds.log'
    node_version = command(['node', '-p', 'process.versions.node'])

    def git(path, *args):
        return command(['git', '-C', str(path), *args], user='nobody')

    git(source, 'init', '-b', 'main')
    git(source, 'config', 'user.name', 'Deployment Test')
    git(source, 'config', 'user.email', 'test@example.invalid')
    package = {'name': 'egg-deployment-fixture', 'version': '1.0.0', 'private': True,
               'type': 'module', 'scripts': {'build': 'node build.mjs'}}
    fixture = {
        '.nvmrc': node_version + '\n',
        'package.json': json.dumps(package),
        'package-lock.json': json.dumps({'name': package['name'], 'version': '1.0.0',
            'lockfileVersion': 3, 'requires': True, 'packages': {'': {
                'name': package['name'], 'version': '1.0.0'}}}),
        'build.mjs': '''import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
appendFileSync(process.env.EGG_TEST_BUILD_LOG, 'build\\n');
const label = readFileSync('label.txt', 'utf8').trim();
if (label === 'broken') throw new Error('Deliberate build failure');
const base = process.argv.find(value => value.startsWith('--base=')).slice(7);
mkdirSync('dist/assets', { recursive: true });
writeFileSync('dist/index.html', `<html><body>${label}<script src="${base}assets/game.js"></script></body></html>`);
writeFileSync('dist/assets/game.js', `console.log(${JSON.stringify(label)});`);
'''}
    for name, content in fixture.items():
        path = source / name
        path.write_text(content)
        os.chown(path, account.pw_uid, account.pw_gid)

    def commit(label):
        path = source / 'label.txt'
        path.write_text(label)
        os.chown(path, account.pw_uid, account.pw_gid)
        git(source, 'add', '.')
        git(source, 'commit', '-m', label)
        return git(source, 'rev-parse', 'HEAD')

    a = commit('A')
    command(['git', 'clone', str(source), str(checkout)], user='nobody')
    git(checkout, 'remote', 'set-url', 'origin', 'git@github.com:landychev/egg.git')
    git(checkout, 'config', f'url.{source}.insteadOf', 'git@github.com:landychev/egg.git')

    class Handler(http.server.BaseHTTPRequestHandler):
        fail_commit = None
        block_commit = None
        blocked = threading.Event()
        unblock = threading.Event()

        def log_message(self, *_):
            pass

        def do_GET(self):
            request = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
            path = (public / request.lstrip('/') if request.startswith('/releases/')
                    else public / 'current' / (request.lstrip('/') or 'index.html'))
            try:
                if request == '/version.json':
                    active = json.loads(path.read_text())['commit']
                    if active == self.block_commit:
                        self.blocked.set()
                        self.unblock.wait(20)
                    if active == self.fail_commit:
                        self.send_error(503, 'Deliberate post-activation failure')
                        return
                path.resolve().relative_to(public.resolve())
                body = path.read_bytes()
                self.send_response(200)
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except (OSError, ValueError):
                self.send_error(404)

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    stack.callback(server.server_close)
    stack.callback(server.shutdown)
    env = dict(os.environ, EGG_REPO=str(checkout), EGG_ROOT=str(public),
               EGG_STATE_ROOT=str(state), EGG_URL=f'http://127.0.0.1:{server.server_port}',
               EGG_TEST_BUILD_LOG=str(build_log), npm_config_cache=str(base / 'npm-cache'))

    def deploy(*args, success=True, user=None):
        return command(['bash', str(SCRIPT), *args], env=env, success=success, user=user)

    def pointers():
        return tuple(os.readlink(public / name) if (public / name).is_symlink() else None
                     for name in ('current', 'previous'))

    def active():
        return Path(pointers()[0]).name

    def builds():
        return len(build_log.read_text().splitlines()) if build_log.exists() else 0

    def snapshot():
        return pointers(), sorted(path.name for path in (public / 'releases').iterdir()), builds()

    deploy('prepare')
    initial = (public / 'bootstrap/index.html').stat().st_mtime_ns
    deploy('prepare')
    assert active() == 'bootstrap' and (public / 'bootstrap/index.html').stat().st_mtime_ns == initial
    assert public.stat().st_uid == web.pw_uid
    assert state.stat().st_uid == 0 and state.stat().st_mode & 0o777 == 0o700
    passed('prepare twice preserves the page and applies www-data/root ownership')

    deploy()
    assert active() == a and builds() == 1
    before = snapshot()
    manifest = public / 'releases' / a / 'version.json'
    manifest_before = manifest.read_bytes(), manifest.stat().st_mtime_ns
    deploy()
    deploy('prepare')
    command(['node', str(PROJECT / 'scripts/release-manifest.mjs'), str(manifest.parent), a, a])
    assert snapshot() == before
    assert (manifest.read_bytes(), manifest.stat().st_mtime_ns) == manifest_before
    for path in [public, *public.rglob('*')]:
        assert path.lstat().st_uid == web.pw_uid, path
    passed('repeated deploy, prepare and manifest generation preserve the published release')

    b = commit('B')
    deploy()
    assert active() == b and Path(pointers()[1]).name == a
    before = snapshot()
    deploy()
    assert snapshot() == before
    deploy('rollback')
    assert active() == a
    before = snapshot()
    deploy('rollback')
    assert snapshot() == before
    deploy('rollback', b)
    before = snapshot()
    deploy('rollback', b)
    assert snapshot() == before and active() == b
    passed('update, default rollback and explicit rollback are repeatable')

    broken = commit('broken')
    before = pointers()
    deploy(success=False)
    deploy(success=False)
    assert pointers() == before and not (public / 'releases' / broken).exists()
    assert not list((state / 'work').iterdir()) and not (state / 'pending').exists()
    passed('repeated build failures leave the live site and pointers unchanged')

    d = commit('D')
    Handler.fail_commit = d
    deploy(success=False)
    assert pointers() == before and not (state / 'pending').exists()
    assert (public / 'releases' / d).is_dir()
    count = builds()
    Handler.fail_commit = None
    deploy()
    assert active() == d and Path(pointers()[1]).name == b and builds() == count
    with urllib.request.urlopen(env['EGG_URL'] + f'/releases/{a}/assets/game.js') as response:
        assert b'"A"' in response.read()
    passed('failed HTTP check restores both pointers; retry reuses the release; old assets survive')

    before = snapshot()
    with (state / 'deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        assert 'Another deployment' in deploy('status', success=False)
    deploy('prepare', success=False, user='nobody')
    assert snapshot() == before
    passed('concurrent and non-root invocations cannot change the deployment')

    # Stop the parent shell precisely between changing current and verification.
    e = commit('E')
    Handler.block_commit = e
    process = subprocess.Popen(['bash', str(SCRIPT)], env=env, text=True,
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        assert Handler.blocked.wait(60), 'Deployment never reached active HTTP verification'
        process.send_signal(signal.SIGKILL)
    finally:
        Handler.unblock.set()
        output = process.communicate(timeout=30)[0]
    assert process.returncode == -signal.SIGKILL, output
    assert (state / 'pending').exists() and active() == e
    deploy('status')
    assert active() == d and Path(pointers()[1]).name == b and not (state / 'pending').exists()
    deploy('status')
    passed('next invocation recovers both pointers after SIGKILL and releases the lock')

    # A saved immutable release must not be overwritten to hide corruption.
    asset = public / 'releases' / b / 'assets/game.js'
    original = asset.read_bytes()
    asset.write_text('corrupt')
    before = pointers()
    deploy('rollback', b, success=False)
    assert pointers() == before and asset.read_text() == 'corrupt'
    asset.write_bytes(original)
    passed('corrupt saved releases are rejected without overwriting or activation')

    for release in (a, b, d, e):
        stamp = state / 'retired' / release
        stamp.touch()
        old = time.time() - 8 * 86400
        os.utime(stamp, (old, old))
    deploy('prune')
    assert sorted(path.name for path in (public / 'releases').iterdir()) == sorted([b, d])
    before = snapshot()
    deploy('prune')
    assert snapshot() == before
    passed('prune twice removes expired releases while preserving current and previous')

    releases = public / 'releases'
    saved = public / 'saved-releases'
    releases.rename(saved)
    releases.symlink_to(base / 'source', target_is_directory=True)
    try:
        deploy('prepare', success=False)
        assert (source / 'package.json').read_text() == fixture['package.json']
    finally:
        releases.unlink()
        saved.rename(releases)
    passed('unexpected public-directory symlinks are refused')
    print(f'All deployment integration checks passed on Node {node_version}.', flush=True)
