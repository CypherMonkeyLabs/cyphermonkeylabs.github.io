import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countLabs, featuredDoors, mergeTimeline } from '../js/catalog.mjs';
import { chipLinks, doorArticle, escapeHtml, posterSvg, socialLink, timelineItems, zodiacRing } from '../js/render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');

function readJson(name) {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
}

function iconPaths(icon) {
  const svg = readFileSync(join(root, 'assets', 'icons', `${icon}.svg`), 'utf8');
  return [...svg.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]);
}

const labsFile = readJson('labs.json');
const categoriesFile = readJson('categories.json');
const socialsFile = readJson('socials.json');
const timelineFile = readJson('timeline.json');
const site = readJson('site.json');
const labs = labsFile.labs;
const categories = categoriesFile.categories;
function outboundAllowed(url) {
  let parsed;
  try { parsed = new URL(url); } catch (error) { return false; }
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'cyphermonkeylabs.com' || host.endsWith('.cyphermonkeylabs.com')) return true;
  if (host === 'linktr.ee') {
    return (parsed.pathname.split('/').filter(Boolean)[0] || '') === 'CypherMonkey';
  }
  if (host === 'github.com') {
    return (parsed.pathname.split('/').filter(Boolean)[0] || '') === 'CypherMonkeyLabs';
  }
  return false;
}

const profiles = [...socialsFile.profiles]
  .filter((profile) => profile.url && outboundAllowed(profile.url))
  .sort((a, b) => a.order - b.order);
const timeline = mergeTimeline(timelineFile.entries, labs);
const labTotal = countLabs(labs);
const featured = featuredDoors(labs);

const asset = (depth, path) => `${'../'.repeat(depth)}${path}`;

function layoutSwitch() {
  return `<nav class="layout-switch" aria-label="Timeline placement">
    <a data-placement="b" href="?timeline=b">Right column</a>
    <a data-placement="a" href="?timeline=a">Top strip</a>
    <a data-placement="c" href="?timeline=c">Scroll story</a>
  </nav>`;
}

function kindChips() {
  return `<div class="chips" role="group" aria-label="Filter timeline">
    <button type="button" class="chip on" data-kind="">All</button>
    <button type="button" class="chip" data-kind="learning">Learning</button>
    <button type="button" class="chip" data-kind="building">Building</button>
    <button type="button" class="chip" data-kind="sharing">Sharing</button>
  </div>`;
}

function timelineBlock(entries, suffix) {
  const items = timelineItems(entries, suffix ? { suffix } : {});
  return `${kindChips()}<ol class="tl">${items}</ol><p class="empty" data-empty="kind" hidden>No dated notes of that kind yet. Learning and sharing notes are added only when they have a date.</p>`;
}

function header(depth) {
  const home = asset(depth, '');
  return `<a class="skip" href="#doors">Skip to labs</a>
<header class="top">
  <a class="brand" href="${home || './'}">
    <img src="${asset(depth, 'favicon.svg')}" width="34" height="34" alt="">
    <span>Cypher Monkey</span>
  </a>
  <nav class="primary" aria-label="Primary">
    <a href="${asset(depth, '')}#doors">Labs</a>
    <a href="${asset(depth, 'timeline/')}">Timeline</a>
    <a href="${asset(depth, '')}#about">About</a>
    <a href="${escapeHtml(site.contactUrl)}">Contact</a>
  </nav>
  <div class="tools">
    <button type="button" class="pill" id="open-search">Search labs</button>
    <button type="button" class="pill" id="motion" aria-pressed="false">Pause motion</button>
    <a class="pill live" href="${escapeHtml(site.homeUrl)}">Live site</a>
  </div>
</header>`;
}

function rail() {
  const items = profiles.map((profile) => socialLink(profile, iconPaths(profile.icon))).join('');
  return `<nav class="rail" aria-label="Cypher Monkey on social media">
    <h2 class="rail-title">Follow Cypher Monkey</h2>
    <ul>${items}</ul>
  </nav>`;
}

function bar() {
  const globes = site.globes.map((globe) => {
    const extra = globe.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="globe g-${escapeHtml(globe.id)}" href="${escapeHtml(globe.url)}"${extra}><span class="sphere" aria-hidden="true"></span><span class="globe-label">${escapeHtml(globe.label)}</span><span class="vh">${escapeHtml(globe.name)}</span></a>`;
  }).join('');
  return `<footer class="bar">
    <p>${escapeHtml(site.disclaimerShort)} Code MIT · content CC BY-NC-SA 4.0 · <a href="${escapeHtml(site.privacyUrl)}">Privacy</a> · <a href="#disclaimer">More</a></p>
    <div class="globes">${globes}</div>
  </footer>`;
}

function rules() {
  return `<section class="rules" id="disclaimer" aria-labelledby="rules-title">
    <h2 id="rules-title">Ground rules</h2>
    <p>${escapeHtml(site.trademark)}</p>
    <p>${escapeHtml(site.licenseLine)}</p>
    <p><a href="${escapeHtml(site.privacyUrl)}">Privacy</a></p>
  </section>`;
}

function overlays() {
  return `<div class="overlay" id="palette" hidden>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="palette-title">
      <h2 id="palette-title">Search labs</h2>
      <label class="vh" for="palette-input">Search labs and timeline</label>
      <input id="palette-input" type="search" placeholder="Try SIP, Python, agents" autocomplete="off">
      <ul id="palette-list" role="listbox"></ul>
      <p class="hint">Esc closes. Enter opens the highlighted result.</p>
    </div>
  </div>
  <div class="overlay" id="bot" hidden>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="bot-title">
      <h2 id="bot-title">Ask the monkey</h2>
      <p class="hint">Answers come from the lab list and the timeline on this page. Nothing is sent off this site.</p>
      <div id="bot-log" class="bot-log" tabindex="-1"></div>
      <form id="bot-form">
        <label class="vh" for="bot-input">Your question</label>
        <input id="bot-input" type="text" placeholder="Which lab is about SIP?" autocomplete="off">
        <button type="submit" class="btn pri">Ask</button>
      </form>
      <button type="button" class="textish" id="bot-close">Close</button>
    </div>
  </div>`;
}

function shell({ title, description, depth, page, main }) {
  const css = asset(depth, 'css/v2.css');
  const canonical = depth === 0
    ? 'https://cyphermonkeylabs.com/v2/'
    : `https://cyphermonkeylabs.com/v2/${page}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#100c24">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'">
<link rel="icon" href="${asset(depth, 'favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${asset(depth, 'assets/fonts/space-grotesk-700.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${css}">
<script src="${asset(depth, 'js/boot.js')}"></script>
</head>
<body data-page="${escapeHtml(page)}">
${header(depth)}
<div class="wrap">
${main}
${rules()}
</div>
${rail()}
${bar()}
${overlays()}
<script type="module" src="${asset(depth, 'js/main.js')}"></script>
</body>
</html>
`;
}

const homeDoors = featured.map((lab) => doorArticle(lab, categories)).join('');
const allDoors = labs.map((lab) => doorArticle(lab, categories)).join('');
const homeTimeline = timeline.slice(0, 6);
const greetings = JSON.stringify(site.greetings);

const homeMain = `<main>
<div class="front">
  <section class="stage" aria-labelledby="domain">
    <p class="vh" id="stage-desc">A ring of the twelve Chinese zodiac animals, with the monkey mark lit, and Cypher Monkey in the centre.</p>
    <div class="dust" aria-hidden="true"></div>
    <div class="orbit">
      <div class="ring" aria-hidden="true">${zodiacRing(site.zodiac)}</div>
      <div class="monkey-slot">
        ${posterSvg()}
        <div class="floor" aria-hidden="true"></div>
      </div>
    </div>
    <p class="zodiac-symbol" lang="zh-Hans" title="Monkey, the ninth Chinese zodiac animal">猴</p>
    <h1 class="domain" id="domain">${escapeHtml(site.domain)}</h1>
    <p class="who">${escapeHtml(site.tagline)}</p>
    <p class="hello" lang="en">Hello</p>
    <div class="ctas">
      <a class="btn pri" id="explore" href="#doors">Explore ${labTotal} labs</a>
      <button type="button" class="btn sec" id="ask">Ask the monkey</button>
    </div>
    <p class="jump"><a class="timeline-jump" href="#timeline-b">What I'm learning this week</a></p>
    ${layoutSwitch()}
  </section>
  <div class="tl-a" id="timeline-a">
    <h2>What I'm learning, building, sharing</h2>
    <p class="lede">Latest notes. Swipe sideways. Building notes come from lab launch dates.</p>
    ${timelineBlock(homeTimeline, 'a')}
    <p><a href="timeline/">Full log</a></p>
  </div>
  <aside class="side" id="timeline-b" aria-labelledby="tl-title">
    <h2 id="tl-title">What I'm learning, building, sharing</h2>
    <p class="lede">Building notes come from lab launch dates. Learning and sharing notes appear when they have a date.</p>
    ${timelineBlock(homeTimeline, '')}
    <p><a href="timeline/">Full log</a></p>
  </aside>
  <section class="story" id="timeline-c" aria-labelledby="story-title">
    <h2 id="story-title">The story so far</h2>
    <p class="lede">Each stop is something that shipped. Scroll through the dates.</p>
    ${timelineBlock(homeTimeline, 'c')}
    <p><a href="timeline/">Full log</a></p>
  </section>
  <div class="rest" id="doors">
    <section aria-labelledby="doors-title">
      <h2 id="doors-title">${labTotal} free labs</h2>
      <p class="lede">Each card opens a live lab. This front door shows ${featured.length}. The full list holds every lab, and the same list can grow past a hundred.</p>
      <div class="chips" role="group" aria-label="Filter labs">${chipLinks(categories, '?')}</div>
      <div class="level-chips chips" role="group" aria-label="Filter by level">
        <a class="chip" data-chip="level" data-value="" href="?">Any level</a>
        <a class="chip" data-chip="level" data-value="starter" href="?level=starter">Starter</a>
        <a class="chip" data-chip="level" data-value="explorer" href="?level=explorer">Explorer</a>
        <a class="chip" data-chip="level" data-value="navigator" href="?level=navigator">Navigator</a>
      </div>
      <div class="doors">${homeDoors}</div>
      <p class="empty" data-empty="labs" hidden>No labs match that filter.</p>
      <p class="see-all"><a href="labs/">See all ${labTotal} labs</a></p>
    </section>
    <section class="about" id="about" aria-labelledby="about-title">
      <h2 id="about-title">About Cypher Monkey</h2>
      <p>${escapeHtml(site.about)}</p>
      <ol class="path">
        <li>Voice</li><li>Video</li><li>Contact centre</li><li>AI agents</li><li>Coding</li>
      </ol>
      <article class="heading-card">
        <h3>Where I'm heading</h3>
        <p>${escapeHtml(site.heading)}</p>
      </article>
    </section>
  </div>
</div>
</main>
<script type="application/json" id="cm-greetings">${greetings}</script>`;

const labsMain = `<main class="catalog" id="doors">
  <h1>All labs</h1>
  <p class="lede">${labTotal} free labs, plus the gallery. Search and filters stay in the address bar so a view can be shared. <span class="quiet">A larger catalog is at <a href="?fixture=100">?fixture=100</a>.</span></p>
  <form class="finder" role="search" action="" method="get">
    <label for="q">Search labs</label>
    <input id="q" name="q" type="search" placeholder="Title, tag, or topic">
    <button class="btn sec" type="submit">Search</button>
  </form>
  <div class="chips" role="group" aria-label="Filter labs">${chipLinks(categories, '?')}</div>
  <div class="level-chips chips" role="group" aria-label="Filter by level">
    <a class="chip" data-chip="level" data-value="" href="?">Any level</a>
    <a class="chip" data-chip="level" data-value="starter" href="?level=starter">Starter</a>
    <a class="chip" data-chip="level" data-value="explorer" href="?level=explorer">Explorer</a>
    <a class="chip" data-chip="level" data-value="navigator" href="?level=navigator">Navigator</a>
  </div>
  <div class="chips" role="group" aria-label="Filter by status">
    <a class="chip" data-chip="status" data-value="" href="?">Any status</a>
    <a class="chip" data-chip="status" data-value="live" href="?status=live">Live</a>
    <a class="chip" data-chip="status" data-value="beta" href="?status=beta">Beta</a>
    <a class="chip" data-chip="status" data-value="coming-soon" href="?status=coming-soon">Coming soon</a>
  </div>
  <p class="count" id="shown-count"></p>
  <div class="doors">${allDoors}</div>
  <p class="empty" data-empty="labs" hidden>No labs match that filter.</p>
</main>`;

const timelineMain = `<main class="catalog" id="doors">
  <h1>What I'm learning, building, sharing</h1>
  <p class="lede">The full log. Building entries are generated from each lab's launch date. Learning and sharing entries are written only when there is a date to stand on.</p>
  ${timelineBlock(timeline, '')}
</main>`;

function write(file, html) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

write(join(root, 'index.html'), shell({
  title: 'Cypher Monkey Labs · version 2 preview',
  description: 'Cypher Monkey is a lifelong student and AI builder who shares what he learns. Free practice labs, a zodiac monkey, and a timeline.',
  depth: 0,
  page: 'home',
  main: homeMain,
}));

write(join(root, 'labs', 'index.html'), shell({
  title: 'All labs · Cypher Monkey Labs',
  description: `All ${labTotal} free Cypher Monkey labs, with search and filters.`,
  depth: 1,
  page: 'labs',
  main: labsMain,
}));

write(join(root, 'timeline', 'index.html'), shell({
  title: 'Timeline · Cypher Monkey Labs',
  description: 'What Cypher Monkey is learning, building, and sharing.',
  depth: 1,
  page: 'timeline',
  main: timelineMain,
}));

console.log(`built home doors ${featured.length}, labs ${labs.length}, timeline ${timeline.length}`);
