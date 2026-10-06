import { lstat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { releasePattern, scanFiles, validateManifest, verifyLocal } from './release-files.mjs';

const [directory, commit, release] = process.argv.slice(2);
if (!directory || !/^[a-f0-9]{40}$/.test(commit ?? '') || !releasePattern.test(release ?? '')) {
  throw new Error('Usage: node release-manifest.mjs DIST COMMIT RELEASE');
}
const path = join(directory, 'version.json');
const exists = await lstat(path).then(() => true, error => {
  if (error.code === 'ENOENT') return false;
  throw error;
});
if (exists) {
  await verifyLocal(directory, commit, release);
  console.log('Manifest already matches; preserved without rewriting.');
} else {
  const manifest = validateManifest({ commit, release, builtAt: new Date().toISOString(), files: await scanFiles(directory) });
  await writeFile(path, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
}
