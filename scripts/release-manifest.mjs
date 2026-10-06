import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [directory, commit, release] = process.argv.slice(2);
if (!directory || !/^[a-f0-9]{40}$/.test(commit ?? '') || !/^[A-Za-z0-9-]+$/.test(release ?? '')) {
  throw new Error('Usage: node release-manifest.mjs DIST COMMIT RELEASE');
}
const files = [];
async function walk(relative = '') {
  for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && path !== 'version.json') {
      files.push({ path, sha256: createHash('sha256').update(await readFile(join(directory, path))).digest('hex') });
    } else if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${path}`);
  }
}
await walk();
if (!files.some(file => file.path === 'index.html') || !files.some(file => file.path.endsWith('.js'))) {
  throw new Error('The build must include index.html and JavaScript.');
}
files.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(join(directory, 'version.json'), JSON.stringify({
  commit, release, builtAt: new Date().toISOString(), files,
}, null, 2) + '\n');
