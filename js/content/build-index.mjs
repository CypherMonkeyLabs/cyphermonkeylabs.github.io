import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categoryTile, groupedLabs, labLaunch, timelineCard } from "./render.mjs";
import { iconStack } from "./icons.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const labsDoc = JSON.parse(readFileSync(join(root, "data/labs.json"), "utf8"));
const categories = JSON.parse(readFileSync(join(root, "data/categories.json"), "utf8"));
const timeline = JSON.parse(readFileSync(join(root, "data/timeline.json"), "utf8"));
const gemsDoc = JSON.parse(readFileSync(join(root, "data/gems.json"), "utf8"));
const author = JSON.parse(readFileSync(join(root, "data/author.json"), "utf8"));
const site = JSON.parse(readFileSync(join(root, "data/site.json"), "utf8"));

const labs = labsDoc.labs;
const tiles = categories
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((cat) => categoryTile(cat, labs.filter((lab) => lab.category === cat.id).length))
  .join("");
const groups = groupedLabs(labs, categories);
const events = [...timeline.events, ...labs.filter((lab) => lab.launchedAt).map((lab) => labLaunch(lab))]
  .sort((a, b) => a.date.localeCompare(b.date));
const timelineHtml = events.map((event) => timelineCard(event)).join("");
const years = [...new Set(events.map((event) => event.date.slice(0, 4)))];
const yearOptions = years.map((year) => `<option value="${year}">${year}</option>`).join("");
const socials = author.socials
  .map((item) => `<li><a href="${item.url}" rel="me noopener">${item.name.replace(" (opens new tab)", "")}<span class="sr-only"> (opens new tab)</span></a></li>`)
  .join("");

const itemList = {
  "@type": "ItemList",
  "name": "CypherMonkey labs",
  "itemListElement": labs.map((lab, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "LearningResource",
      name: lab.title,
      description: lab.summary,
      url: lab.url,
      isAccessibleForFree: true,
      license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      educationalLevel: lab.level,
    },
  })),
};
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "CypherMonkey Labs",
      url: "https://cyphermonkeylabs.com/",
      description: site.description,
      potentialAction: {
        "@type": "SearchAction",
        target: "https://cyphermonkeylabs.com/?q={search_term_string}#labs",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      name: author.name,
      url: "https://cyphermonkeylabs.com/#about",
      description: author.bio,
      sameAs: author.sameAs,
    },
    itemList,
  ],
};

const steps = [
  ["1", "Pick a lab", "Choose a planet. The list under the picture has every open lab.", "spark"],
  ["2", "Follow the missions", "Open the lab and walk the rooms at your own pace.", "route"],
  ["3", "Check the sources", "Important facts have a link. Open the source before you trust a line.", "book"],
];
const stepsHtml = steps
  .map(([num, title, text, icon]) => `<li><span class="step-num">${num}</span>${iconStack(icon)}<h3>${title}</h3><p>${text}</p></li>`)
  .join("");

const stargazer = readFileSync(join(root, "assets/mascot/stargazer.svg"), "utf8").replace(/^<\?xml[^>]*>\s*/, "");
const html = `<!DOCTYPE html>
<html lang="en" data-theme="starlight">
<head>
  <meta charset="utf-8">
  <script src="/js/settings/boot.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${site.title}</title>
  <meta name="description" content="${site.description}">
  <link rel="canonical" href="https://cyphermonkeylabs.com/">
  <meta name="theme-color" content="#0F1030">
  <meta name="cml-contact-mode" content="worker">
  <meta name="cml-turnstile-sitekey" content="0x4AAAAAAFX-0D95hXYzwVx-">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${site.title}">
  <meta property="og:description" content="${site.description}">
  <meta property="og:url" content="https://cyphermonkeylabs.com/">
  <meta property="og:image" content="https://cyphermonkeylabs.com/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${site.title}">
  <meta name="twitter:description" content="${site.description}">
  <meta name="twitter:image" content="https://cyphermonkeylabs.com/og.png">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://contact.cyphermonkeylabs.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action https://github.com https://contact.cyphermonkeylabs.com; upgrade-insecure-requests">
  <link rel="stylesheet" href="/css/content.css">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/nav.css">
  <link rel="stylesheet" href="/css/universe.css">
  <link rel="stylesheet" href="/css/trust.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>
</head>
<body>
  <a class="skip" href="#main">Skip to main content</a>
  <a class="skip" href="#labs">Skip to labs list</a>
  <div class="sky" aria-hidden="true"></div>
  <div class="stars" aria-hidden="true"></div>
  <canvas id="universe-canvas" hidden aria-hidden="true" tabindex="-1"></canvas>
  <div class="page">
    <header class="topbar" id="nav-root">
      <a class="brand" href="#launchpad">
        <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/><circle cx="20" cy="15" r="1.4" fill="currentColor"/><path d="M12 20c2 2 6 2 8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="brand-full">CypherMonkey Labs</span>
        <span class="brand-short">CML</span>
      </a>
      <nav class="desktop-nav" aria-label="Primary">
        <a href="#labs">Labs</a>
        <a href="#timeline">Timeline</a>
        <a class="nav-more" href="#gems">More</a>
        <a href="#about">About</a>
        <a class="pill" href="#contact">Contact</a>
      </nav>
      <details class="menu">
        <summary>Menu</summary>
        <nav class="menu-links" aria-label="Mobile">
          <a href="#launchpad">Universe</a>
          <a href="#labs">Labs</a>
          <a href="#timeline">Timeline</a>
          <a class="nav-more" href="#gems">More</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </details>
    </header>
    <main id="main">
      <section class="chapter" id="launchpad" aria-labelledby="launch-title">
        <div class="wrap hero">
          <div class="hero-copy notebook">
            <p class="kicker">Chapter 1 · Launchpad</p>
            <p><a class="badge" href="#disclaimer">Independent · Free · Cited</a></p>
            <h1 id="launch-title">How does the world talk? Let's find out.</h1>
            <p class="lede">Free labs for curious minds: contact centers, voice, <abbr title="SIP starts a call on the internet.">SIP</abbr>, and AI.</p>
            <div class="hero-actions">
              <a class="btn primary" href="#labs">Explore the labs</a>
              <a class="btn ghost" href="#guide">How it works</a>
            </div>
          </div>
          <div class="hero-art">
            <svg class="orbit-fallback" viewBox="0 0 200 160" aria-hidden="true">
              <g class="ring-a"><ellipse cx="100" cy="80" rx="78" ry="30"/></g>
              <g class="ring-b"><ellipse cx="100" cy="80" rx="58" ry="22"/></g>
              <circle cx="100" cy="80" r="14" fill="#FFC46B"/>
              <circle cx="158" cy="64" r="7" fill="#FFB4A2"/>
              <circle cx="42" cy="98" r="6" fill="#A7D8FF"/>
              <circle cx="124" cy="108" r="5" fill="#9EE6CF"/>
              <circle cx="70" cy="58" r="5" fill="#C9B8FF"/>
            </svg>
            <div id="mascot-root">
              <div aria-hidden="true">
                <div id="mascot-stage" data-mascot-stage data-variant="stargazer">${stargazer}</div>
                <p id="mascot-tip" data-mascot-tip hidden></p>
              </div>
              <button type="button" id="mascot-hide" data-mascot-hide hidden>Hide buddy</button>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter" id="labs" aria-labelledby="labs-title">
        <div class="wrap notebook">
          <p class="kicker">Chapter 2 · The Labs Universe</p>
          <h2 id="labs-title">Pick a planet. Start exploring.</h2>
          <p class="section-intro">Eleven labs are open. The picture is a map. The cards are the way in. A contact center is the system that routes people who call or message a company.</p>
          <div class="tiles" data-tiles>${tiles}</div>
          <form class="filters" data-filters role="search">
            <label>Search labs<input type="search" name="q" placeholder="Try SIP or voice" autocomplete="off"></label>
            <label>Category
              <select name="cat">
                <option value="">All categories</option>
                <option value="contact-center">Contact center</option>
                <option value="unified-comms">Voice and collaboration</option>
                <option value="protocols">Protocols</option>
                <option value="ai">AI</option>
                <option value="tools">Business analysis</option>
                <option value="texts">Ancient sutras</option>
              </select>
            </label>
            <label>Level
              <select name="level">
                <option value="">Any level</option>
                <option value="starter">Starter</option>
                <option value="explorer">Explorer</option>
                <option value="navigator">Navigator</option>
              </select>
            </label>
          </form>
          <p class="empty" data-empty hidden>No labs match. Try fewer filters?</p>
          <div data-lab-mount>${groups}</div>
          <p class="more-link" id="gems">More · <a href="${gemsDoc.gallery}">Gemini Gems shelf<span class="sr-only"> (opens the gallery)</span></a></p>
        </div>
      </section>

      <section class="chapter" id="guide" aria-labelledby="guide-title">
        <div class="wrap notebook">
          <p class="kicker">Chapter 3 · Field Guide</p>
          <h2 id="guide-title">How to explore</h2>
          <p class="section-intro">Three moves. That is the whole path.</p>
          <ol class="guide-steps">${stepsHtml}</ol>
          <h3>Small words</h3>
          <dl class="glossary">
            <dt><abbr title="Session Initiation Protocol">SIP</abbr></dt>
            <dd>The rules that start many phone calls on the internet.</dd>
            <dt>IVR</dt>
            <dd>The phone menu that asks you to press a number.</dd>
            <dt>Contact center</dt>
            <dd>The system that routes people who call or message a company.</dd>
          </dl>
        </div>
      </section>

      <section class="chapter" id="timeline" aria-labelledby="timeline-title">
        <div class="wrap notebook">
          <p class="kicker">Chapter 4 · Timeline</p>
          <h2 id="timeline-title">From wires to AI: a short trip through time</h2>
          <p class="section-intro">History sits with the lab openings. Every card has a source I opened on October 15, 2026.</p>
          <div class="time-tools">
            <button type="button" data-track-filter="all" aria-pressed="true">All</button>
            <button type="button" data-track-filter="history" aria-pressed="false">History</button>
            <button type="button" data-track-filter="lab-launch" aria-pressed="false">Lab launches</button>
            <button type="button" data-time-prev aria-label="Previous milestones">‹</button>
            <button type="button" data-time-next aria-label="Next milestones">›</button>
            <label>Year <select data-year-jump><option value="">Jump to a year</option>${yearOptions}</select></label>
          </div>
          <div class="timeline-scroller" data-timeline-scroller tabindex="0" aria-label="Timeline track">
            <ol class="timeline" data-timeline>${timelineHtml}</ol>
          </div>
        </div>
      </section>

      <section class="chapter" id="about" aria-labelledby="about-title">
        <div class="wrap about-grid">
          <div class="notebook">
            <p class="kicker">Chapter 5 · Meet the Explorer</p>
            <h2 id="about-title">Hi! I'm the human behind the monkey.</h2>
            <p>${author.bio}</p>
            <p>${author.mission}</p>
            <h3>How the notes get checked</h3>
            <p>${author.verify}</p>
            <p>See a mistake? <a href="/?topic=correction#contact">Tell Mission Control</a>. I aim to fix cited errors within 14 days and note the change here.</p>
          </div>
          <aside class="panel author-card" aria-label="About the author">
            <h3>${author.name}</h3>
            <p>${author.role}</p>
            <ul class="socials">${socials}</ul>
            <p><a class="btn primary" href="#contact">Send me a note</a></p>
            <p class="fine"><a href="#disclaimer">Independent · Free · Cited</a></p>
          </aside>
        </div>
      </section>

      <div id="contact-root">
      <section class="chapter" id="contact" aria-labelledby="contact-title">
        <div class="wrap notebook">
          <p class="kicker">Chapter 6 · Mission Control</p>
          <h2 id="contact-title" tabindex="-1">Send a message to Mission Control</h2>
          <p class="section-intro">The note opens a GitHub issue so I can reply. This page does not show my email address. GitHub issues may be public, so leave out secrets.</p>
          <div id="contact-panel">
            <form id="contact-form" class="contact-form panel" action="${site.contact.issuesUrl}" method="post" data-contact-endpoint="">
              <label>Name<input name="name" autocomplete="name" required></label>
              <label>Your email, so I can reply<input name="email" type="email" autocomplete="email" required></label>
              <label>Topic
                <select name="topic">
                  <option value="general">General</option>
                  <option value="correction">Correction</option>
                  <option value="lab-idea">Lab idea</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="accessibility">Accessibility issue</option>
                </select>
              </label>
              <label>Lab, if you have one
                <select name="lab"><option value="">No specific lab</option></select>
              </label>
              <label>Message<textarea name="message" maxlength="4000" required></textarea></label>
              <label><input name="consent" type="checkbox" required> Use my message only to reply. <a href="/privacy.html">Privacy</a></label>
              <p class="honeypot" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></p>
              <button class="btn primary" type="submit">Send a message</button>
              <p><a href="${site.contact.issuesUrl}" rel="noopener">Open a GitHub issue instead<span class="sr-only"> (opens new tab)</span></a></p>
            </form>
            <div class="form-status" data-form-status tabindex="-1" hidden></div>
            <noscript><p>JavaScript is off. Use the GitHub issue link in the form. Nothing on this page shows an email address.</p></noscript>
          </div>
        </div>
      </section>
      </div>
    </main>
    <div id="footer-root">
      <div class="wrap">
        <section class="ground-rules" id="disclaimer" aria-labelledby="disclaimer-title">
          <h2 id="disclaimer-title">Independent, free, and cited</h2>
          <p><strong>Independent and educational.</strong> CypherMonkey Labs is a free, independent learning project. It is <strong>not affiliated with, sponsored by, or endorsed by</strong> Amazon Web Services, Microsoft, Cisco (Webex), Five9, Genesys, NICE, Google, or any other company named on this site. Product names and trademarks belong to their owners and are used only to describe what each lab teaches. We work to keep every lesson truthful and cite our sources, but technology changes, so always check official documentation before using anything in production. Spotted a mistake? <a href="/?topic=correction#contact">Tell Mission Control</a>.</p>
          <p><strong>Code:</strong> MIT License · <strong>Content</strong> (text, diagrams, timeline): <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license noopener">CC BY-NC-SA 4.0</a> · <strong>Brand</strong> (name, logo, mascot): all rights reserved.</p>
        </section>
        <div class="footer-links">
          <div>
            <p class="footer-label">Explore</p>
            <ul>
              <li><a href="#labs">Labs</a></li>
              <li><a href="#timeline">Timeline</a></li>
              <li><a class="nav-more" href="#gems">More</a></li>
            </ul>
          </div>
          <div>
            <p class="footer-label">About</p>
            <ul>
              <li><a href="#about">Author</a></li>
              <li><a href="#about">How we verify</a></li>
              <li><a href="#disclaimer">Ground rules</a></li>
            </ul>
          </div>
          <div>
            <p class="footer-label">Help</p>
            <ul>
              <li><a href="#contact">Contact</a></li>
              <li><a href="/privacy.html">Privacy</a></li>
            </ul>
          </div>
          <div>
            <p class="footer-label">Social</p>
            <ul>
              ${socials}
            </ul>
          </div>
        </div>
        <p>© 2026 CypherMonkeyLabs 🐒</p>
      </div>
    </div>
  </div>
  <script type="module" src="/js/content/assemble.mjs"></script>
</body>
</html>
`;

writeFileSync(join(root, "index.html"), html);
console.log("wrote index.html", html.length);
