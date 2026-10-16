import { access, readFile } from 'node:fs/promises';
import { FRONT_DOOR, checkLabLinks, probeUrl, validateManifest } from './validate-labs.mjs';

async function loadManifest() {
  try {
    await access('data/labs.json');
    return { file: 'data/labs.json', data: JSON.parse(await readFile('data/labs.json', 'utf8')) };
  } catch {
    return { file: 'labs.json', data: JSON.parse(await readFile('labs.json', 'utf8')) };
  }
}

const { file, data } = await loadManifest();
const result = validateManifest(data);
const errors = result.findings.filter((item) => item.level === 'error');
const links = await checkLabLinks(result.labs || [], {
  sources: true,
  token: process.env.GITHUB_TOKEN || '',
});
const door = await probeUrl(FRONT_DOOR);
links.push({ url: FRONT_DOOR, kind: 'front-door', id: 'front-door', level: 'error', ...door });
const broken = links.filter((link) => !link.ok && link.level === 'error');
const warnings = [
  ...result.findings.filter((item) => item.level === 'warning'),
  ...links.filter((link) => !link.ok && link.level === 'warning'),
];
const lines = [
  `Manifest: ${file} (${result.mode})`,
  '',
  'Broken lab or repo URLs:',
  ...(broken.length ? broken.map((link) => `- ${link.status} ${link.id} ${link.url}`) : ['- none']),
  '',
  'Schema errors:',
  ...(errors.length ? errors.map((item) => `- ${item.message}`) : ['- none']),
  '',
  'Warnings:',
  ...(warnings.length ? warnings.map((item) => `- ${item.message || `${item.status} ${item.id} ${item.url}`}`) : ['- none']),
];
const body = lines.join('\n');
console.log(body);
const unhealthy = errors.length > 0 || broken.length > 0;

if (process.env.CREATE_ISSUE === '1' && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
  const title = 'Lab health: a lab URL needs attention';
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const headers = {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'CypherMonkeyLabsLabHealth',
  };
  const search = new URL('https://api.github.com/search/issues');
  search.searchParams.set('q', `repo:${owner}/${repo} is:issue is:open in:title "Lab health:"`);
  const existing = await fetch(search, { headers }).then((response) => response.json());
  const issue = existing.items && existing.items[0];
  if (unhealthy) {
    if (issue) {
      await fetch(issue.url, { method: 'PATCH', headers, body: JSON.stringify({ title, body }) });
    } else {
      await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, body }),
      });
    }
  } else if (issue) {
    await fetch(`${issue.comments_url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: 'Lab URLs and repos responded again. Closing this health note.' }),
    });
    await fetch(issue.url, { method: 'PATCH', headers, body: JSON.stringify({ state: 'closed' }) });
  }
}

if (unhealthy) process.exit(1);
