# Cinematic 3D redesign

Plan for the front door at [cyphermonkeylabs.com](https://cyphermonkeylabs.com/). This document does not change the live page. The site stays a static GitHub Pages root: `index.html` is the product, and the picture is a map.

## What is already here

The home page is six chapters in `index.html`: Launchpad (`#launchpad`), Labs (`#labs`), Field Guide (`#guide`), Timeline (`#timeline`), About (`#about`), and Mission Control (`#contact`). Copy, cards, and the timeline are baked into the HTML. `js/content/assemble.mjs` fills those mounts only when they are empty, then lazy-loads four modules:

| Module | Role today |
|---|---|
| `js/universe/index.js` | Three.js scene, quality governor, wormhole, camera waypoints |
| `js/nav/index.js` | Bar, command palette, and the `#cm-menu` sheet |
| `js/settings/index.js` | `cm.settings` for theme, motion, sound, quality |
| `js/trust/index.js` | Ground Rules, footer, contact form |

The canvas (`#universe-canvas`) ships `hidden`. Visitors see an SVG orbit and the inline stargazer mascot. The scene already knows the chapter cameras in `WAYPOINTS` (launchpad, labs, timeline, gems, about, contact), paints instanced planets from the lab list, and steps itself down through `ultra → high → medium → low → static` in `js/universe/quality.js`. A reduced-motion or no-WebGL visit already has a 2D fallback.

The catalog that cards must follow is `/data/labs.json` (13 live labs, six categories in `/data/categories.json`). `/labs.json` is the older orbit list. Both describe the same campuses. Cards, the scene, and the menu should read the `/data/labs.json` contract (`title`, `tagline`, `url`, `repo`, `icon`, `accent`, `scene`, `sources`). Nav already tries that file first.

Glyphs are flat SVG paths in `js/content/icons.mjs` (cards) and a canvas atlas in `js/universe/glyphs.js` (planets). There is no GLB and no build step. `js/universe/glyphs.js` says a baked model would need one. This plan does not add one.

The mascot is a scheduled SVG (`data/mascot.json`: stargazer, astronaut, headset-helper, signal-surfer, robo-buddy, bookworm, gem-collector, inventor, plus dreamer and party). It shows tips. It is not a guide you can ask.

## Design intent

The redesign makes the arrival cinematic and keeps every lab one clear action away.

- The first screen is a shot, not a document header. The headline stays: "How does the world talk? Let's find out."
- The 3D scene is the backdrop and the map. The lab cards remain the way in. That sentence is already on the page and stays true.
- Large icons are the menu. Short text chips are not how someone picks a planet.
- The monkey can answer a short list of questions from the catalog. It does not call another service.
- A trailer is a camera move through the scene that already exists. It is not a video file and not an embed.
- Motion, quality, and bytes stay inside the ceilings in `docs/PERFORMANCE-BUDGETS.md` and the tiers in `js/universe/quality.js`.
- No vendor logos. Names stay nominative, as in `docs/TRADEMARKS.md` and the Ground Rules panel. The disclaimer keeps Zoom, Talkdesk, and Avaya, which the footer already names.
- No email address anywhere on the page. Mission Control stays the contact path.
- The Pages deploy stays "files at the repo root." Do not switch this work to an Actions artifact deploy (`docs/ROLLBACK.md`).

## Link rule

A visitor-facing link on the front door, the shared nav, and the shared footer may point at only three places:

1. This site: `https://cyphermonkeylabs.com/` and its paths. Lab campuses, `/privacy.html`, `/#labs`, and the gems gallery at `https://cyphermonkeylabs.com/gemini-gems-free-gallery/site/` count. Hash links on `/` count.
2. GitHub under `https://github.com/CypherMonkeyLabs`, including this repo, each lab repo, and the issue tracker.
3. Linktree: `https://linktr.ee/cyphermonkey`.

`js/nav/social.js` already exports only those last two. The about card and the footer social column already match. The rest of the page does not.

These current anchors have to become plain text (title, publisher, date) or point at a same-site page:

- Source links on lab cards and timeline events (vendor docs, RFCs, patent scans, standards pages, and the rest of `sources[].url`).
- The license anchor in `js/trust/copy.js` (`LINKS.cc`) and the same anchor baked into `index.html`. The words "CC BY-NC-SA 4.0" stay. The MIT anchor already points at `/privacy.html#licenses` and can stay. The license summary in `docs/LICENSE-CONTENT.md` is the in-repo wording; `/privacy.html#licenses` is the visitor-facing copy.
- `LINKS.cloudflarePrivacy`. The privacy page can say that the spam check is Cloudflare Turnstile. The front door does not link to Cloudflare's site.
- Gem desk and Gemini destinations inside `/data/gems.json`. The front door's More control goes to the same-site gallery or to `#gems`. It does not open those other hosts.
- Empty profile slots in `site.json` (`profiles` for X, Telegram, and the rest). Do not render a link with an empty `url`. Linktree is the public list.

Allowed non-links (not anchors, not new hosts):

- The contact form may POST to `https://contact.cyphermonkeylabs.com` or, with `?contact=fallback`, open the GitHub issue URL. That worker host is this site's contact endpoint, already in the CSP.
- Turnstile may load from `challenges.cloudflare.com` inside the existing CSP (`script-src`, `connect-src`, `frame-src`). That is a widget, not a footer link.
- JSON-LD `sameAs` stays the Linktree URL and the GitHub org URL. Do not add other `sameAs` entries. The CC license URL may remain a `license` property on a `LearningResource` because that is machine-readable and not a clickable anchor. Do not also render it as an `<a>`.

Lab campuses are other repos. This plan binds the front door only. A campus may keep its own source links.

`check-links` and the no-email check should grow a front-door allowlist for `index.html`, `js/nav`, `js/trust`, and `js/content`: anchors must match the three destinations above, plus root-relative paths and the contact worker as a form `action`. A new vendor URL in a card renderer should fail CI.

## 1. Hero concept

Name the shot **Arrival**. It replaces the side-by-side notebook and orbit drawing with one viewport.

### Frame

`#launchpad` is `min-height: 100svh` minus the header (`--cm-header-h`). The notebook copy sits in a left (or top, on a narrow screen) glass panel using the existing `.notebook` and `.cm-glass` styles. The scene fills the section behind it. The inline mascot stays in the DOM, in `.hero-art`, so the largest text and the mascot SVG are real elements. The canvas is `aria-hidden` and `tabindex="-1"`, as `mountUniverse` already sets.

Do not move the `<h1>` into WebGL. "How does the world talk? Let's find out." remains the LCP candidate, with the lede under it: free labs for contact centers, voice, SIP, and AI. The badge still jumps to `#disclaimer`.

Actions, in this order:

1. **Explore the labs** → `#labs` (primary).
2. **How it works** → `#guide`.
3. **Play arrival** → runs the trailer in section 5. This control is a button, not a link.

The "Pick a planet" row stays, but each control is a large icon plus the lab's `shortTitle`, and each `href` is `#lab-{id}` on this page. The menu must not be the thing that navigates into a campus. Opening a campus is the card's job.

### Scene

On first successful WebGL frame, remove the `hidden` attribute from the canvas and cross-fade it over the SVG (`.fade-ok` already exists). Camera rests on the launchpad waypoint: position `[0, 6, 70]`, look-at origin, fov 45. The butter core is the center. Thirteen planets use `scene.size`, `scene.moons`, and `scene.ringHint` from `/data/labs.json`, colored by `accent` (`sky`, `peach`, `mint`, `lavender`, `butter`, `pink`) through `js/universe/palette.js`.

Planet labels (`cml-universe-labels`) stay off until a planet is the focused one, from a card hover, a card focus, or a hash. A hero covered in 13 names will not read as a shot.

Theme follows `cm.settings` and the existing aliases (`dawn` / `starlight` / `contrast`). Bloom uses the theme's bloom settings in `palette.js`. Do not add a new grade.

### When the shot cannot play

| Condition | What the visitor gets |
|---|---|
| `prefers-reduced-motion: reduce`, or `motion=reduce` | Poster plus the SVG orbit. No camera move, no wormhole, no star drift. |
| `quality=static`, no WebGL, software renderer, or `saveData` | Same poster and SVG. `initialTier()` already returns `static` or `low` for those devices. |
| Scene chunk still loading | SVG orbit, which is already in the HTML. The page is usable. |
| WebGL context lost | Existing fallback path in `mountUniverse`. The cards do not depend on the canvas. |

The poster is one AVIF, 768 CSS pixels wide, under the 60 KB budget already written. It shows the same frame: monkey, butter core, a few planets, dark or dawn sky to match the two `theme-color` values. It is decorative (`alt=""`), because the headline carries the meaning.

### Focus from a card

`mountUniverse` already returns `focusLab` and the canvas already emits `universe:select`. Card hover and `:focus-within` call `focusLab(id)`. A planet pick or a `universe:select` sets `location.hash` to `#lab-{id}` and moves focus to that article's heading. The scene does not navigate to `lab.url`.

## 2. Lab-card grid

Chapter 2 keeps its heading: "Pick a planet. Start exploring." Category tiles stay above the filters, in `/data/categories.json` order, and use the same large-icon treatment as the menu. Counts come from the catalog (today: contact center 5, voice 3, protocols 2, AI 1, business analysis 1, sutras 1).

### Layout

- One column below 640px, two from 640px, three from 1024px. Featured labs (`featured: true`) span two columns from 1024px up. At 13 labs the featured set is UC, Amazon Connect, Microsoft Voice, Webex, SIP Universe, and AI Lab.
- A card is an `<article>` with a stable `id="lab-{id}"`. Deep links from the hero and the menu land on it.
- Gap and radius come from the tokens (`--space-5`, `--radius-3`). Accent is a border and a planet disc, not a full bleed of saturated color, so the six accents can sit next to each other in both dawn and starlight.
- The grid must not assume 13 cards. `js/content/layout.mjs` already places rings for a larger set. A new lab is another card; it does not need a new layout.

### Card contents

1. Large glyph, about 96px, from `iconStack()` so the stacked SVG read is the same as today, only bigger. Color is `currentColor` from the accent. No logo image.
2. Title (`<h4>`) and tagline.
3. Badges: level (starter, explorer, navigator), status, and "New" only when `launchedAt` is within 45 days of the page's verified date. Do not invent room counts, quiz counts, or star counts. Those fields are `null` on the legacy list and absent on the contract list.
4. **Open app** → `lab.url`, which CI already requires to be a `cyphermonkeylabs.com` path for a lab. **View repo** → `lab.repo` on GitHub, `target="_blank"` and `rel="noopener"`, with the existing "opens new tab" text.
5. `Last verified` as a `<time>`.
6. The one-line affiliation note ("Not affiliated with …"). Labs with an empty `vendorsReferenced` keep "Independent study. Not an official product manual."
7. Sources in a `<details>` as text: title, publisher, accessed date. No `<a>` around `sources[].url`.

`status` of `beta` or `coming-soon` still renders the card. **Open app** is omitted unless `status` is `live`. `archived` stays in the grid, marked archived, without Open app. The current 13 are all `live`.

### Filters

Keep the existing search, category, and level controls. They filter in the page; they do not fetch. The empty line stays: "No labs match. Try fewer filters?" Filtering hides articles with the `hidden` attribute and does not destroy them, so hash links can unhide a match. Category tiles set the category select and move focus to the first visible card.

### Scene coupling

Hover and keyboard focus call `focusLab`. Leaving the card returns the camera to the labs waypoint (`[0, 22, 48]`) if the labs chapter is the one in view, otherwise to launchpad. Pointer coarse devices do not fly the camera on touch scroll; only an explicit tap focuses a planet, and the tap's default is to focus the card, not to open the campus. Open app remains a separate control.

## 3. Large icon menu

The header bar stays compact: mark, "CypherMonkey Labs" / "CML", and one **Menu** button. Desktop does not keep a second row of text links beside a different mobile menu. The six chapter links that now sit in `.cm-primary` move into the icon menu so there is one map.

The menu is the existing `<dialog id="cm-menu">` from `js/nav/sheet.js`. `openDialog` / `closeDialog` in `js/nav/focus.js` already trap focus. Escape and the close button dismiss it. Opening it pauses the scene's animation frame so the dialog does not fight the renderer. Closing it resumes only if the document is visible and motion is full.

### Tiles

Each tile is one control with a large icon (96px desktop, 72px below 640px) and a label under it. The icon paths stay the ones in `js/nav/icons.js` and `js/content/icons.mjs`. Hit area is at least 48px even when the glyph is smaller. Two columns below 640px, three from 640px, four from 1024px.

**Places** (hash links on this page):

| Tile | Target | Icon already in the nav set |
|---|---|---|
| Universe | `#launchpad` | `play` |
| Labs | `#labs` | `labs` |
| Timeline | `#timeline` | `timeline` |
| More | `#gems` | `gems` |
| About | `#about` | `about` |
| Contact | `#contact` | `contact` |

`#gems` is the short "More" line that points at the same-site gems gallery. The tile scrolls to that line. The gallery anchor itself is the only control that leaves `/` for the gallery, and that URL is still this site.

**Categories** jump to `#cat-{id}` and use the category glyph (`headset`, `handset`, `nodes`, `spark`, `gem`, `book`).

**Planets** are the 13 labs. Icon plus `shortTitle`. `href="#lab-{id}"`. They do not use `lab.url`. The sheet's current chip row links straight at the campuses; that split goes away.

**Outside this site**, two tiles only, at the end of the dialog:

- Linktree → `https://linktr.ee/cyphermonkey`
- GitHub → `https://github.com/CypherMonkeyLabs`

Both use `rel="noopener noreferrer"` and say that they open a new tab.

Effects stays a button that dispatches `cm:open-settings`. It is not a destination.

The command palette stays for keyboard search (`mountPalette`). A lab result moves to `#lab-{id}`. A second action inside the result, **Open app**, uses `lab.url`. Search can filter the icon menu as well, reusing `queryIndex`, so a typed "sip" dims every tile except SIP Universe and Protocols.

While the dialog is open, `aria-expanded` on the Menu button is `true`. The first focusable tile is the heading's close control, matching the sheet today (`data-initial-focus` on the title). After close, focus returns to the button that opened it.

## 4. Bot

The bot is the mascot with a small set of answers. Its name on the button is **Ask the monkey**. It is not a hosted model. The CSP `connect-src` allows this origin, the contact worker, and Turnstile. A chat API would be a new host, a new privacy story, and a payload this budget cannot carry. Thirteen labs do not need one.

### Where it sits

A 48px button fixed to the bottom corner, above the footer, clear of the skip links and the contact submit button. Activating it opens a panel that is part of the document, not a texture on the canvas. The panel has a short transcript, a text field, and four starter questions:

- Which lab is a starter?
- What is SIP?
- Show contact-center labs
- How do I send a note?

The mascot variant follows `data/mascot.json` `context` (stargazer on the launchpad, astronaut on labs, headset-helper for contact-center, signal-surfer for protocols, robo-buddy for AI, bookworm on the timeline, inventor on contact). The hide control already in `#mascot-hide` also closes the panel.

### How it answers

A lazy module holds an intent table. It reads the labs already on the page. It does not fetch.

| Intent | Answer uses | Then |
|---|---|---|
| Starter / explorer / navigator | Labs whose `level` matches | Links to those `#lab-{id}` cards |
| A lab name or tag | That lab's `tagline` and `summary` | Link to the card, plus Open app only as the card already does |
| SIP, IVR, contact center | The glossary already in chapter 3 | No extra source link |
| Contact, correction, collaboration | One sentence pointing at Mission Control | `#contact` or `/?topic=correction#contact` |
| Anything else | The stargazer tip from `data/mascot.json`, then "Try a lab name, or open the menu." | Does not invent a fact |

Rules for the copy:

- Do not invent room counts, scores, or rankings.
- Do not quote a standard that is not already in the lab `summary` or the glossary.
- Do not offer to send the note. The form remains the only send path. `cm:mascot` with `celebrate` or `oops` still drives the face after a real submit.
- Do not store the transcript in `localStorage`. Closing the panel drops it.
- Do not show an email address. Do not ask for one. The contact form already explains that the address stays in the browser.

Sound uses the existing `cm:sound` cues (`tick`, `open`) and only after a gesture (`primeFromGesture`). Reduced motion skips the variant cross-fade and still shows the text. The dreamer line ("Still here? The labs will wait.") can fire from the existing idle timer; it must not open the panel by itself.

The module loads on the first click of Ask the monkey, not at startup.

## 5. Trailer concept

Name: **Arrival**. Length: about 12 seconds. It is the scene's camera and the existing wormhole (`createWormhole` in `js/universe/post.js`), plus HTML captions. There is no video file, no audio bed, and no third-party player.

### Beats

| Time | Picture | On-screen line |
|---|---|---|
| 0.0–1.5s | Poster, or black if the poster has not decoded. Headline already in the HTML, covered by a scrim. | How does the world talk? |
| 1.5–4.0s | `wormhole.render` with `easeAccel`, the same curve the scene uses now. | Let's find out. |
| 4.0–7.5s | Camera moves from the contact waypoint `[0, 2, 18]` out to launchpad `[0, 6, 70]`. Planets fade in by category order: peach, sky, mint, lavender, butter, pink. | Pick a planet. |
| 7.5–10.0s | Mascot (stargazer) and the glass panel fade up. Camera settles. | Free labs. Check every source. |
| 10.0–12.0s | Scrim gone. The page is the hero from section 1. Focus moves to the h1. | Explore the labs |

Skip is visible for the whole 12 seconds. Skip cuts to the settled hero, sets `sessionStorage` `cm.arrival.seen`, and focuses the h1. Play arrival is the only way to see it again in that tab.

### When it runs

Autoplay only when all of these are true: fine pointer, motion is full, `saveData` is off, the tier is not `static`, and `cm.arrival.seen` is unset. Even then, the headline paints first. The camera move starts only after the scene chunk has loaded and the first poster frame (or the SVG) has painted. Coarse pointers, reduced motion, save-data, and the static tier get the poster and a Play arrival button. They never get a surprise move.

There is no music. If the visitor has already turned sound on, one existing `open` cue may play on the last beat. Nothing plays on autoplay without a prior gesture.

The trailer does not scroll the page and does not hide `#labs`. The lab list is in the HTML before any script runs. Captions are the four lines in the table; they live in a polite live region that updates on each beat. Reduced motion shows the final line immediately and does not run the wormhole.

## 6. Performance budget

Do not raise the numbers in `docs/PERFORMANCE-BUDGETS.md`. The cinematic pieces have to fit in the budget that file already sets for the home page.

### Ceilings to keep

| Budget | Limit | Where this redesign spends it |
|---|---|---|
| HTML | ≤ 30 KB gzip | Keep baked cards. Do not duplicate the catalog as a second JSON blob inside the HTML. |
| CSS, including critical CSS | ≤ 35 KB gzip | Icon-menu and hero layout live in `css/content.css` and `css/nav.css`. No new framework. |
| Initial JS | ≤ 50 KB gzip | Settings, nav, mascot controller, form. The bot is not in this set. |
| Scene chunk, lazy | ≤ 230 KB gzip | Trailer, wormhole, and bloom stay inside `js/universe` and the vendored Three module. |
| Glyph GLB | ≤ 120 KB | Unused. Do not add a GLB. The atlas in `glyphs.js` is the planet icon. |
| Fonts | ≤ 110 KB | Space Grotesk and Atkinson Hyperlegible only, already self-hosted. |
| Hero poster AVIF at 768w | ≤ 60 KB | The Arrival still. One file, not a srcset of grades. |
| First mascot SVG, inline | ≤ 14 KB gzip | Stargazer stays inline. Other variants load with the mascot module. |
| Transfer before interaction | ≤ 450 KB mobile; ≤ 900 KB desktop after the scene | Mobile does not download the scene until idle or until Play arrival. |
| Requests before LCP | ≤ 15 | LCP is the h1 (text) or, if a poster is the largest paint, that one AVIF. The canvas is hidden until after that paint. |

Field targets stay LCP ≤ 2.5 s in the lab, and LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05 at p75 once there is traffic. TBT ≤ 200 ms.

### Rules that protect those ceilings

- WebGL starts in a task after first paint. `assemble.mjs` already dynamic-imports the universe. The trailer waits on that import. It does not become a static `<script>` in `<head>`.
- Hero `min-height: 100svh` is reserved in CSS so revealing the canvas does not shift the notebook. CLS budget is 0.05.
- Opening the icon menu or the bot panel cancels the render loop until the dialog closes. The governor in `quality.js` still steps down when a frame average is worse than 22 ms, and it still steps up only once per session.
- Mobile `initialTier()` should land on `low` or `medium` (it already does for coarse pointers and for `deviceMemory` ≤ 4). The hero must look finished on `low`: no dust, no bloom, no comets, sphere segments `[20, 14]`. Ultra is a desktop accident, not the design target.
- The bot chunk is a separate lazy module, target ≤ 15 KB gzip, loaded on the first Ask click.
- No service worker and no content-hashed rewrite in this work. `docs/PERFORMANCE-BUDGETS.md` defers both until a real build exists.
- No new third-party script. Turnstile stays limited to the contact chapter.

`js/trust` byte limits (8 KB CSS, 20 KB JS) still belong to that slice. Hero, menu, and bot CSS must not be added to `css/trust.css`.

## 7. Build order

Each step leaves `/` usable, including with JavaScript off and with motion reduced. Preview on a fork or a Pages preview. Do not force-push `main`. Before the first visual replacement, tag the current `main` as `pre-redesign` and keep a `legacy` branch, as `docs/ROLLBACK.md` describes. That tag is a maintainer action; it is not part of writing this plan.

1. **Link allowlist.** Add the three-destination check to CI for the front door and the shared nav and footer. Convert card sources, timeline sources, the CC anchor, and the Cloudflare privacy anchor to text. Point More only at `#gems` and the same-site gallery. Confirm no `mailto:` and no empty `href`. Do this before any new visual, so new tiles cannot grow new hosts.

2. **Hero shell, no new scene behavior.** Reserve `100svh`, place the glass panel, swap the planet row to large icons with `#lab-{id}` targets, and add the poster `<img>`. Leave the canvas `hidden`. Check no-JS: headline, all 13 cards, contact issue link, and Ground Rules are visible. Check that LCP is the headline or the poster, and that the request count before it is ≤ 15.

3. **Icon menu.** Rebuild `#cm-menu` as the tile grid in section 3. Remove the duplicate text row from the bar. Pause the render loop while the dialog is open. Verify keyboard order, Escape, focus return, 320px width, and 48px targets. Palette lab results go to card hashes.

4. **Card grid.** Apply the anatomy in section 2 in the baked HTML and in `js/content/render.mjs`, so a refill cannot bring the old source anchors back. Wire `focusLab` from hover and focus. Keep filters. Confirm a hash such as `#lab-sip-universe` scrolls to the article and opens it when filters had hidden it.

5. **Scene as backdrop.** Unhide the canvas after the first frame, rest on the launchpad waypoint, and cross-fade off the SVG. Honor static, reduced motion, context loss, and hidden-tab. On `low`, confirm the frame matches the tier table (no bloom, no dust). Desktop may bloom. The SVG remains in the DOM for the static tier.

6. **Trailer.** Add the 12 second controller inside the universe module, with Skip, `cm.arrival.seen`, and the autoplay gate from section 5. Captions go to the polite live region. Confirm a reduced-motion load never calls `wormhole.render`.

7. **Bot.** Lazy module, intent table, no network, no storage. Hook variant changes through the existing mascot context map and `cm:mascot`. Confirm the contact form still submits without the bot script having loaded.

8. **Shared footer pass.** One footer implementation, used by `/` and by the trust pages, follows the link rule. License names stay. MIT still links to `/privacy.html#licenses`. Re-run the trust tests (`node --test .github/scripts/trust.test.mjs`) and `node .github/scripts/validate-labs.mjs --ci`.

9. **QA from `docs/QA-MATRIX.md`.** Cover the rows this work unblocks: T-NAV (menu, palette, skip links), T-SCN (tiers, context loss, reduced motion), T-MAS (schedule plus the bot's refusal to wander), T-A11Y (axe, 200% and 400% zoom, forced colors, keyboard only), and T-PERF (byte checks plus a Lighthouse pass on the assembled `/`). Devices named in that matrix: iPhone SE and a current iPhone in Safari, a low-end Android, iPad portrait and landscape, and desktop Safari, Chrome, Firefox, and Edge.

10. **Ship.** Merge only when `/data/labs.json` validates, the scene, nav, content, and trust slices are on the same preview, and the custom domain still follows `/CNAME`. Rollback is a Pages publish of `pre-redesign`, not a redeploy of the contact worker. If the new front door misbehaves, the worker can stay; the static tag is what visitors see.

## Out of scope

- Rebuilding the lab campuses. They keep their own pages, their own source links, and their own repos.
- A new renderer, a GLB pipeline, or a bundler. Three.js stays the vendored module. GitHub Pages stays a file root.
- Vendor logos, mascot merchandise, or a new brand name. The mark in `brandMark()` and the SVG mascots stay.
- A hosted assistant, an analytics script, a video CDN, or a music track.
- Hashed assets and a service worker. Those wait for a build, per the performance doc.
- Filling the empty social profiles. Linktree is the list.

## Done when

- A first visit with motion allowed shows Arrival once, can skip it, and lands on a usable hero with all 13 labs in the HTML.
- A reduced-motion visit never moves the camera and never runs the wormhole.
- The menu is a large-icon dialog with two external tiles: [Linktree](https://linktr.ee/cyphermonkey) and [GitHub](https://github.com/CypherMonkeyLabs).
- Every other visitor-facing anchor is this site, including [the front door](https://cyphermonkeylabs.com/) and the lab paths under it.
- Ask the monkey answers from the catalog, stores nothing, and does not add a network host.
- Byte and frame ceilings in section 6 still pass, including the trust-slice limits CI already enforces.
- Ground Rules, the affiliation lines, and the contact fallback to GitHub issues still behave as `docs/INTEGRATION.md` and `docs/QA-MATRIX.md` describe.
