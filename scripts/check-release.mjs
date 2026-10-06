import { verifyLocal } from './release-files.mjs';
const [directory, commit, release] = process.argv.slice(2);
if (!directory) throw new Error('Usage: node check-release.mjs DIRECTORY [COMMIT] [RELEASE]');
console.log((await verifyLocal(directory, commit, release)).commit);
