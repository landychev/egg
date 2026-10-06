import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const releasePattern = /^[A-Za-z0-9-]{1,128}$/;
export function validateManifest(value) {
  if (!value || !/^[a-f0-9]{40}$/.test(value.commit ?? '') || !releasePattern.test(value.release ?? '') ||
      typeof value.builtAt !== 'string' || !Array.isArray(value.files) || !value.files.length) {
    throw new Error('Invalid release manifest.');
  }
  const paths = new Set();
  for (const file of value.files) {
    if (!file || typeof file.path !== 'string' || /[\\\x00-\x1f]/.test(file.path) ||
        file.path.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.')) ||
        file.path === 'version.json' || !/^[a-f0-9]{64}$/.test(file.sha256 ?? '') || paths.has(file.path)) {
      throw new Error('Invalid file entry in release manifest.');
    }
    paths.add(file.path);
  }
  if (!paths.has('index.html') || ![...paths].some(path => path.endsWith('.js'))) {
    throw new Error('The release must include index.html and JavaScript.');
  }
  return value;
}
export async function readManifest(path) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Manifest must be a regular file.');
  return validateManifest(JSON.parse(await readFile(path, 'utf8')));
}
export async function scanFiles(directory) {
  const stat = await lstat(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Release must be a real directory.');
  const files = [];
  async function walk(relative = '') {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${path}`);
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && path !== 'version.json') {
        files.push({ path, sha256: createHash('sha256').update(await readFile(join(directory, path))).digest('hex') });
      } else if (!entry.isFile()) throw new Error(`Unexpected file type: ${path}`);
    }
  }
  await walk();
  return files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export async function verifyLocal(directory, commit, release) {
  const manifest = await readManifest(join(directory, 'version.json'));
  if ((commit && manifest.commit !== commit) || (release && manifest.release !== release)) {
    throw new Error('Saved release has the wrong commit or release identifier.');
  }
  const expected = [...manifest.files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  if (JSON.stringify(await scanFiles(directory)) !== JSON.stringify(expected)) {
    throw new Error('Saved release files differ from their manifest; existing release was not overwritten.');
  }
  return manifest;
}
