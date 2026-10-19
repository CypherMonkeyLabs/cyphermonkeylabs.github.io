import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beyond, bridges, fetched, labs, siblings, sisters } from "./facts.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'";

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[ch]);
}

function assertHref(href) {
  if (!/^[a-z][a-z0-9+.-]*:/i.test(href)) return;
  const url = new URL(href);
  const githubOk = url.hostname === "github.com" && (url.pathname === "/CypherMonkeyLabs" || url.pathname.startsWith("/CypherMonkeyLabs/"));
  const treeOk = url.hostname === "linktr.ee" && url.pathname === "/CypherMonkey";
  const siteOk = url.hostname === "cyphermonkeylabs.com";
  if (url.protocol === "https:" && (githubOk || treeOk || siteOk)) return;
  throw new Error("Blocked outbound link: " + href);
}

function externalAttrs(href) {
  assertHref(href);
  const url = new URL(href, "https://cyphermonkeylabs.com/");
  const external = url.hostname === "github.com" || url.hostname === "linktr.ee";
  if (!external) return "";
  return ` target="_blank" rel="noopener noreferrer"`;
}

function a(href, label, extra) {
  assertHref(href);
  const attrs = externalAttrs(href);
  const note = attrs ? `<span class="vh"> (opens in a new tab)</span>` : "";
  return `<a href="${esc(href)}"${attrs}${extra || ""}>${esc(label)}${note}</a>`;
}

function labBy(slug) {
  const lab = labs.find((item) => item.slug === slug);
  if (!lab) throw new Error("Unknown lab " + slug);
  return lab;
}

function sisterBy(id) {
  const sister = sisters.find((item) => item.id === id);
  if (!sister) throw new Error("Unknown sister " + id);
  return sister;
}

function edgesFor(slug) {
  const lab = labBy(slug);
  const sisterEdges = Object.entries(lab.sisters).map(([id, because]) => ({ id, because, title: sisterBy(id).title }));
  const bridgeEdges = bridges.filter((edge) => edge.a === slug || edge.b === slug).map((edge) => ({
    slug: edge.a === slug ? edge.b : edge.a,
    because: edge.because
  }));
  const siblingEdges = siblings.filter((edge) => edge.a === slug || edge.b === slug).map((edge) => ({
    slug: edge.a === slug ? edge.b : edge.a,
    because: edge.because
  }));
  return { sisterEdges, bridgeEdges, siblingEdges };
}

function relClass(ids) {
  return [...new Set(ids)].map((id) => "rel-" + id).join(" ");
}

function shell({ title, description, canonical, accent, css, script, favicon, home, nav, main, suite }) {
  const cssLinks = css.map((href) => `<link rel="stylesheet" href="${esc(href)}">`).join("\n");
  const scriptTag = [`<script src="${esc(home)}js/chrome.js" defer></script>`, script ? `<script src="${esc(script)}" defer></script>` : ""].filter(Boolean).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#07060f">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<link rel="icon" href="${esc(favicon)}" type="image/svg+xml">
${cssLinks}
</head>
<body data-accent="${esc(accent)}" data-suite="${esc(suite)}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <a class="brand" href="${esc(home)}">
    <img src="${esc(favicon)}" width="34" height="34" alt="">
    <span>CypherMonkey Labs</span>
  </a>
  <nav class="primary" aria-label="Primary">
    ${nav}
  </nav>
  <button class="theme-btn" id="theme-btn" type="button" aria-pressed="false" aria-label="Switch to dawn theme">Dawn theme</button>
</header>
<div class="wrap">
<main id="main">
${main}
</main>
</div>
<footer class="bar">
  <p>Free practice labs, not official training. Cypher Monkey Labs is not affiliated with any company named on these pages. Facts were read from each lab's README and published page on ${fetched}.</p>
  <ul>
    <li>${a("https://cyphermonkeylabs.com/", "cyphermonkeylabs.com")}</li>
    <li>${a("https://github.com/CypherMonkeyLabs", "GitHub")}</li>
    <li>${a("https://linktr.ee/CypherMonkey", "Linktree")}</li>
    <li>${a("https://cyphermonkeylabs.com/privacy.html", "Privacy")}</li>
    <li>${a("https://cyphermonkeylabs.com/privacy.html#licenses", "Licenses")}</li>
    <li>${a("https://cyphermonkeylabs.com/#contact", "Contact")}</li>
  </ul>
</footer>
${scriptTag}
</body>
</html>
`;
}

function navLinks(home, current) {
  const items = [
    ["Preview", home, "preview"],
    ["All labs", home + "labs/", "labs"],
    ["Portals", home + "labs/portals/", "portals"],
    ["Ecosystem map", home + "map/", "map"],
    ["Contact", "https://cyphermonkeylabs.com/#contact", "contact"]
  ];
  return items.map(([label, href, id]) => {
    assertHref(href);
    const currentAttr = id === current ? ` aria-current="page"` : "";
    const attrs = externalAttrs(href);
    return `<a href="${esc(href)}"${currentAttr}${attrs}>${esc(label)}</a>`;
  }).join("\n    ");
}

function heroArt(short, title) {
  return `<div class="hero-art" id="hero-art">
  <svg viewBox="0 0 400 280" role="img" aria-labelledby="art-title">
    <title id="art-title">Flat diagram for ${esc(title)}</title>
    <g class="spin">
      <circle cx="200" cy="140" r="108" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.85"/>
      <circle cx="200" cy="140" r="72" fill="none" stroke="#f6f3ff" stroke-width="1" opacity="0.45"/>
      <circle cx="308" cy="140" r="8" fill="var(--accent)" class="pulse"/>
      <circle cx="92" cy="140" r="6" fill="#ffd166"/>
      <circle cx="200" cy="32" r="6" fill="#c4b5fd"/>
    </g>
    <circle cx="200" cy="140" r="36" fill="#140c28" stroke="var(--accent)" stroke-width="3"/>
    <text x="200" y="146" text-anchor="middle" fill="#f6f3ff" font-size="16" font-family="Atkinson Hyperlegible, Segoe UI, sans-serif">${esc(short)}</text>
  </svg>
  <div class="globe-slot" id="globe-slot" hidden></div>
</div>`;
}

function portalPage(lab) {
  const { sisterEdges, bridgeEdges, siblingEdges } = edgesFor(lab.slug);
  const home = "../../";
  const learn = lab.learn.map((item) => `<li>${esc(item)}</li>`).join("");
  const steps = lab.path.map((step, index) => `<li><span class="step">${index + 1}</span><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p></li>`).join("");
  const counts = lab.counts.map((row) => `<li><strong>${esc(row.value)}</strong> <span class="quiet">(${esc(row.source)})</span></li>`).join("");
  const caveats = lab.caveats.map((item) => `<p class="callout">${esc(item)}</p>`).join("");
  const sisterItems = sisterEdges.map((edge) => `<li><a href="${home}map/#glossary-${esc(edge.id)}">${esc(edge.title)}</a>. ${esc(edge.because)}</li>`).join("");
  const linkItems = [...bridgeEdges, ...siblingEdges].map((edge) => {
    const other = labBy(edge.slug);
    return `<li>${a(`../${other.slug}/`, other.title, ` data-globe-node="${esc(other.slug)}" data-globe-label="${esc(other.title)}"`)}. ${esc(edge.because)}</li>`;
  }).join("");
  const extras = lab.extraLinks.map((link) => `<li>${a(link.href, link.label)} ${esc(link.detail)}</li>`).join("");
  const sources = lab.sources.map((source) => `<li>${a(source.href, source.label)}</li>`).join("");
  const main = `<section class="hero" id="hero" aria-labelledby="lab-title">
  <div class="hero-grid">
    <div>
      <p class="eyebrow">Lab portal · version 2 preview</p>
      <h1 id="lab-title">${esc(lab.title)}</h1>
      <p class="lede">${esc(lab.tagline)}</p>
      <div class="cta">
        ${a(lab.openUrl, "Open lab", ` class="btn pri" data-globe-node="${esc(lab.slug)}" data-globe-label="${esc(lab.title)}"`)}
        ${a(lab.repo, "View repo", ` class="btn sec"`)}
      </div>
      <p class="quiet">The drawing stays flat if motion is reduced or WebGL is off. A 3D globe is optional and loads only when the shared effects script is available.</p>
    </div>
    ${heroArt(lab.short, lab.title)}
  </div>
</section>
<section class="panel" id="learn" aria-labelledby="learn-title">
  <h2 id="learn-title">What you learn</h2>
  <ul class="learn">${learn}</ul>
</section>
<section class="panel" id="path" aria-labelledby="path-title">
  <h2 id="path-title">Fundamentals to advanced</h2>
  <p>${esc(lab.pathNote)}</p>
  <ol class="path">${steps}</ol>
</section>
<section class="panel" id="ecosystem" aria-labelledby="eco-title">
  <h2 id="eco-title">Ecosystem</h2>
  <p>Sister technologies are the ones this lab's README or published page names. A link to another lab is a bridge those pages state, or a page in that other lab that names this one. The <a href="${home}map/">ecosystem map</a> shows the same links across all 13 labs.</p>
  <ul class="eco">${sisterItems}${linkItems}${extras}</ul>
</section>
<section class="panel" id="counts" aria-labelledby="counts-title">
  <h2 id="counts-title">Counts from the sources</h2>
  ${caveats}
  <ul class="counts">${counts}</ul>
</section>
<section class="panel" id="sources" aria-labelledby="sources-title">
  <h2 id="sources-title">Sources</h2>
  <p>Read on ${fetched}. This portal does not add a fact that those pages did not state.</p>
  <ul>${sources}</ul>
</section>`;
  return shell({
    title: `${lab.title} · portal · Cypher Monkey Labs`,
    description: lab.tagline,
    canonical: `https://cyphermonkeylabs.com/v2/labs/${lab.slug}/`,
    accent: lab.accent,
    css: ["../portal.css"],
    script: "../portal.js",
    favicon: "../../favicon.svg",
    home,
    nav: navLinks(home, "lab"),
    main,
    suite: "portal"
  });
}

function portalsIndex() {
  const home = "../../";
  const cards = labs.map((lab) => `<article class="door" data-accent="${esc(lab.accent)}">
  <p class="eyebrow">${esc(lab.short)}</p>
  <strong>${esc(lab.title)}</strong>
  <span>${esc(lab.tagline)}</span>
  <p>${a(`../${lab.slug}/`, "Portal")} · ${a(lab.openUrl, "Open lab")} · ${a(lab.repo, "View repo")}</p>
</article>`).join("\n");
  const main = `<section class="hero" id="hero">
  <p class="eyebrow">Version 2 preview</p>
  <h1>Lab portals</h1>
  <p class="lede">Thirteen study doors. Each one quotes that lab's README and published page, then offers Open lab and View repo. The <a href="${home}map/">ecosystem map</a> links the labs to the sister technologies those pages name.</p>
</section>
<div class="door-grid" id="portals">${cards}</div>`;
  return shell({
    title: "Lab portals · Cypher Monkey Labs",
    description: "Thirteen version 2 portals for the Cypher Monkey labs, each sourced from that lab's README and published page.",
    canonical: "https://cyphermonkeylabs.com/v2/labs/portals/",
    accent: "mint",
    css: ["../portal.css"],
    script: "../portal.js",
    favicon: "../../favicon.svg",
    home,
    nav: navLinks(home, "portals"),
    main,
    suite: "portals"
  });
}

function polar(cx, cy, radius, index, count) {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function shorten(x1, y1, x2, y2, gap) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  return [x1 + (dx / len) * gap, y1 + (dy / len) * gap, x2 - (dx / len) * gap, y2 - (dy / len) * gap];
}

function round(n) {
  return Math.round(n * 10) / 10;
}

function mapPage() {
  const home = "../";
  const ids = ["hub", ...sisters.map((item) => item.id), ...labs.map((item) => item.slug)];
  const pos = new Map();
  pos.set("hub", [600, 430]);
  sisters.forEach((item, index) => pos.set(item.id, polar(600, 430, 200, index, sisters.length)));
  labs.forEach((item, index) => pos.set(item.slug, polar(600, 430, 330, index, labs.length)));

  const sisterLines = [];
  labs.forEach((lab) => {
    Object.keys(lab.sisters).forEach((id) => {
      sisterLines.push({ a: lab.slug, b: id, kind: "sister" });
    });
  });
  const bridgeLines = bridges.map((edge) => ({ a: edge.a, b: edge.b, kind: "bridge" }));

  function classesFor(id) {
    if (id === "hub") return relClass(ids);
    const related = ["hub", id];
    if (sisters.some((item) => item.id === id)) {
      labs.forEach((lab) => {
        if (lab.sisters[id]) related.push(lab.slug);
      });
    } else {
      const { sisterEdges, bridgeEdges, siblingEdges } = edgesFor(id);
      sisterEdges.forEach((edge) => related.push(edge.id));
      bridgeEdges.forEach((edge) => related.push(edge.slug));
      siblingEdges.forEach((edge) => related.push(edge.slug));
    }
    return relClass(related);
  }

  const wideLines = [...sisterLines, ...bridgeLines].map((line) => {
    const [x1, y1] = pos.get(line.a);
    const [x2, y2] = pos.get(line.b);
    const [sx, sy, ex, ey] = shorten(x1, y1, x2, y2, 30);
    const cls = relClass(["hub", line.a, line.b]);
    return `<line class="line-${line.kind} ${cls}" data-kind="${line.kind}" x1="${round(sx)}" y1="${round(sy)}" x2="${round(ex)}" y2="${round(ey)}"/>`;
  }).join("");

  function wideNode(id, label, kind) {
    const [x, y] = pos.get(id);
    return `<a href="#card-${esc(id)}" class="${classesFor(id)}" data-kind="${kind}" data-id="${esc(id)}" data-label="${esc(label)}"><circle class="node-dot" cx="${round(x)}" cy="${round(y)}" r="28"/><text class="node-label" x="${round(x)}" y="${round(y + 5)}" text-anchor="middle">${esc(label)}</text></a>`;
  }

  const wideNodes = [
    wideNode("hub", "Labs", "hub"),
    ...sisters.map((item) => wideNode(item.id, item.short, "sister")),
    ...labs.map((item) => wideNode(item.slug, item.short, "lab"))
  ].join("");

  const narrowRows = [];
  let y = 36;
  function narrowLabel(text) {
    narrowRows.push(`<text x="16" y="${y}" fill="#d8d3f0" font-size="14">${esc(text)}</text>`);
    y += 22;
  }
  function narrowRow(id, label, kind) {
    narrowRows.push(`<a href="#card-${esc(id)}" class="${classesFor(id)}" data-kind="${kind}" data-id="${esc(id)}" data-label="${esc(label)}"><rect class="node-dot" x="16" y="${y}" width="328" height="44" rx="12"/><text class="node-label" x="32" y="${y + 28}">${esc(label)}</text></a>`);
    y += 52;
  }
  narrowLabel("Hub");
  narrowRow("hub", "All 13 labs", "hub");
  y += 8;
  narrowLabel("Sister technologies");
  sisters.forEach((item) => narrowRow(item.id, item.short, "sister"));
  y += 8;
  narrowLabel("Labs");
  labs.forEach((item) => narrowRow(item.slug, item.short, "lab"));
  const narrowHeight = y + 16;

  const hubCard = `<article class="card ${classesFor("hub")}" id="card-hub" data-kind="hub" data-id="hub" data-label="Ecosystem">
  <h3>Contact-center ecosystem</h3>
  <p>The hub is the 13 labs. Lines go to a sister technology only when one of those labs names it, and from lab to lab only when a README states the bridge.</p>
</article>`;

  const sisterCards = sisters.map((item) => {
    const named = labs.filter((lab) => lab.sisters[item.id]).map((lab) => a(`../labs/${lab.slug}/`, lab.short)).join(", ");
    return `<article class="card ${classesFor(item.id)}" id="card-${item.id}" data-kind="sister" data-id="${item.id}" data-label="${esc(item.title)}">
  <h3><a href="#glossary-${item.id}">${esc(item.title)}</a></h3>
  <p>Named by ${named}.</p>
</article>`;
  }).join("");

  const labCards = labs.map((lab) => {
    const { sisterEdges, bridgeEdges } = edgesFor(lab.slug);
    const because = [
      ...sisterEdges.map((edge) => `<li><strong>${esc(sisterBy(edge.id).short)}.</strong> ${esc(edge.because)}</li>`),
      ...bridgeEdges.map((edge) => `<li><strong>${esc(labBy(edge.slug).short)}.</strong> ${esc(edge.because)}</li>`)
    ].join("");
    return `<article class="card ${classesFor(lab.slug)}" id="card-${lab.slug}" data-kind="lab" data-id="${lab.slug}" data-label="${esc(lab.title)}">
  <h3>${esc(lab.title)}</h3>
  <p>${esc(lab.tagline)}</p>
  <ul>${because}</ul>
  <p>${a(`../labs/${lab.slug}/`, "Portal", ` data-globe-node="${esc(lab.slug)}" data-globe-label="${esc(lab.title)}"`)} · ${a(lab.openUrl, "Open lab")} · ${a(lab.repo, "View repo")}</p>
</article>`;
  }).join("");

  const glossary = sisters.map((item) => `<div id="glossary-${item.id}"><dt>${esc(item.title)}</dt><dd>${esc(item.glossary)}</dd></div>`).join("");
  const bridgeGlossary = bridges.map((edge) => `<li><strong>${esc(labBy(edge.a).short)} and ${esc(labBy(edge.b).short)}.</strong> ${esc(edge.because)}</li>`).join("");
  const beyondItems = beyond.map((item) => `<li>${a(item.href, item.label)} ${esc(item.detail)}</li>`).join("");

  const rules = ids.map((id) => `.board:has(#card-${id}:target) .card:not(.rel-${id}),
.board:has(#card-${id}:target) .map-svg a:not(.rel-${id}) { opacity: 0.34; }
.board:has(#card-${id}:target) .map-svg line:not(.rel-${id}) { opacity: 0.06; }
.board:has(#card-${id}:target) .rel-${id} { opacity: 1; }`).join("\n");

  const main = `<section class="hero" id="hero">
  <p class="eyebrow">Version 2 preview</p>
  <h1>Ecosystem map</h1>
  <p class="lede">Thirteen labs, the sister technologies their own pages name, and the platform bridges those pages state. The drawing is SVG. It does not need WebGL. Choosing a node scrolls to its card. On a narrow screen the same nodes stack.</p>
</section>
<div class="map-tools" role="group" aria-label="Filter the map">
  <button type="button" data-show="all" aria-pressed="true">All</button>
  <button type="button" data-show="labs">Labs</button>
  <button type="button" data-show="sisters">Sister technologies</button>
  <button type="button" data-show="bridges">Platform bridges</button>
  <label class="vh" for="map-search">Search the map</label>
  <input id="map-search" type="search" placeholder="Search labs and technologies" autocomplete="off">
</div>
<div class="board" id="board">
  <div class="map-stage map-wide">
    <svg class="map-svg" viewBox="0 0 1200 860" role="group" aria-label="Wide ecosystem diagram">
      ${wideLines}
      ${wideNodes}
    </svg>
  </div>
  <div class="map-stage map-narrow">
    <svg class="map-svg" viewBox="0 0 360 ${narrowHeight}" role="group" aria-label="Narrow ecosystem diagram">
      ${narrowRows.join("")}
    </svg>
  </div>
  <p><button type="button" id="globe-try" hidden>Show the optional 3D globe</button></p>
  <div class="globe-mount" id="globe-mount" hidden></div>
  <p id="fx-note">The flat diagram is the map. A 3D globe is an optional extra from the shared effects script. It stays off when that script is missing, when motion is reduced, or when WebGL is unavailable.</p>
  <h2 class="group-title" id="cards">Cards</h2>
  <div class="card-grid">
    ${hubCard}
    ${sisterCards}
    ${labCards}
  </div>
</div>
<section class="panel" id="glossary" aria-labelledby="glossary-title">
  <h2 id="glossary-title">Glossary</h2>
  <dl class="glossary">${glossary}</dl>
  <h3>Platform bridges</h3>
  <ul>${bridgeGlossary}</ul>
</section>
<section class="panel" id="beyond" aria-labelledby="beyond-title">
  <h2 id="beyond-title">Beyond the thirteen</h2>
  <ul>${beyondItems}</ul>
</section>
<section class="panel" id="sources" aria-labelledby="sources-title">
  <h2 id="sources-title">How a line got here</h2>
  <p>Every sister link and every bridge quotes a lab README or a published lab page fetched on ${fetched}. A relationship that those pages do not state is not drawn. NICE's README marks Five9 and Webex Contact Center connectors as confirm, so those two are not bridges. The AI Lab README says other campuses are not linked from its pages, so this map does not add lab-to-lab lines for it.</p>
  <p><a href="../labs/portals/">All lab portals</a></p>
</section>`;

  const html = shell({
    title: "Ecosystem map · Cypher Monkey Labs",
    description: "An SVG map of the 13 Cypher Monkey labs and the sister technologies their own pages name.",
    canonical: "https://cyphermonkeylabs.com/v2/map/",
    accent: "mint",
    css: ["../labs/portal.css", "map.css", "relations.css"],
    script: "map.js",
    favicon: "../favicon.svg",
    home,
    nav: navLinks(home, "map"),
    main,
    suite: "map"
  });
  return { html, rules };
}

async function main() {
  if (labs.length !== 13) throw new Error("Expected 13 labs, got " + labs.length);
  const slugs = new Set(labs.map((lab) => lab.slug));
  if (slugs.size !== 13) throw new Error("Duplicate lab slug");
  for (const edge of [...bridges, ...siblings]) {
    if (!slugs.has(edge.a) || !slugs.has(edge.b)) throw new Error("Edge points at an unknown lab");
    if (!edge.because) throw new Error("Edge missing because");
  }
  for (const lab of labs) {
    assertHref(lab.openUrl);
    assertHref(lab.repo);
    for (const id of Object.keys(lab.sisters)) sisterBy(id);
    await mkdir(path.join(here, lab.slug), { recursive: true });
    await writeFile(path.join(here, lab.slug, "index.html"), portalPage(lab));
  }
  await mkdir(path.join(here, "portals"), { recursive: true });
  await writeFile(path.join(here, "portals", "index.html"), portalsIndex());
  const map = mapPage();
  const mapDir = path.join(root, "v2", "map");
  await mkdir(mapDir, { recursive: true });
  await writeFile(path.join(mapDir, "index.html"), map.html);
  await writeFile(path.join(mapDir, "relations.css"), map.rules + "\n");
  console.log("Wrote 13 portals, the portal index, and the ecosystem map.");
}

main();
