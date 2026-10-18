/** Lab catalog, search, and timeline helpers. No DOM. */

export const FEATURED_LIMIT = 12;

const HOME_KINDS = new Set(['learning', 'building', 'sharing']);

export function countLabs(labs) {
  return labs.filter((lab) => lab.kind === 'lab').length;
}

export function isOpenable(lab) {
  return lab.status === 'live' || lab.status === 'beta';
}

function byUpdated(a, b) {
  const date = (b.updatedAt || '').localeCompare(a.updatedAt || '');
  if (date !== 0) return date;
  return (a.order || 0) - (b.order || 0);
}

export function featuredDoors(labs, limit = FEATURED_LIMIT) {
  const visible = labs.filter((lab) => lab.status !== 'archived');
  const pinned = visible.filter((lab) => lab.featured).sort(byUpdated);
  const rest = visible.filter((lab) => !lab.featured).sort(byUpdated);
  const out = [];
  const seen = new Set();
  for (const lab of pinned.concat(rest)) {
    if (seen.has(lab.id)) continue;
    seen.add(lab.id);
    out.push(lab);
    if (out.length >= limit) break;
  }
  return out;
}

function fold(value) {
  return String(value || '').toLowerCase();
}

export function labBlob(lab) {
  return [
    lab.title,
    lab.shortTitle,
    lab.tagline,
    lab.summary,
    lab.id,
    ...(lab.aliases || []),
    ...(lab.tags || []),
    lab.category,
  ].join(' ');
}

export function searchScore(lab, query) {
  const q = fold(query).trim();
  if (!q) return 1;
  const title = fold(lab.title);
  const short = fold(lab.shortTitle);
  const id = fold(lab.id);
  const aliases = (lab.aliases || []).map(fold);
  if (title.includes(q) || short.includes(q) || id === q || aliases.includes(q)) return 3;
  const blob = fold(labBlob(lab));
  if (blob.includes(q)) return 2;
  const needle = q.replace(/\s+/g, '');
  const hay = blob.replace(/\s+/g, '');
  let index = 0;
  for (const char of hay) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return 1;
  }
  return 0;
}

export function filterLabs(labs, params) {
  const cat = params.cat || params.category || '';
  const level = params.level || '';
  const status = params.status || '';
  const q = params.q || params.query || '';
  return labs
    .map((lab) => ({ lab, score: searchScore(lab, q) }))
    .filter(({ lab, score }) => {
      if (score === 0) return false;
      if (cat && lab.category !== cat && !(lab.secondaryCategories || []).includes(cat)) return false;
      if (level && lab.level !== level) return false;
      if (status && lab.status !== status) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || byUpdated(a.lab, b.lab))
    .map(({ lab }) => lab);
}

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

function countWord(count) {
  return NUMBER_WORDS[count] || String(count);
}

export function buildingEntries(labs) {
  const groups = new Map();
  for (const lab of labs) {
    if (lab.kind !== 'lab' || !lab.launchedAt) continue;
    const list = groups.get(lab.launchedAt) || [];
    list.push(lab);
    groups.set(lab.launchedAt, list);
  }
  return [...groups.entries()].map(([date, group]) => {
    const ordered = [...group].sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
    const single = ordered.length === 1;
    return {
      id: `ship-${date}`,
      date,
      kind: 'building',
      title: single ? `${ordered[0].title} is live` : `${countWord(ordered.length)} labs opened`,
      summary: single ? ordered[0].tagline : ordered.map((lab) => lab.shortTitle).join(', '),
      labIds: ordered.map((lab) => lab.id),
      links: ordered.map((lab) => ({ label: lab.shortTitle, url: lab.url })),
      source: 'registry',
    };
  });
}

export function mergeTimeline(manual, labs) {
  const entries = [...(manual || []), ...buildingEntries(labs)];
  return entries
    .filter((entry) => entry && entry.date && entry.title && HOME_KINDS.has(entry.kind))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function latestTimeline(entries, limit = 6) {
  return entries.slice(0, limit);
}

export function deniedLinks(hrefs, denyHosts) {
  const bad = [];
  for (const href of hrefs) {
    let host = '';
    try {
      host = new URL(href).hostname.toLowerCase();
    } catch {
      continue;
    }
    for (const deny of denyHosts) {
      const needle = deny.toLowerCase();
      if (host === needle || host.endsWith(`.${needle}`)) bad.push(href);
    }
  }
  return bad;
}

export function makeFixtureLabs(count, seedLabs) {
  const categories = ['ai', 'coding', 'contact-center', 'voice-video', 'protocols', 'business', 'texts-languages', 'agents', 'galleries'];
  const levels = ['starter', 'explorer', 'navigator'];
  const source = seedLabs.length ? seedLabs : [{ url: '#', accent: '#c4b5fd', tagline: 'Preview door' }];
  const labs = [];
  for (let index = 0; index < count; index += 1) {
    const seed = source[index % source.length];
    labs.push({
      schemaVersion: 2,
      id: `fixture-${index + 1}`,
      aliases: [],
      kind: 'lab',
      title: `Practice door ${index + 1}`,
      shortTitle: `Door ${index + 1}`,
      tagline: 'Preview data so the catalog can be checked at a larger size.',
      summary: 'This door is generated for review. It is not a new lab.',
      category: categories[index % categories.length],
      secondaryCategories: [],
      tags: ['preview'],
      level: levels[index % levels.length],
      status: index === count - 1 ? 'coming-soon' : 'live',
      url: seed.url,
      repo: '',
      accent: seed.accent || '#c4b5fd',
      launchedAt: '2026-01-01',
      updatedAt: '2026-10-18',
      lastVerified: '2026-10-18',
      featured: index < 4,
      order: index,
      sources: [],
      fixture: true,
    });
  }
  return labs;
}
