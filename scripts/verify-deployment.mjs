import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const [origin, manifestPath, mode = 'active'] = process.argv.slice(2);
const base = new URL(origin);
if (!['https:', 'http:'].includes(base.protocol) || base.pathname !== '/' || base.search || base.hash) {
  throw new Error('The site URL must be an HTTP(S) origin without a subdirectory.');
}
if (!['active', 'release'].includes(mode)) throw new Error('Unknown verification mode.');
const expected = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!/^[A-Za-z0-9-]+$/.test(expected.release) || !/^[a-f0-9]{40}$/.test(expected.commit)) {
  throw new Error('Invalid release manifest.');
}
const releaseBase = `/releases/${expected.release}/`;
async function get(path) {
  const url = new URL(path, base);
  url.searchParams.set('check', `${expected.release}-${Date.now()}`);
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  if (new URL(response.url).hostname !== base.hostname) throw new Error('Unexpected redirect to another host.');
  return Buffer.from(await response.arrayBuffer());
}
const metadataPath = mode === 'active' ? '/version.json' : `${releaseBase}version.json`;
const actual = JSON.parse((await get(metadataPath)).toString('utf8'));
if (actual.commit !== expected.commit || actual.release !== expected.release) {
  throw new Error(`Wrong version: expected ${expected.commit} / ${expected.release}`);
}
for (const file of expected.files) {
  if (file.path.startsWith('/') || file.path.split('/').some(part => part === '..' || part === '.')) {
    throw new Error('Invalid file path in manifest.');
  }
  const path = mode === 'active' && file.path === 'index.html' ? '/' : releaseBase + file.path;
  const digest = createHash('sha256').update(await get(path)).digest('hex');
  if (digest !== file.sha256) throw new Error(`Content mismatch: ${path}`);
}
console.log(`Verified ${expected.commit} (${expected.files.length} files, ${mode}).`);
