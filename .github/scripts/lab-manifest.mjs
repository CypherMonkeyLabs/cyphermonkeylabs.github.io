// Lab manifest handling for the auto-update hook.
//   node .github/scripts/lab-manifest.mjs --repo OWNER/NAME --sha SHA        (one lab, from a dispatch)
//   node .github/scripts/lab-manifest.mjs --reconcile                        (every repo with topic cml-lab)
//   node .github/scripts/lab-manifest.mjs --file path/to/lab.manifest.json --repo OWNER/NAME   (local, for tests)
// Writes data/labs.json in place and a summary to $LAB_SYNC_SUMMARY (default lab-sync-summary.md).
// Needs GITHUB_TOKEN (read access to public repos is enough). No dependencies.
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { validateManifest, LAB_OWNERS } from './validate-labs.mjs';

export const LAB_FIELDS = [
  'schemaVersion', 'id', 'kind', 'title', 'shortTitle', 'tagline', 'summary', 'category', 'secondaryCategories',
  'tags', 'status', 'level', 'estHours', 'modules', 'url', 'icon', 'vendorsReferenced', 'launchedAt', 'sources',
];
export const SITE_FIELDS = ['order', 'featured', 'accent', 'scene', 'i18n'];
const ACCENTS = ['peach', 'sky', 'mint', 'lavender', 'butter', 'pink'];
const REPO_RE = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/;
const SHA_RE = /^[0-9a-f]{40}$/;

export function parseRepo(value) {
  const m = REPO_RE.exec(String(value || ''));
  if (!m || !LAB_OWNERS.some((o) => o.toLowerCase() === m[1].toLowerCase())) return null;
  return { owner: LAB_OWNERS.find((o) => o.toLowerCase() === m[1].toLowerCase()), name: m[2], full: `${m[1]}/${m[2]}` };
}

function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

export function defaultScene(id) {
  const h = hash(id);
  return { size: Math.round((1 + (h % 40) / 100) * 100) / 100, moons: h % 3, ringHint: (h >> 3) % 4 };
}

export function stamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Pick only lab-owned fields; reject anything else so a lab cannot set site-owned fields. */
export function checkManifestShape(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['manifest is not an object'];
  for (const key of Object.keys(manifest)) {
    if (key === '$schema') continue;
    if (!LAB_FIELDS.includes(key)) errors.push(`unknown or site-owned field "${key}" (site fields: ${SITE_FIELDS.join(', ')}, repo, updatedAt, lastVerified)`);
  }
  return errors;
}

/**
 * Merge one manifest into a labs document (the parsed data/labs.json).
 * Returns { doc, changed, action, errors }. Does not mutate the input.
 */
export function mergeManifest(doc, manifest, repoFull, today = stamp()) {
  const errors = checkManifestShape(manifest);
  const repo = parseRepo(repoFull);
  if (!repo) errors.push(`repo "${repoFull}" is not under an allowed owner (${LAB_OWNERS.join(', ')})`);
  if (errors.length) return { doc, changed: false, action: 'rejected', errors };

  const next = structuredClone(doc);
  const labs = next.labs;
  const repoUrl = `https://github.com/${repo.full}`;
  const incoming = {};
  for (const key of LAB_FIELDS) if (manifest[key] !== undefined) incoming[key] = manifest[key];

  const byId = labs.findIndex((l) => l.id === incoming.id);
  const byRepo = labs.findIndex((l) => String(l.repo || '').toLowerCase() === repoUrl.toLowerCase());
  if (byId !== -1 && byRepo !== -1 && byId !== byRepo) return { doc, changed: false, action: 'rejected', errors: [`id "${incoming.id}" belongs to a different lab than repo ${repo.full}`] };
  if (byId !== -1 && labs[byId].repo && String(labs[byId].repo).toLowerCase() !== repoUrl.toLowerCase()) {
    // Allow a deliberate move between allowed owners (transfer): same repo name only.
    const oldName = String(labs[byId].repo).split('/').pop().toLowerCase();
    if (oldName !== repo.name.toLowerCase()) return { doc, changed: false, action: 'rejected', errors: [`id "${incoming.id}" is already used by ${labs[byId].repo}`] };
  }
  const index = byId !== -1 ? byId : byRepo;

  let entry;
  let action;
  if (index === -1) {
    action = 'add';
    const cat = labs.filter((l) => l.category === incoming.category).map((l) => l.order || 0);
    entry = {
      ...incoming,
      repo: repoUrl,
      featured: false,
      order: (cat.length ? Math.max(...cat) : 0) + 10,
      accent: ACCENTS[hash(incoming.id) % ACCENTS.length],
      scene: defaultScene(incoming.id),
      updatedAt: today,
      lastVerified: today,
    };
  } else {
    action = 'update';
    const old = labs[index];
    entry = { ...old };
    for (const key of LAB_FIELDS) if (!(key in incoming)) delete entry[key];
    Object.assign(entry, incoming, { repo: repoUrl });
    for (const key of SITE_FIELDS) if (old[key] !== undefined) entry[key] = old[key];
    entry.updatedAt = today;
    entry.lastVerified = today;
  }
  // Keep key order stable: schemaVersion first, then the rest as built.
  if (index === -1) labs.push(entry); else labs[index] = entry;
  const before = JSON.stringify(doc.labs);
  const comparable = (e) => JSON.stringify({ ...e, updatedAt: undefined, lastVerified: undefined });
  const changed = index === -1 || comparable(doc.labs[index]) !== comparable(entry);
  if (!changed) return { doc, changed: false, action: 'unchanged', errors: [] };
  next.verifiedOn = today;

  const result = validateManifest(next);
  const bad = result.findings.filter((f) => f.level === 'error').map((f) => f.message);
  if (bad.length) return { doc, changed: false, action: 'rejected', errors: bad };
  void before;
  return { doc: next, changed: true, action, errors: [] };
}

async function gh(path, token) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'cml-lab-sync', ...(token ? { authorization: `Bearer ${token}` } : {}), 'x-github-api-version': '2022-11-28' },
  });
  if (!res.ok) throw Object.assign(new Error(`GET ${path} -> ${res.status}`), { status: res.status });
  return res.json();
}

export async function fetchManifest(repoFull, ref, token) {
  const file = await gh(`/repos/${repoFull}/contents/lab.manifest.json?ref=${encodeURIComponent(ref)}`, token);
  if (file.size > 64 * 1024) throw new Error('lab.manifest.json larger than 64 KB');
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (n) => { const i = args.indexOf(n); return i === -1 ? '' : args[i + 1]; };
  const token = process.env.GITHUB_TOKEN || '';
  const summaryPath = process.env.LAB_SYNC_SUMMARY || 'lab-sync-summary.md';
  const docPath = 'data/labs.json';
  let doc = JSON.parse(await readFile(docPath, 'utf8'));
  const lines = [];
  const changedIds = [];
  let failed = false;

  const targets = [];
  if (args.includes('--reconcile')) {
    const owners = LAB_OWNERS.map((o) => `user:${o}`).join('+');
    const found = await gh(`/search/repositories?q=topic:cml-lab+${owners}&per_page=100`, token);
    for (const r of found.items) targets.push({ repo: r.full_name, ref: r.default_branch });
    const topical = new Set(found.items.map((r) => r.full_name.toLowerCase()));
    for (const lab of doc.labs) {
      const r = String(lab.repo || '').replace('https://github.com/', '').toLowerCase();
      if (r && !topical.has(r) && lab.kind !== 'gallery') lines.push(`- warning: ${lab.id} (${r}) has no \`cml-lab\` topic; add it so reconcile can see it.`);
    }
  } else {
    const repo = arg('--repo');
    const sha = arg('--sha');
    if (!parseRepo(repo)) { console.error(`repo not allowed: ${repo}`); process.exit(2); }
    if (sha && !SHA_RE.test(sha)) { console.error('sha must be 40 hex chars'); process.exit(2); }
    targets.push({ repo, ref: sha || 'HEAD', file: arg('--file') });
  }

  for (const t of targets) {
    try {
      const manifest = t.file ? JSON.parse(await readFile(t.file, 'utf8')) : await fetchManifest(t.repo, t.ref, token);
      const r = mergeManifest(doc, manifest, t.repo);
      if (r.action === 'rejected') { failed = true; lines.push(`- REJECTED ${t.repo}: ${r.errors.join('; ')}`); continue; }
      if (r.changed) { doc = r.doc; changedIds.push(manifest.id); lines.push(`- ${r.action} \`${manifest.id}\` from ${t.repo}@${t.ref.slice(0, 7)}`); }
      else lines.push(`- unchanged \`${manifest.id}\` (${t.repo})`);
    } catch (e) {
      if (e.status === 404 && args.includes('--reconcile')) lines.push(`- warning: ${t.repo} has topic cml-lab but no lab.manifest.json`);
      else { failed = true; lines.push(`- ERROR ${t.repo}: ${e.message}`); }
    }
  }

  if (changedIds.length) await writeFile(docPath, `${JSON.stringify(doc, null, 2)}\n`);
  await writeFile(summaryPath, `${lines.join('\n')}\n`);
  console.log(lines.join('\n'));
  await setOutput('changed', changedIds.length ? 'true' : 'false');
  await setOutput('ids', changedIds.join(','));
  await setOutput('branch', changedIds.length === 1 && !args.includes('--reconcile') ? `bot/lab-${changedIds[0]}` : 'bot/lab-reconcile');
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
