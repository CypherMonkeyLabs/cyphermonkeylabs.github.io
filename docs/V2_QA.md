# Version 2 QA

This is the check for the version 2 preview (`/v2/`). It runs against whatever HTML files are under `v2/` when you start it, so it can cover the hub, the effects demo, the lab portals, and the ecosystem map together.

## Run it

From the repository root, with system Chrome:

```bash
node v2/labs/build-pages.mjs
cd v2/qa
npm install
npx playwright test
```

Playwright is configured to launch system Chrome with `--no-sandbox`. It serves the repository root at `http://127.0.0.1:8766`.

Rebuild the portals and the map with `node v2/labs/build-pages.mjs` after editing `v2/labs/facts.mjs`. The HTML under `v2/labs/*/`, `v2/labs/portals/`, and `v2/map/index.html` is generated. `v2/map/relations.css` is generated with it.

## What the suite checks

Pages are every `*.html` file under `v2/`, except dependency and result folders. The suite also asserts these paths exist:

- `/v2/labs/portals/`
- `/v2/map/`
- one portal for each of the 13 labs: amazon-connect, sip-universe, uc, ai, nice-cxone, microsoft-voice-cc, genesys-cloud, five9, zoom-talkdesk-avaya, cpaas, webex, python, ba-lab-grok

For each page, at each of these viewports:

| Project | Viewport |
|---|---|
| desktop | 1440×900 |
| phone | 390×844 |
| short | 390×430 |

it records a screenshot, fails on a console error or an uncaught page error, and fails if the document scrolls sideways (`scrollWidth` more than `clientWidth` by more than 1px). Portal and map pages also get a screenshot of each main section.

Two more passes use the desktop viewport:

- **reduced-motion** emulates `prefers-reduced-motion: reduce`. Portal and map pages must set `data-motion="reduce"`. The spinning hero mark must compute `animation-name: none`.
- **webgl-off** makes `canvas.getContext("webgl")` return null. Portal heroes keep the flat SVG. The map keeps the SVG diagram, the cards, and the glossary. The optional globe button stays hidden.

On the desktop pass, every `a[href]`, stylesheet, script, and icon URL is requested. A final status of 200 or 206 passes. `link[rel=canonical]` is not requested: those are the intended public addresses, and the new portal and map URLs are not on the live host until this preview is published. The desktop project writes `v2/qa/report/links.json` (gitignored) after its pages, and copies the same file to `/opt/cursor/artifacts/v2-qa-links.json` when that folder exists. Screenshots land in `v2/qa/screenshots/` (gitignored).

## Link exceptions

Portal and map pages only link to this site, `https://github.com/CypherMonkeyLabs`, and `https://linktr.ee/CypherMonkey`. Those must return 200.

The existing hub and catalog already link to social profiles. The same three hosts the older v2 visitor test documents are not failures when the status is 400, 401, 403, or 429:

- x.com
- facebook.com
- instagram.com

Any other non-200 is a failure, including a 404 on those hosts.

## What this suite does not do

It does not run axe, a screen reader, or Lighthouse. It does not score the hub. It does not merge the preview into the live root. A missing `v2/fx/cm-fx.js` is expected until the effects library is present. The portals and the map never request that file. They call `window.CMFX.globe3d` only when that function is already on the page, and otherwise keep the flat SVG.

## Source rule for the portals

Portal copy is limited to each lab's README on `main` and the published page, both read on 19 October 2026. Where those two disagree, the page says so.

- Amazon Connect: the README describes a root study site and a campus shell. The open button uses the campus URL from the lab registry. Counts of 18 tracks and 129 lessons are the README's campus section. The published root menu also lists five chapter paths.
- AI Lab: the README says 16 tracks and 593 study pages. The published title text on 19 October 2026 included Course: 96 and Rooms: 19. Glossary 357 appears in both. The learning path follows the README diagram.
- Webex: 11 tracks and 78 rooms agree. The fetched page showed 842 flashcards in the canon block and 959 cards in the scene control.

NICE's README marks Five9 and Webex Contact Center connectors as confirm, so the map does not draw those bridges. The AI Lab README says other campuses are not linked from its pages, so the map does not add lab-to-lab lines that start from the AI Lab. Incoming mentions (another lab's page naming the AI Lab) are labeled as that other page's words.
