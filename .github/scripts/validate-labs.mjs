import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const CATEGORIES = ['contact-center', 'unified-comms', 'protocols', 'ai', 'tools', 'texts'];
const APP_COUNT = 11;
const KINDS = ['lab', 'gallery'];
const STATUSES = ['live', 'beta', 'coming-soon', 'archived'];
const ICONS = ['headset', 'handset', 'cloud-phone', 'waveform', 'nodes', 'chat', 'spark', 'gem', 'video', 'route', 'book', 'shield'];
const ACCENTS = ['peach', 'sky', 'mint', 'lavender', 'butter', 'pink'];
const LEVELS = ['starter', 'explorer', 'navigator', 'pilot'];
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LAB_URL = /^https:\/\/(?:cyphermonkeylabs\.com\/[A-Za-z0-9._-]+|cipher0x9\.github\.io\/gemini-gems-free-gallery)(?:\/[A-Za-z0-9._~%-]*)*$/;
const REPO_URL = /^https:\/\/github\.com\/(?:CypherMonkeyLabs\/[A-Za-z0-9._-]+|cipher0x9\/gemini-gems-free-gallery)$/;
const ALLOWED = new Set([
  'schemaVersion', 'id', 'kind', 'title', 'shortTitle', 'tagline', 'summary', 'category',
  'secondaryCategories', 'tags', 'status', 'featured', 'order', 'level', 'estHours', 'modules',
  'url', 'repo', 'icon', 'accent', 'vendorsReferenced', 'launchedAt', 'updatedAt', 'lastVerified',
  'sources', 'i18n', 'scene',
]);

function rowsOf(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.labs)) return data.labs;
  return null;
}

export function detectMode(data) {
  const rows = rowsOf(data);
  if (!rows) return 'invalid';
  return rows.some((row) => row && Object.prototype.hasOwnProperty.call(row, 'schemaVersion')) ? 'pack3' : 'legacy';
}

function dateStamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function ageDays(stamp, today) {
  const delta = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${stamp}T00:00:00Z`);
  return Math.round(delta / 86_400_000);
}

function repoName(url) {
  return (new URL(url).pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
}

function pagesRepo(url) {
  return (new URL(url).pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
}

function push(list, level, message) {
  list.push({ level, message });
}

function checkPack3(rows) {
  const findings = [];
  const ids = new Map();
  const orders = new Map();
  rows.forEach((lab, index) => {
    const where = `labs[${index}]`;
    if (!lab || typeof lab !== 'object' || Array.isArray(lab)) {
      push(findings, 'error', `${where} is not an object`);
      return;
    }
    for (const key of Object.keys(lab)) {
      if (!ALLOWED.has(key)) push(findings, 'error', `${where} has unknown property ${key}`);
    }
    if (lab.schemaVersion !== 1) push(findings, 'error', `${where}.schemaVersion must be 1`);
    if (typeof lab.id !== 'string' || !ID_PATTERN.test(lab.id) || lab.id.length > 40) push(findings, 'error', `${where}.id is invalid`);
    else if (ids.has(lab.id)) push(findings, 'error', `${where}.id duplicates ${lab.id}`);
    else ids.set(lab.id, index);
    if (!KINDS.includes(lab.kind)) push(findings, 'error', `${where}.kind is invalid`);
    if (typeof lab.title !== 'string' || lab.title.length < 3 || lab.title.length > 48) push(findings, 'error', `${where}.title length`);
    if (lab.shortTitle != null && (typeof lab.shortTitle !== 'string' || lab.shortTitle.length > 16)) push(findings, 'error', `${where}.shortTitle`);
    if (typeof lab.tagline !== 'string' || lab.tagline.length < 10 || lab.tagline.length > 90) push(findings, 'error', `${where}.tagline length`);
    if (typeof lab.summary !== 'string' || lab.summary.length < 80 || lab.summary.length > 320) push(findings, 'error', `${where}.summary length`);
    if (!CATEGORIES.includes(lab.category)) push(findings, 'error', `${where}.category is invalid`);
    if (lab.secondaryCategories != null) {
      if (!Array.isArray(lab.secondaryCategories) || lab.secondaryCategories.length > 2 || new Set(lab.secondaryCategories).size !== lab.secondaryCategories.length) {
        push(findings, 'error', `${where}.secondaryCategories`);
      } else if (lab.secondaryCategories.some((item) => !CATEGORIES.includes(item) || item === lab.category)) {
        push(findings, 'error', `${where}.secondaryCategories`);
      }
    }
    if (!STATUSES.includes(lab.status)) push(findings, 'error', `${where}.status is invalid`);
    if (typeof lab.url !== 'string' || !LAB_URL.test(lab.url)) push(findings, 'error', `${where}.url must be a cyphermonkeylabs.com/<repo>/ URL or the Gemini gallery URL`);
    if (typeof lab.repo !== 'string' || !REPO_URL.test(lab.repo)) push(findings, 'error', `${where}.repo must be a CypherMonkeyLabs GitHub repo or the Gemini gallery repo`);
    if (typeof lab.url === 'string' && typeof lab.repo === 'string' && LAB_URL.test(lab.url) && REPO_URL.test(lab.repo)) {
      if (pagesRepo(lab.url) !== repoName(lab.repo)) push(findings, 'error', `${where} url slug and repo name differ`);
    }
    if (!ICONS.includes(lab.icon)) push(findings, 'error', `${where}.icon is invalid`);
    const launched = dateStamp(lab.launchedAt);
    const verified = dateStamp(lab.lastVerified);
    const today = todayStamp();
    if (!launched) push(findings, 'error', `${where}.launchedAt must be YYYY-MM-DD`);
    else if (launched > today) push(findings, 'error', `${where}.launchedAt is in the future`);
    if (!verified) push(findings, 'error', `${where}.lastVerified must be YYYY-MM-DD`);
    else if (verified > today) push(findings, 'error', `${where}.lastVerified is in the future`);
    else if (lab.status === 'live' || lab.status === 'beta') {
      const age = ageDays(verified, today);
      if (age > 365) push(findings, 'error', `${where}.lastVerified is older than 365 days`);
      else if (age > 180) push(findings, 'warning', `${where}.lastVerified is older than 180 days`);
    }
    if (!Array.isArray(lab.sources)) push(findings, 'error', `${where}.sources must be an array`);
    else {
      if ((lab.status === 'live' || lab.status === 'beta') && lab.sources.length < 1) push(findings, 'error', `${where}.sources needs at least one entry`);
      lab.sources.forEach((source, sourceIndex) => {
        if (!source || typeof source.title !== 'string' || !source.title || source.title.length > 140) push(findings, 'error', `${where}.sources[${sourceIndex}].title`);
        if (!source || typeof source.url !== 'string' || !source.url.startsWith('https://')) push(findings, 'error', `${where}.sources[${sourceIndex}].url`);
      });
    }
    if (lab.order != null) {
      if (!Number.isInteger(lab.order) || lab.order < 0 || lab.order > 9999) push(findings, 'error', `${where}.order is invalid`);
      else if (lab.category) {
        const key = `${lab.category}:${lab.order}`;
        if (orders.has(key)) push(findings, 'error', `${where}.order duplicates another lab in ${lab.category}`);
        orders.set(key, lab.id);
      }
    }
    if (lab.tags != null) {
      if (!Array.isArray(lab.tags) || lab.tags.length > 8 || new Set(lab.tags).size !== lab.tags.length) push(findings, 'error', `${where}.tags`);
      else if (lab.tags.some((tag) => typeof tag !== 'string' || !/^[a-z0-9-]+$/.test(tag))) push(findings, 'error', `${where}.tags`);
    }
    if (lab.vendorsReferenced != null && (!Array.isArray(lab.vendorsReferenced) || lab.vendorsReferenced.some((name) => typeof name !== 'string' || name.length > 60))) {
      push(findings, 'error', `${where}.vendorsReferenced`);
    }
    if (lab.level != null && !LEVELS.includes(lab.level)) push(findings, 'error', `${where}.level`);
    if (lab.accent != null && !ACCENTS.includes(lab.accent)) push(findings, 'error', `${where}.accent`);
    if (lab.scene != null) {
      const sceneKeys = ['size', 'moons', 'ringHint'];
      if (typeof lab.scene !== 'object' || Object.keys(lab.scene).some((key) => !sceneKeys.includes(key))) push(findings, 'error', `${where}.scene`);
      else if (lab.scene.size != null && (typeof lab.scene.size !== 'number' || lab.scene.size < 0.6 || lab.scene.size > 1.6)) push(findings, 'error', `${where}.scene.size`);
    }
  });
  return findings;
}

function checkLegacy(rows) {
  const findings = [];
  const ids = new Set();
  rows.forEach((lab, index) => {
    const where = `labs[${index}]`;
    if (!lab || typeof lab !== 'object') {
      push(findings, 'error', `${where} is not an object`);
      return;
    }
    if (typeof lab.id !== 'string' || !ID_PATTERN.test(lab.id)) push(findings, 'error', `${where}.id is invalid`);
    else if (ids.has(lab.id)) push(findings, 'error', `${where}.id duplicates ${lab.id}`);
    else ids.add(lab.id);
    const title = lab.title || lab.name;
    if (typeof title !== 'string' || title.length < 3) push(findings, 'error', `${where} needs a title`);
    const status = String(lab.status || '');
    if (!['live', 'beta', 'coming', 'coming-soon', 'archived'].includes(status)) push(findings, 'error', `${where}.status is invalid`);
    const url = String(lab.url || '');
    const repo = String(lab.repo || lab.source || '');
    const open = status === 'live' || status === 'beta';
    if (open && !url.startsWith('https://')) push(findings, 'error', `${where} live lab needs an https URL`);
    else if (url && !url.startsWith('https://')) push(findings, 'error', `${where}.url must be https when set`);
    if (repo && !REPO_URL.test(repo)) push(findings, 'error', `${where} repo must be https://github.com/CypherMonkeyLabs/<name> or the Gemini gallery repo`);
    if (open && !repo) push(findings, 'warning', `${where} (${lab.id}) has no repo URL`);
    if (open && url.startsWith('https://') && !LAB_URL.test(url.endsWith('/') ? url : `${url}/`)) {
      push(findings, 'warning', `${where} (${lab.id}) is not a cyphermonkeylabs.com/<repo>/ URL`);
    }
  });
  return findings;
}

export function validateManifest(data) {
  const mode = detectMode(data);
  if (mode === 'invalid') return { mode, findings: [{ level: 'error', message: 'Manifest must be a lab array or { labs: [] }' }] };
  const rows = rowsOf(data);
  const findings = mode === 'pack3' ? checkPack3(rows) : checkLegacy(rows);
  return { mode, findings, labs: rows };
}

/** A redirect counts only when the next response is exactly 200. */
export function linkResult(status, nextStatus = null) {
  if (status === 200) return { ok: true, status: 200 };
  if (status >= 300 && status < 400) {
    if (nextStatus === 200) return { ok: true, status: 200, redirected: status };
    return { ok: false, status: nextStatus || status, redirected: status };
  }
  return { ok: false, status };
}

async function fetchStatus(target, headers, signal) {
  const response = await fetch(target, { redirect: 'manual', headers, signal });
  return { status: response.status, location: response.headers.get('location') };
}

export async function probeUrl(url, token = '') {
  const github = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  const target = github && token
    ? `https://api.github.com/repos/${github[1]}/${github[2]}`
    : url;
  const headers = { 'user-agent': 'CypherMonkeyLabsLinkCheck/1.0', accept: 'text/html,application/json' };
  if (github && token) headers.authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const first = await fetchStatus(target, headers, controller.signal);
    if (first.status === 200) return { url, status: 200, ok: true };
    if (first.status >= 300 && first.status < 400 && first.location) {
      const nextUrl = new URL(first.location, target).href;
      const next = await fetchStatus(nextUrl, headers, controller.signal);
      const judged = linkResult(first.status, next.status);
      return { url, ...judged, location: nextUrl };
    }
    const judged = linkResult(first.status);
    return { url, ...judged };
  } catch (error) {
    return { url, status: 0, ok: false, error: error.name };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkLabLinks(labs, { sources = false, token = '' } = {}) {
  const jobs = [];
  for (const lab of labs) {
    if (lab.url) jobs.push({ url: lab.url, kind: 'url', id: lab.id, level: 'error' });
    const repo = lab.repo || lab.source;
    if (repo) jobs.push({ url: repo, kind: 'repo', id: lab.id, level: 'error' });
    if (sources && Array.isArray(lab.sources)) {
      for (const source of lab.sources) {
        if (source?.url) jobs.push({ url: source.url, kind: 'source', id: lab.id, level: 'warning' });
      }
    }
  }
  const unique = [...new Map(jobs.map((job) => [job.url + job.level, job])).values()];
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const job = unique[cursor];
      cursor += 1;
      const result = await probeUrl(job.url, token);
      results.push({ ...job, ...result });
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, unique.length) }, worker));
  return results;
}

export const FRONT_DOOR = 'https://cyphermonkeylabs.com/';

export function structuredLabUrls(html) {
  const urls = [];
  const scripts = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const match of scripts) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
    for (const node of nodes) {
      const entries = Array.isArray(node.itemListElement) ? node.itemListElement : [];
      for (const entry of entries) {
        const url = entry && entry.item && entry.item.url;
        if (typeof url === 'string') urls.push(url);
      }
    }
  }
  return urls;
}

function printFindings(file, result) {
  console.log(`${file}: mode=${result.mode} labs=${result.labs?.length ?? 0}`);
  for (const finding of result.findings) console.log(`  ${finding.level}: ${finding.message}`);
}

async function main() {
  const args = process.argv.slice(2);
  const expectFail = args.includes('--expect-fail');
  const checkUrls = args.includes('--check-urls') || args.includes('--ci');
  const files = args.filter((arg) => !arg.startsWith('--'));
  const targets = files.length ? files : [];
  if (args.includes('--ci')) {
    targets.push('.github/fixtures/labs-pack3.json');
  }
  if (!targets.length) {
    console.error('Usage: validate-labs.mjs [--check-urls] [--expect-fail] [--ci] <file...>');
    process.exit(2);
  }
  let failed = false;
  for (const file of targets) {
    const data = JSON.parse(await readFile(file, 'utf8'));
    const result = validateManifest(data);
    printFindings(file, result);
    const errors = result.findings.filter((item) => item.level === 'error');
    if (expectFail) {
      if (!errors.length) {
        console.error(`  expected ${file} to fail`);
        failed = true;
      }
      continue;
    }
    if (errors.length) failed = true;
    if (checkUrls && result.labs) {
      const links = await checkLabLinks(result.labs, { token: process.env.GITHUB_TOKEN || '' });
      for (const link of links) {
        const line = `  ${link.ok ? 'ok' : 'fail'} ${link.status} ${link.kind} ${link.id} ${link.url}`;
        console.log(line);
        if (!link.ok) failed = true;
      }
    }
  }
  if (args.includes('--ci')) {
    const { readFile: read } = await import('node:fs/promises');
    const { access } = await import('node:fs/promises');
    const invalid = JSON.parse(await read('.github/fixtures/labs-invalid.json', 'utf8'));
    const invalidResult = validateManifest(invalid);
    if (!invalidResult.findings.some((item) => item.level === 'error')) {
      console.error('invalid fixture was accepted');
      failed = true;
    } else console.log('labs-invalid.json: rejected as expected');
    try {
      await access('data/labs.json');
      console.log('data/labs.json: present, validating');
      const live = JSON.parse(await read('data/labs.json', 'utf8'));
      const liveResult = validateManifest(live);
      printFindings('data/labs.json', liveResult);
      if (liveResult.findings.some((item) => item.level === 'error')) failed = true;
      if ((liveResult.labs || []).length !== APP_COUNT) {
        console.error(`  fail expected ${APP_COUNT} apps, found ${liveResult.labs?.length ?? 0}`);
        failed = true;
      }
      const legacyDoc = JSON.parse(await read('labs.json', 'utf8'));
      const legacyCount = validateManifest(legacyDoc);
      if ((legacyCount.labs || []).length !== APP_COUNT) {
        console.error(`  fail labs.json expected ${APP_COUNT} apps, found ${legacyCount.labs?.length ?? 0}`);
        failed = true;
      } else console.log(`labs.json: ${APP_COUNT} apps`);
      const links = await checkLabLinks(liveResult.labs || [], { token: process.env.GITHUB_TOKEN || '' });
      for (const link of links) {
        console.log(`  ${link.ok ? 'ok' : 'fail'} ${link.status} ${link.kind} ${link.id} ${link.url}`);
        if (!link.ok) failed = true;
      }
      const page = await read('index.html', 'utf8');
      const structured = structuredLabUrls(page);
      const manifestUrls = (liveResult.labs || []).map((lab) => lab.url).filter(Boolean);
      const manifestSet = new Set(manifestUrls);
      for (const url of structured) {
        if (!manifestSet.has(url)) {
          console.error(`  fail structured data URL is not in the manifest ${url}`);
          failed = true;
        }
      }
      for (const url of manifestUrls) {
        if (!structured.includes(url)) {
          console.error(`  fail manifest URL missing from structured data ${url}`);
          failed = true;
        }
      }
      const extra = structured.filter((url) => !manifestSet.has(url));
      for (const url of extra) {
        const probed = await probeUrl(url);
        console.log(`  ${probed.ok ? 'ok' : 'fail'} ${probed.status} structured ${url}`);
        if (!probed.ok) failed = true;
      }
      const door = await probeUrl(FRONT_DOOR);
      console.log(`  ${door.ok ? 'ok' : 'fail'} ${door.status} front-door ${FRONT_DOOR}`);
      if (!door.ok) failed = true;
    } catch {
      console.log('::warning::data/labs.json is not on this branch yet. Checking legacy labs.json.');
      const legacy = JSON.parse(await read('labs.json', 'utf8'));
      const legacyResult = validateManifest(legacy);
      printFindings('labs.json', legacyResult);
      if (legacyResult.findings.some((item) => item.level === 'error')) failed = true;
      const links = await checkLabLinks(legacyResult.labs || [], { token: process.env.GITHUB_TOKEN || '' });
      for (const link of links) {
        console.log(`  ${link.ok ? 'ok' : 'fail'} ${link.status} ${link.kind} ${link.id} ${link.url}`);
        if (!link.ok) failed = true;
      }
    }
  }
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
