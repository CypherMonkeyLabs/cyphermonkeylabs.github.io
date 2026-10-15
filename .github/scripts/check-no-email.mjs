import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const roots = [
  'js/trust',
  'css/trust.css',
  'worker',
  'privacy.html',
  '404.html',
  'trust-demo.html',
  'docs',
  'robots.txt',
  'sitemap.xml',
  '.github/workflows',
  '.github/fixtures',
  '.github/ISSUE_TEMPLATE',
  '.github/schema',
  '.github/PULL_REQUEST_TEMPLATE.md',
];
const siteRoots = new Set([
  'js/trust',
  'css/trust.css',
  'worker',
  'privacy.html',
  '404.html',
  'trust-demo.html',
  'robots.txt',
  'sitemap.xml',
]);
const skip = new Set(['.github/workflows/restore-binaries.yml']);
const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function scansForMailLinks(file) {
  return [...siteRoots].some((root) => file === root || file.startsWith(`${root}/`));
}

async function filesIn(entry, out) {
  const info = await stat(entry);
  if (info.isDirectory()) {
    for (const name of await readdir(entry)) await filesIn(path.join(entry, name), out);
    return;
  }
  if (!info.isFile()) return;
  const rel = entry.split(path.sep).join('/');
  if (skip.has(rel)) return;
  out.push(rel);
}

const files = [];
for (const root of roots) await filesIn(root, files);
let found = false;
for (const file of files) {
  const text = await readFile(file, 'utf8');
  if ((scansForMailLinks(file) && /mailto:/i.test(text)) || email.test(text)) {
    console.error(`found ${file}`);
    found = true;
  }
}
if (found) {
  console.error('found');
  process.exit(1);
}
console.log('not found');
