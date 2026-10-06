import { createHash } from 'node:crypto';
import { readManifest } from './release-files.mjs';

const [origin, manifestPath, mode = 'active'] = process.argv.slice(2);
const base = new URL(origin);
if (!['https:', 'http:'].includes(base.protocol) || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
  throw new Error('The site URL must be an HTTP(S) origin without credentials or a subdirectory.');
}
if (!['active', 'release'].includes(mode)) throw new Error('Unknown verification mode.');
const expected = await readManifest(manifestPath);
const releaseBase = `/releases/${expected.release}/`;
async function get(path) {
  const url = new URL(path, base);
  url.searchParams.set('check', `${expected.release}-${Date.now()}`);
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  const destination = new URL(response.url);
  if (destination.hostname !== base.hostname || (base.protocol === 'https:' && destination.protocol !== 'https:')) {
    throw new Error('Unexpected redirect from the deployment origin.');
  }
  return Buffer.from(await response.arrayBuffer());
}
const actual = JSON.parse((await get(mode === 'active' ? '/version.json' : `${releaseBase}version.json`)).toString('utf8'));
if (actual.commit !== expected.commit || actual.release !== expected.release) {
  throw new Error(`Wrong version: expected ${expected.commit} / ${expected.release}`);
}
for (const file of expected.files) {
  const path = mode === 'active' && file.path === 'index.html'
    ? '/' : releaseBase + file.path.split('/').map(encodeURIComponent).join('/');
  if (createHash('sha256').update(await get(path)).digest('hex') !== file.sha256) {
    throw new Error(`Content mismatch: ${path}`);
  }
}
console.log(`Verified ${expected.commit} (${expected.files.length} files, ${mode}).`);
