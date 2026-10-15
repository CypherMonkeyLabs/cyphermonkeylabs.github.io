import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const roots = ['privacy.html', '404.html', 'trust-demo.html', 'js/trust', 'css/trust.css', 'worker/contact/src'];
const optionalHosts = new Set(['contact.cyphermonkeylabs.com']);
const optionalLocal = new Set(['/data/labs.json']);
const skipExternal = new Set(['https://challenges.cloudflare.com/turnstile/v0/siteverify', 'http://www.w3.org/2000/svg']);
const botWallHosts = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']);
const browserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export function classifyProbe({ host, status, error }) {
  if (typeof status === 'number' && status >= 200 && status < 400) return 'ok';
  if (botWallHosts.has(host)) {
    if (status === 404 || status === 410) return 'fail';
    if (status === 401 || status === 403 || status === 429 || error) return 'bot-wall';
  }
  return 'fail';
}

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

async function probe(url, userAgent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': userAgent },
      signal: controller.signal,
    });
    return { status: response.status, error: null };
  } catch (error) {
    const name = error && error.name === 'AbortError' ? 'timeout' : 'network';
    return { status: 0, error: name };
  } finally {
    clearTimeout(timer);
  }
}

async function probeWithRetry(url) {
  const first = await probe(url, 'CypherMonkeyLabsLinkCheck/1.0');
  if (classifyProbe({ host: new URL(url).host, status: first.status, error: first.error }) === 'ok') return first;
  return probe(url, browserAgent);
}

async function main() {
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
      const probed = await probeWithRetry(url);
      results.push({ url, host, ...probed });
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, uniqueExternal.length) }, worker));
  for (const result of results) {
    const kind = classifyProbe(result);
    if (kind === 'ok') {
      console.log(`ok ${result.url}`);
      continue;
    }
    if (optionalHosts.has(result.host)) {
      console.log(`::warning::optional host not live yet ${result.url}`);
      continue;
    }
    if (kind === 'bot-wall') {
      const why = result.error || `HTTP ${result.status}`;
      console.log(`::warning::${result.host} blocked the checker (${why}); the profile URL is unchanged ${result.url}`);
      continue;
    }
    const why = result.error || `HTTP ${result.status}`;
    console.error(`fail ${result.url} ${why}`);
    failed = true;
  }
  if (failed) process.exit(1);
  console.log(`checked ${uniqueExternal.length} external links`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
