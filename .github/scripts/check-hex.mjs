import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const hex = /#[0-9a-fA-F]{3,8}\b/g;
const root = 'css';

async function cssFiles(dir, out = []) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    if (name.endsWith('.css')) out.push(full);
  }
  return out;
}

async function main() {
  const files = await cssFiles(root);
  const hits = [];
  for (const file of files) {
    if (path.basename(file) === 'tokens.css' || path.basename(file) === 'cinema.css') continue; // cinema.css is the front-door theme and defines its own palette
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(hex)) {
      const line = text.slice(0, match.index).split('\n').length;
      hits.push(`${file}:${line} ${match[0]}`);
    }
  }
  if (hits.length) {
    console.error('Hex colors belong in css/tokens.css (SVG files are exempt):');
    for (const hit of hits) console.error(`  ${hit}`);
    process.exit(1);
  }
  console.log('hex check: css outside tokens.css is clear');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
