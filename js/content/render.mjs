import { iconStack } from "./icons.mjs";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const LEVELS = {
  starter: "Starter",
  explorer: "Explorer",
  navigator: "Navigator",
  pilot: "Pilot",
};

export function isNew(lab, today) {
  if (!lab.launchedAt) return false;
  const launched = new Date(`${lab.launchedAt}T00:00:00`);
  const end = new Date(`${today}T00:00:00`);
  const days = (end.getTime() - launched.getTime()) / 86_400_000;
  return days >= 0 && days <= 30;
}

export function labCard(lab, today = "2026-10-15") {
  const vendors = (lab.vendorsReferenced || []).join(", ");
  const affiliation = vendors
    ? `Not affiliated with ${vendors}.`
    : "Independent study. Not an official product manual.";
  const badges = [
    `<li>${LEVELS[lab.level] || "Explorer"}</li>`,
    `<li>${lab.status === "live" ? "Live" : escapeHtml(lab.status)}</li>`,
  ];
  if (isNew(lab, today)) badges.push("<li>New</li>");
  const sources = (lab.sources || [])
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a>${
          source.publisher ? ` · ${escapeHtml(source.publisher)}` : ""
        }</li>`,
    )
    .join("");
  const open =
    lab.status === "coming-soon" || !lab.url
      ? `<span class="btn is-disabled">Coming soon</span>`
      : `<a class="btn primary" href="${escapeHtml(lab.url)}">Open lab</a>`;
  const repo = lab.repo
    ? `<a class="btn ghost" href="${escapeHtml(lab.repo)}" target="_blank" rel="noopener">View repo<span class="sr-only"> for ${escapeHtml(lab.title)} on GitHub (opens new tab)</span></a>`
    : "";
  return `<article class="lab-card" data-lab="${escapeHtml(lab.id)}" data-category="${escapeHtml(lab.category)}" data-level="${escapeHtml(lab.level || "")}" data-status="${escapeHtml(lab.status)}" data-title="${escapeHtml(lab.title.toLowerCase())}" data-tags="${escapeHtml((lab.tags || []).join(" "))}" data-featured="${lab.featured ? "true" : "false"}">
    <div class="planet planet-${escapeHtml(lab.accent || "sky")}">${iconStack(lab.icon)}</div>
    <h4>${escapeHtml(lab.title)}</h4>
    <p class="tagline">${escapeHtml(lab.tagline)}</p>
    <ul class="badges">${badges.join("")}</ul>
    <p class="card-actions">${open}${repo}</p>
    <p class="verified">Last verified: <time datetime="${escapeHtml(lab.lastVerified || "")}">${escapeHtml(lab.lastVerified || "unknown")}</time></p>
    <p class="fine">${escapeHtml(affiliation)}</p>
    <details class="sources"><summary>Sources</summary><ul>${sources}</ul></details>
  </article>`;
}

export function categoryTile(cat, count) {
  return `<a class="tile tile-${escapeHtml(cat.accent)}" href="#cat-${escapeHtml(cat.id)}">
    <span class="tile-glyph">${iconStack(cat.glyph)}</span>
    <span><strong>${escapeHtml(cat.label)}</strong><span class="tile-count">${count} ${count === 1 ? "lab" : "labs"}</span></span>
  </a>`;
}

function formatWhen(event) {
  const [year, month, day] = event.date.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (event.datePrecision === "year" || !month) return year;
  if (event.datePrecision === "month" || !day) return `${months[Number(month) - 1]} ${year}`;
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}

export function timelineCard(event) {
  const sources = (event.sources || [])
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}" rel="noopener">${escapeHtml(source.title)}</a>`,
    )
    .join(" · ");
  const kind = event.track === "lab-launch" ? "launch" : "history";
  return `<li class="event event-${kind} era-${escapeHtml(event.era || "wires")}" data-track="${escapeHtml(event.track)}" data-year="${escapeHtml(event.date.slice(0, 4))}">
    <article>
      <p class="era-label">${escapeHtml(event.era || "")}</p>
      <time datetime="${escapeHtml(event.date)}">${formatWhen(event)}</time>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.summary)}</p>
      <p class="source-line">Source: ${sources}</p>
    </article>
  </li>`;
}

export function labLaunch(lab) {
  return {
    id: `launch-${lab.id}`,
    date: lab.launchedAt,
    datePrecision: "day",
    track: "lab-launch",
    era: lab.category === "ai" || lab.category === "tools" ? "ai" : "cloud-cx",
    title: `${lab.shortTitle || lab.title} opens`,
    summary: `${lab.title} was added to the public catalog on ${lab.launchedAt}. The date is the day the GitHub repository was created.`,
    sources: [
      {
        title: `${lab.title} repository`,
        url: lab.repo,
      },
    ],
    review: "verified",
  };
}

export function gemCard(gem) {
  return `<article class="gem-card" data-gem="${escapeHtml(gem.id)}" data-tags="${escapeHtml((gem.tags || []).join(" "))}">
    <p class="gem-crystal" aria-hidden="true"></p>
    <h3>${escapeHtml(gem.name)}</h3>
    <p>${escapeHtml(gem.purpose)}</p>
    <ul class="badges"><li>Requires a Google account</li><li>Opens on gemini.google.com</li></ul>
    <p class="card-actions">
      <a class="btn primary" href="${escapeHtml(gem.desk)}">Open desk<span class="sr-only"> for ${escapeHtml(gem.name)} (opens the gallery page)</span></a>
      <a class="btn ghost" href="${escapeHtml(gem.link)}" target="_blank" rel="noopener">Open Gemini<span class="sr-only"> (opens new tab)</span></a>
    </p>
    <p class="fine">Desk checked <time datetime="${escapeHtml(gem.lastTested)}">${escapeHtml(gem.lastTested)}</time>. Paste the instructions into a Gem yourself.</p>
  </article>`;
}

export function groupedLabs(labs, categories) {
  const cats = [...categories].sort((a, b) => a.order - b.order);
  return cats
    .map((cat) => {
      const group = labs
        .filter((lab) => lab.category === cat.id)
        .sort((a, b) => a.order - b.order);
      if (!group.length) return "";
      const cards = group.map((lab) => labCard(lab)).join("");
      return `<section class="cat-block" id="cat-${escapeHtml(cat.id)}" aria-labelledby="cat-title-${escapeHtml(cat.id)}">
        <h3 id="cat-title-${escapeHtml(cat.id)}">${escapeHtml(cat.label)}</h3>
        <div class="lab-grid">${cards}</div>
      </section>`;
    })
    .join("");
}
