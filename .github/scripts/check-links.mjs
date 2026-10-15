import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const roots = ['privacy.html', '404.html', 'trust-demo.html', 'js/trust', 'css/trust.css', 'worker/contact/src'];
const optionalHosts = new Set(['contact.cyphermonkeylabs.com']);
const optionalLocal = new Set(['/data/labs.json']);
const skipExternal = new Set(['https://challenges.cloudflare.com/turnstile/v0/siteverify', 'http://www.w3.org/2000/svg']);

async function filesIn(entry, out) {
  const info = await stat(entry);
  if (info.isDirectory()) {
    for (const name of await readdir(entry)) await filesIn(path.join(entry, name), out);
    return;
  }
  out.push(entry);
}

function collect(text) {
  const found = new Set();
  const patterns = [
    /(?:href|action|src)\s*=\s*["']([^"']+)["']/g,
    /["'](https?:\/\/[^"'\s]+)["']/g,
    /["'](\/(?:[^"'\s]*))["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) found.add(match[1]);
  }
  return found;
}

async function exists(urlPath) {
  const clean = urlPath.split('?')[0].split('#')[0];
  const rel = clean === '/' || clean === '' ? 'index.html' : clean.replace(/^\//, '');
  try {
    await stat(rel);
    return true;
  } catch {
    return false;
  }
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'CypherMonkeyLabsLinkCheck/1.0' },
      signal: controller.signal,
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

const files = [];
for (const root of roots) await filesIn(root, files);
const links = new Set();
for (const file of files) {
  const text = await readFile(file, 'utf8');
  if (text.includes('href="#"') || text.includes("href='#'") || text.includes('href=""')) {
    console.error(`empty link in ${file}`);
    process.exit(1);
  }
  for (const link of collect(text)) links.add(link);
}

let failed = false;
const external = [];
for (const link of links) {
  if (link.startsWith('mailto:') || link === '#' || link === '') {
    console.error(`bad link ${link}`);
    failed = true;
    continue;
  }
  if (link.startsWith('http://') || link.startsWith('https://')) {
    if (!skipExternal.has(link)) external.push(link);
    continue;
  }
  if (link.startsWith('/')) {
    if (optionalLocal.has(link.split('?')[0].split('#')[0])) {
      const present = await exists(link);
      console.log(present ? `ok ${link}` : `::warning::optional manifest not in this branch yet ${link}`);
      continue;
    }
    const ok = await exists(link);
    if (!ok) {
      console.error(`missing local target ${link}`);
      failed = true;
    }
  }
}

const uniqueExternal = [...new Set(external)];
let cursor = 0;
const results = [];
async function worker() {
  while (cursor < uniqueExternal.length) {
    const url = uniqueExternal[cursor];
    cursor += 1;
    const host = new URL(url).host;
    const ok = await probe(url);
    results.push({ url, host, ok });
  }
}
await Promise.all(Array.from({ length: Math.min(4, uniqueExternal.length) }, worker));
for (const result of results) {
  if (result.ok) {
    console.log(`ok ${result.url}`);
    continue;
  }
  if (optionalHosts.has(result.host)) {
    console.log(`::warning::optional host not live yet ${result.url}`);
    continue;
  }
  console.error(`fail ${result.url}`);
  failed = true;
}
if (failed) process.exit(1);
console.log(`checked ${uniqueExternal.length} external links`);
