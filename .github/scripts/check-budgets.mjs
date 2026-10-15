import { gzipSync } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

async function gzipSize(file) {
  const bytes = await readFile(file);
  return gzipSync(bytes).length;
}

async function dirGzip(dir) {
  let total = 0;
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) total += await dirGzip(full);
    else if (name.endsWith('.js')) total += gzipSync(await readFile(full)).length;
  }
  return total;
}

const limits = [
  { label: 'css/trust.css gzip', bytes: await gzipSize('css/trust.css'), max: 8 * 1024 },
  { label: 'js/trust gzip', bytes: await dirGzip('js/trust'), max: 20 * 1024 },
  { label: 'privacy.html gzip', bytes: await gzipSize('privacy.html'), max: 30 * 1024 },
  { label: '404.html gzip', bytes: await gzipSize('404.html'), max: 30 * 1024 },
  { label: 'trust-demo.html gzip', bytes: await gzipSize('trust-demo.html'), max: 30 * 1024 },
];

let failed = false;
for (const item of limits) {
  const mark = item.bytes <= item.max ? 'ok' : 'over';
  console.log(`${mark} ${item.label}: ${item.bytes} bytes (max ${item.max})`);
  if (item.bytes > item.max) failed = true;
}
if (failed) process.exit(1);
