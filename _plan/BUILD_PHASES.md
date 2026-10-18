# Build phases: day-sized steps, tests, risks

Planning only. Each step is one working day or less, ends with a PR that leaves `/` working (with JS, without JS, and under reduced motion), and can be reverted on its own. Steps reference ideas by their title in [`IDEAS.md`](IDEAS.md).

Ground rules for every step:

- Work on a branch, open a PR, let CI run, Lucky merges. **No direct pushes to `main`.**
- Preview on a local server or a fork's Pages before merge; the live site is `main`.
- Each PR attaches before/after screenshots (desktop 1440×900, mobile 390×844, reduced motion) from the visitor test suite below.
- Do not raise any number in `docs/PERFORMANCE-BUDGETS.md`.

---

## Day 0: decisions and inputs (Lucky, about 1 hour)

| Input | Where it goes | Blocks |
|---|---|---|
| Exact URLs for the 12 Linktree handles (X, Telegram, Instagram, Facebook, Bluesky, TikTok, Threads, Substack, WhatsApp Channel, YouTube, Spotify, GitHub) | `data/socials.json` | Day 3 rail links (the rail can ship with only verified links) |
| OK to link `dev.to/cyphermonkey` (shows a personal display name) | `data/socials.json` `confirm` flag | Day 3 |
| Zodiac mark choice (Chinese zodiac Monkey 猴/申, emoji, or own glyph) | `assets/brand/` | Day 2 poster art |
| Timeline placement (recommendation: B, right column) | `LAYOUT.md` §5 | Day 4 |
| Category names (`SITE_PLAN.md` §4.3) | `data/categories.json` | Day 1 |
| First 5 "learning" and "sharing" timeline entries | `data/timeline.json` | Day 4 (building entries are automatic) |
| Final short bio in his words | `data/author.json` | Day 5 |
| Update the `cipher0x9` GitHub bio away from "Voice/UC engineer" | GitHub profile (outside this repo) | Nothing; identity consistency |
| GitHub App + secrets for lab sync (`docs/LAB-HOOKS.md` on `feat/lab-manifest-hooks`) | Repo/org settings | Day 6 |

## Day 1: one registry and a build script

- Tag the current live commit as `pre-hub-v2` (the existing `pre-redesign` is a **branch** at `f8645e5` from 2026-10-15, older than today's front door; there are no tags).
- Make `/data/labs.json` the only registry: add `aliases` for the old `/labs.json` ids, add the Gems gallery as `kind: "gallery"`, merge the two category lists.
- Keep `/labs.json` as a generated compatibility file for one release.
- Add `scripts/build-hub.mjs` (zero dependencies) that renders the door cards, lab count, sitemap, and guide-bot data between `<!-- cm:generated:* -->` markers. CI step: build, then `git diff --exit-code`.
- Ideas: *Single registry with aliases*, *Build step renders doors and pages*, *Sitemap generated from registry*.
- Done when: the live page renders byte-identical text except the generated regions; validator passes; visitor suite green.

## Day 2: poster-first stage (2.5D)

- Replace the hero's right side with the centre stage: inline SVG monkey (from `assets/mascot/`) in layers, CSS zodiac ring, `cyphermonkeylabs.com` under it, CTAs "Explore N labs" and "Ask the monkey".
- Pointer and focus eye-tracking; breathing; reduced-motion still frame.
- Ideas: *2.5D layered SVG monkey*, *Zodiac ring of 12 marks*, *Eye and head tracking*, *Poster-first stage*, *Animated gradient domain text*.
- Done when: LCP element is the inline SVG or the H1; Lighthouse mobile LCP ≤ 2.5 s; no layout shift from the ring (CLS ≤ 0.05).

## Day 3: left social rail and bottom bar

- `data/socials.json` (see `LAYOUT.md` §2.2). Unknown URLs render nothing. LinkedIn is in the deny-list.
- CSS 3D coins with unmodified glyphs; mobile "Follow" sheet.
- Bottom bar with the shortened Ground Rules text and three CSS globes (website, GitHub org, Linktree).
- Extend `check-frontdoor-links.mjs` so allowed hosts come from `socials.json` plus today's list, and add a deny rule for `linkedin.com`.
- Ideas: *Hover a social tile, monkey looks*, *Glass shimmer down the social rail*.
- Done when: every rendered social link is in `socials.json` with a non-null URL; axe has no serious issues on the rail; tab order matches `SITE_PLAN.md` §7.

## Day 4: timeline (placement B)

- Extend `data/timeline.json` with `kind: learning | building | sharing`; building entries generated from registry dates.
- Right column on ≥ 1024 px, swipe strip below.
- `/timeline/` static page with all entries (scroll-story version comes later).
- Ideas: *Timeline filters*, *Now page*.
- Done when: no entry without a date or a `[TBD]` marker ships; the list is an `<ol>` with `<time datetime>`.

## Day 5: doors at scale

- Filter chips with URL state; command palette searches labs and timeline; "See all N labs" goes to a generated `/labs/` page and category pages.
- Featured rotation (12 doors max on `/`).
- Ideas: *Command palette as universal search*, *Filter chips with URL state*, *Category landing pages*, *Featured rotation*, *Health-aware cards*.
- Done when: a 100-lab fixture (generated test data, not real labs) renders `/` within budget and `/labs/` with working filters.

## Day 6: labs add themselves

- Rebase `feat/lab-manifest-hooks` onto the new build; `sync-lab.yml` opens PRs that also run the build script.
- Ship the lab template repo (`templates/lab-repo/`) with the shared chrome tag and the visitor tests.
- Ideas: *lab.manifest.json auto-sync*, *Lab template repo*.
- Done when: a manual `sync-lab` run against one lab produces a PR whose CI passes, and an invalid manifest produces no PR.

## Day 7: shared chrome for every lab

- `/shared/v1/cm-chrome.js` with `<cm-header>`, `<cm-guide>`, `<cm-footer>`, `<cm-social-rail>`, each with a light-DOM fallback. ≤ 25 KB gzip total.
- Pilot in one lab (Python Lab, newest).
- Ideas: *Shared chrome semver*, *Cross-lab breadcrumb trail*, *Recently opened labs*.
- Done when: the pilot lab's own tests pass, and the hub's palette opens inside the lab.

## Day 8: living 3D monkey (procedural)

- Procedural low-poly monkey in the existing three.js bundle; quality tiers; canvas cross-fades over the poster; pause off screen.
- Selective bloom and particles on `high` only.
- Ideas: *Procedural low-poly monkey*, *Breathing and blink idle*, *Quality tiers with frame probe*, *Bloom on the zodiac ring*, *Rising particle field*.
- Done when: scene chunk ≤ 230 KB gzip, mobile transfer before interaction ≤ 450 KB, frame time p95 ≤ 20 ms on the CI software renderer at `medium` (a proxy, not a device test).

## Day 9: guide bot upgrade (static)

- Bot answers from the registry, timeline, and Gems data, and shows its source for each answer; "talk to Lucky" hands off to the contact form.
- Ideas: *Static FAQ guide (default)*, *Bot cites its source*, *Bot handoff to a human*, *Bot suggests a path*.
- Done when: no network request leaves the origin when the bot is used.

## Day 10: quality gates and polish

- Lighthouse CI and axe as required checks; content linter word list (identity rules from `SITE_PLAN.md` §2); `assets/CREDITS.json` check.
- Ideas: *Lighthouse CI budgets*, *axe accessibility gate*, *Content linter*, *Asset credits check*, *View Transitions between hub and /labs/*.
- Done when: all gates run on PRs and the full visitor suite passes on the assembled site.

## After day 10 (pick from `IDEAS.md` top 60)

Scroll-story `/timeline/` (placement C), zodiac spin quiz, banana hunt across labs, lab passport and zodiac badges, voice greeting, agent-flow visualiser, omni-channel demo booth. Each stays a day-sized PR.

---

## Test plan

### Visitor tests (Playwright)

Run against a local static server of the branch (`python3 -m http.server`) in CI. Playwright (Apache-2.0) lives in a `tests/` folder with its own `package.json`, so the site root stays dependency-free.

| ID | Visitor story | Viewports | Assertion |
|---|---|---|---|
| V-01 | First visit sees the monkey and domain | 1440, 390 | `h1` or stage text contains `cyphermonkeylabs.com`; poster SVG visible before scene |
| V-02 | Opens a lab from a door | 1440, 390 | Click first door → URL starts with `https://cyphermonkeylabs.com/` and the response is 200 |
| V-03 | Every door link is in the registry | 1440 | Set of door hrefs equals the set of `url` in `/data/labs.json` (featured subset on `/`, all on `/labs/`) |
| V-04 | Lab count is correct | 1440 | "Explore N labs" N equals registry count of `kind: lab` |
| V-05 | Social rail shows only known links | 1440, 390 | Every rail `<a>` href is a non-null `url` in `socials.json`; no `linkedin.com` anywhere |
| V-06 | Bottom bar globes | 1440, 390 | Three links: site, GitHub org, Linktree; disclaimer text present |
| V-07 | Timeline renders | 1440, 1024, 390 | Placement B column at ≥ 1024; strip at 390; entries in date order |
| V-08 | Search finds a lab | 1440 | Ctrl/Cmd+K, type "sip", Enter → SIP Universe |
| V-09 | Filters share state | 1440 | Click "Protocols" → URL has `?cat=protocols`; reload keeps it |
| V-10 | Keyboard only | 1440 | Tab order matches spec; focus visible; Esc closes palette and bot |
| V-11 | Reduced motion | 1440, 390 | `reducedMotion: 'reduce'` → no running CSS animations on stage; no canvas |
| V-12 | No JavaScript | 1440, 390 | `javaScriptEnabled: false` → all doors, rail links, globes, disclaimer present |
| V-13 | No WebGL / save-data | 1440 | Scene not created; poster remains |
| V-14 | Accessibility scan | 1440, 390 | axe-core: zero serious or critical on `/`, `/labs/`, `/timeline/` |
| V-15 | No console errors | all | No `console.error` or `pageerror` |
| V-16 | Reflow | 320, 400% zoom | No horizontal scroll |
| V-17 | Performance | mobile | Lighthouse CI: LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.05, transfer ≤ 450 KB |
| V-18 | 100-lab fixture | 1440 | `/` still ≤ 12 doors; `/labs/` renders 100; build under budget |
| V-19 | Identity words | n/a | Content linter: no "UC engineer" / "contact-center engineer" label; no LinkedIn |
| V-20 | Shared chrome in a lab | 1440 | Pilot lab shows `<cm-header>`; "All labs" opens palette |

### Before and after screenshots

1. **Baseline now**: [`screens/before-home-desktop.jpg`](screens/before-home-desktop.jpg) and [`screens/before-home-mobile.jpg`](screens/before-home-mobile.jpg) were taken from the live site on 2026-10-18 (Chrome via `playwright-core`). Measured at that time: 23 requests, about 294 KB transferred, page height 8,246 px (desktop) and 10,367 px (mobile).
2. **Per PR**: the suite captures the same viewports plus reduced motion and no-JS into `test-results/screens/` and uploads them as a CI artifact; the PR description embeds before/after pairs.
3. **Visual diff**: Playwright `toHaveScreenshot` with masks on animated regions (canvas, marquee, particles) and a 0.2% pixel threshold. Baselines update only in a PR that says so.
4. **Mockup comparison**: the three mockups were captured the same way ([`screens/`](screens/)); the Day 2 to Day 4 PRs should be compared against `mockup-b-right-column-*`.

### Manual checks (cannot be automated here)

Real devices from `docs/QA-MATRIX.md` (iPhone SE, low-end Android, iPad), VoiceOver and TalkBack passes, NVDA with Firefox, a check that each social link opens Lucky's account (only he can confirm), and brand-guideline review for each social glyph.

---

## Risks and unknowns

| Risk / unknown | Impact | Mitigation |
|---|---|---|
| Social URLs unknown for 12 of 14 profiles | Rail ships mostly empty | Ship with verified links only; empty entries render nothing |
| A 200 response does not prove account ownership | Visitors sent to a stranger | Only Lucky confirms URLs; no guessing |
| dev.to profile shows a personal display name | Privacy | Lucky confirms before linking |
| Brand guidelines may forbid 3D treatment of logos | Takedown or trust risk | Glyph unmodified on our own 3D tile; per-brand review [TBD] |
| GLTF loader not in the vendored three.js bundle | Budget overrun if a GLB monkey is used | Procedural monkey first; measure the loader before deciding |
| GitHub Pages cache is `max-age=600` with no hashed filenames | Stale shared chrome in labs for up to 10 min; mixed versions | Versioned `/shared/v1/` paths; additive changes only |
| Same-origin labs share `localStorage` | One lab can overwrite another's keys | Namespaced keys; nothing sensitive stored |
| Two registries with different ids today | Broken links and wrong counts | Day 1 consolidation with aliases |
| Lab-sync needs a GitHub App and secrets | Day 6 blocked | Day 0 setup by Lucky; manual PRs until then |
| Scheduled workflows can be delayed and are disabled after 60 days without activity in public repos (noted in `docs/LAB-HOOKS.md`) | Reconcile stops | Dispatch is the primary path; nightly job is a backstop |
| `_plan/` would be published if merged to `main` (`.nojekyll` means underscore folders are served) | Mockups become public at `/_plan/` | Keep this PR unmerged, or add `_plan/` to a `robots.txt` disallow and keep the `noindex` meta already in each mockup |
| Private library `cipher0x9/cypher-monkey-labs-library` was not readable | Reuse map relies on attached docs and fresh API checks | Re-run the reuse filter (`REUSE_MAP.md` §6) once access is granted |
| Licences change over time | A once-MIT repo could relicense | Re-check on the day of reuse; record version and date in `THIRD_PARTY_NOTICES.md` |
| Copyright line on the MIT licence names the project, not a person | Legal clarity | Existing open item in `docs/PROGRESS.md`; Lucky decides |
| Effort estimates are judgement calls | Days may slip | Each day ends in a mergeable PR, so slipping a day does not break the site |
| Reward/credit features drift toward money or tokens | Legal and trust risk | No cash or token value by default; any such idea needs Lucky's explicit decision |
