/** HTML fragments for the hub. Shared by the build script and the browser. */

const LEVEL_LABEL = {
  starter: 'Starter',
  explorer: 'Explorer',
  navigator: 'Navigator',
  'deep-dive': 'Deep dive',
};

const STATUS_LABEL = {
  live: 'Live',
  beta: 'Beta',
  'coming-soon': 'Coming soon',
  archived: 'Archived',
};

const KIND_LABEL = {
  learning: 'Learning',
  building: 'Building',
  sharing: 'Sharing',
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function levelLabel(level) {
  return LEVEL_LABEL[level] || level;
}

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

function categoryLabel(categories, id) {
  const found = categories.find((item) => item.id === id);
  return found ? found.label : id;
}

export function doorArticle(lab, categories) {
  const cat = categoryLabel(categories, lab.category);
  const openable = lab.status === 'live' || lab.status === 'beta';
  const blob = [lab.title, lab.shortTitle, lab.tagline, lab.id, ...(lab.aliases || []), ...(lab.tags || [])].join(' ');
  const secondary = (lab.secondaryCategories || []).join(' ');
  const attrs = [
    `class="door${openable ? '' : ' is-soon'}${lab.fixture ? ' is-fixture' : ''}"`,
    `style="--accent:${escapeHtml(lab.accent || '#c4b5fd')}"`,
    `data-id="${escapeHtml(lab.id)}"`,
    `data-cat="${escapeHtml(lab.category)}"`,
    `data-secondary="${escapeHtml(secondary)}"`,
    `data-level="${escapeHtml(lab.level || '')}"`,
    `data-status="${escapeHtml(lab.status)}"`,
    `data-blob="${escapeHtml(blob)}"`,
    `data-title="${escapeHtml(lab.title)}"`,
  ].join(' ');
  const meta = `<p class="door-meta"><span class="status">${escapeHtml(statusLabel(lab.status))}</span><span>${escapeHtml(levelLabel(lab.level))}</span></p>`;
  const body = `<p class="door-cat">${escapeHtml(cat)}</p><h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.tagline)}</p>${meta}`;
  if (!openable) {
    return `<article ${attrs}><div class="door-open">${body}<p class="soon">Not open yet</p></div></article>`;
  }
  const source = lab.repo
    ? `<a class="door-repo" href="${escapeHtml(lab.repo)}" target="_blank" rel="noopener noreferrer">Source<span class="vh"> for ${escapeHtml(lab.title)} on GitHub (opens new tab)</span></a>`
    : '';
  return `<article ${attrs}><a class="door-open" href="${escapeHtml(lab.url)}" data-search-item data-kind="lab" data-title="${escapeHtml(lab.title)}" data-href="${escapeHtml(lab.url)}" data-blob="${escapeHtml(blob)}">${body}</a>${source}</article>`;
}

export function timelineItems(entries, options = {}) {
  return entries.map((entry) => {
    const links = (entry.links || [])
      .map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`)
      .join('');
    const blob = `${entry.title} ${entry.summary || ''} ${entry.kind}`;
    const id = options.suffix ? `${entry.id}-${options.suffix}` : entry.id;
    const search = options.suffix
      ? ''
      : ` data-search-item data-kind="timeline" data-title="${escapeHtml(entry.title)}" data-href="#${escapeHtml(entry.id)}" data-blob="${escapeHtml(blob)}"`;
    return `<li data-kind="${escapeHtml(entry.kind)}" data-blob="${escapeHtml(blob)}"><p><span class="k ${escapeHtml(entry.kind)}">${escapeHtml(KIND_LABEL[entry.kind] || entry.kind)}</span> <time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time></p><h3><a href="#${escapeHtml(entry.id)}" id="${escapeHtml(id)}"${search}>${escapeHtml(entry.title)}</a></h3><p>${escapeHtml(entry.summary || '')}</p>${links ? `<p class="tl-links">${links}</p>` : ''}<p class="tl-source">Source: ${escapeHtml(entry.source || 'note')}</p></li>`;
  }).join('');
}

export function socialLink(profile, paths) {
  const label = profile.handle && profile.handle !== profile.label
    ? `${profile.label} · ${profile.handle}`
    : profile.label;
  const name = `Cypher Monkey on ${profile.label} (opens new tab)`;
  const pathHtml = paths.map((d) => `<path fill="#${escapeHtml(profile.hex)}" d="${escapeHtml(d)}"/>`).join('');
  return `<li><a class="coin face-${escapeHtml(profile.face || 'light')}" href="${escapeHtml(profile.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(name)}" data-look="social"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">${pathHtml}</svg><span class="lbl" aria-hidden="true">${escapeHtml(label)}</span></a></li>`;
}

export function chipLinks(categories, prefix) {
  const all = `<a class="chip" data-chip="cat" data-value="" href="${escapeHtml(prefix)}">All</a>`;
  const rest = categories.map((category) => {
    const href = `${prefix}${prefix.includes('?') ? '&' : '?'}cat=${encodeURIComponent(category.id)}`;
    return `<a class="chip" data-chip="cat" data-value="${escapeHtml(category.id)}" href="${escapeHtml(href)}">${escapeHtml(category.label)}</a>`;
  }).join('');
  return all + rest;
}

export function posterSvg() {
  return `<svg class="poster" viewBox="0 0 240 250" role="img" aria-labelledby="poster-title" width="320" height="334">
<title id="poster-title">Cypher Monkey</title>
<defs>
<radialGradient id="fur" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#d39a6a"/><stop offset="1" stop-color="#6e4128"/></radialGradient>
<radialGradient id="face" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#ffe7cf"/><stop offset="1" stop-color="#e7b48a"/></radialGradient>
</defs>
<ellipse cx="120" cy="228" rx="62" ry="12" fill="#a78bfa" opacity=".35"/>
<path d="M78 168c-36 8-52 46-28 62 16 10 30-6 28-22 6 20 28 22 36 4" fill="none" stroke="#6e4128" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="120" cy="176" rx="46" ry="40" fill="url(#fur)"/>
<ellipse cx="120" cy="186" rx="24" ry="22" fill="url(#face)"/>
<path d="M86 150c-20 16-18 40 2 46" fill="none" stroke="#6e4128" stroke-width="12" stroke-linecap="round"/>
<path d="M154 148c24 6 30 28 16 40" fill="none" stroke="#6e4128" stroke-width="12" stroke-linecap="round"/>
<circle cx="70" cy="196" r="8" fill="#ffe7cf" stroke="#3a2418" stroke-width="2"/>
<circle cx="176" cy="184" r="8" fill="#ffe7cf" stroke="#3a2418" stroke-width="2"/>
<ellipse cx="58" cy="108" rx="22" ry="26" fill="url(#fur)"/>
<ellipse cx="182" cy="108" rx="22" ry="26" fill="url(#fur)"/>
<ellipse cx="58" cy="108" rx="11" ry="14" fill="url(#face)"/>
<ellipse cx="182" cy="108" rx="11" ry="14" fill="url(#face)"/>
<circle cx="120" cy="104" r="58" fill="url(#fur)"/>
<ellipse cx="120" cy="116" rx="36" ry="32" fill="url(#face)"/>
<path d="M120 46l6 14 14 2-11 8 3 14-12-8-12 8 3-14-11-8 14-2z" fill="#ffd166" stroke="#3a2418" stroke-width="2" stroke-linejoin="round"/>
<g class="eye" id="poster-eye-l"><ellipse cx="102" cy="108" rx="12" ry="14" fill="#fff" stroke="#3a2418" stroke-width="2"/><circle class="pupil" cx="104" cy="110" r="5" fill="#1b1033"/></g>
<g class="eye" id="poster-eye-r"><ellipse cx="140" cy="108" rx="12" ry="14" fill="#fff" stroke="#3a2418" stroke-width="2"/><circle class="pupil" cx="142" cy="110" r="5" fill="#1b1033"/></g>
<ellipse cx="120" cy="128" rx="7" ry="5" fill="#7a4328"/>
<path d="M104 140c8 10 24 10 32 0" fill="none" stroke="#3a2418" stroke-width="3" stroke-linecap="round"/>
</svg>`;
}

export function zodiacRing(marks) {
  return marks.map((mark, index) => {
    const on = mark.name === 'Monkey' ? ' on' : '';
    return `<span class="mark${on}" style="--i:${index}" title="${escapeHtml(mark.name)}"><span lang="zh-Hans">${escapeHtml(mark.char)}</span></span>`;
  }).join('');
}
