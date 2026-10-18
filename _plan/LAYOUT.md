# Layout spec: cyphermonkeylabs.com front door

Planning only. Mockups that show this spec: [`mockups/a-top-strip.html`](mockups/a-top-strip.html), [`mockups/b-right-column.html`](mockups/b-right-column.html), [`mockups/c-scroll-story.html`](mockups/c-scroll-story.html), and a side-by-side viewer [`mockups/index.html`](mockups/index.html). Screenshots are in [`screens/`](screens/).

Lucky's brief, in one picture:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ header: logo monkey · Labs · Timeline · About · Contact · [Search ⌘K] [Menu] │
├────┬─────────────────────────────────────────────────────────────────────────┤
│ X  │                                                                         │
│ TG │                     ◯ zodiac ring (12 marks, monkey lit)                │
│ IG │                        ┌───────────────┐                                │
│ FB │                        │   3D MONKEY   │  ← living, effects             │
│ BS │                        └───────────────┘                                │
│ TT │                       cyphermonkeylabs.com                              │
│ TH │          "Lifelong student. AI builder. Learning in public."           │
│ SS │                [ Explore N labs ]   [ Ask the monkey ]                  │
│ WA │                                                                         │
│ YT │   timeline goes here in one of 3 placements (section 5)                 │
│ SP │                                                                         │
│ GH │                                                                         │
│ dev│                                                                         │
│ HF │                                                                         │
├────┴─────────────────────────────────────────────────────────────────────────┤
│ bottom bar: disclaimer text ……………………………  (🌐 website) (🌐 GitHub) (🌐 Linktree) │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Grid and breakpoints

| Breakpoint | Width | Left rail | Stage | Timeline (recommended B) | Bottom bar |
|---|---|---|---|---|---|
| `xs` | < 480 px | Hidden; a "Follow" pill opens a sheet with all icons | Full width, monkey 64 vw | Horizontal strip under the stage | Static at page end, 2 rows (globes, then disclaimer) |
| `sm` | 480 to 767 | Hidden; same pill | Full width | Strip | Static, 2 rows |
| `md` | 768 to 1023 | Fixed, 56 px wide, icons 40 px | Centre column | Strip under stage | Fixed slim bar, 1 row |
| `lg` | 1024 to 1439 | Fixed, 72 px, icons 48 px | Centre | Right column 320 px | Fixed slim bar |
| `xl` | ≥ 1440 | Fixed, 80 px, icons 52 px, labels on hover | Centre | Right column 360 px | Fixed slim bar |

CSS grid for `lg`+:

```css
.front { display: grid; grid-template-columns: var(--rail) 1fr var(--side); grid-template-rows: auto 1fr auto; min-height: 100dvh; }
/* rail = 72-80px, side = 320-360px (timeline B) or 0 (A, C) */
```

Layering (z-index tokens): canvas 0 · page content 10 · left rail 20 · bottom bar 30 · guide bot 40 · palette/menu 50 · toast 60.

---

## 2. LEFT: social rail (3D icons)

### 2.1 Handles

Source: the public Linktree page at `https://linktr.ee/cyphermonkey`, read 2026-10-18. It lists **12 entries, each labelled "@CypherMonkey"**: X, Telegram, Instagram, Facebook, Bluesky, TikTok, Threads, Substack, WhatsApp Channel, YouTube, Spotify, GitHub. The Linktree page did not expose the destination URLs to the tools used here, so most URLs are unknown.

Other profiles from the brief: `dev.to/cyphermonkey` and `huggingface.co/Cypher0x9`.

| # | Platform | Label | Exact URL | Status |
|---|---|---|---|---|
| 1 | X | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 2 | Telegram | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 3 | Instagram | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 4 | Facebook | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 5 | Bluesky | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 6 | TikTok | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 7 | Threads | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 8 | Substack | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 9 | WhatsApp Channel | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 10 | YouTube | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 11 | Spotify | @CypherMonkey | [HUMAN INPUT REQUIRED] | Listed on Linktree; URL not verified |
| 12 | GitHub | @CypherMonkey | [HUMAN INPUT REQUIRED]: which account? `github.com/CypherMonkeyLabs` (org) and `github.com/cipher0x9` (personal) both exist | Both return 200; which one Linktree points to is unknown |
| 13 | DEV | cyphermonkey | `https://dev.to/cyphermonkey` | Returns 200 (2026-10-18). The profile shows a personal display name, joined 2026-10-15, 0 posts. [HUMAN INPUT REQUIRED: confirm it is OK to link a profile that shows a personal name] |
| 14 | Hugging Face | Cypher0x9 | `https://huggingface.co/Cypher0x9` | Verified as Lucky's account through the connected Hugging Face login (2026-10-18). 0 public Spaces and 0 public models at that time. |
| — | LinkedIn | — | — | **Off the public site.** Add to the link-checker deny-list. |

Why the unknown URLs are not guessed: several of these hosts answer HTTP 200 for any handle (or redirect to a login page), so a successful request does not prove the account is Lucky's. Shipping a guessed URL risks sending visitors to someone else's account.

### 2.2 Data file (draft, not wired)

`/data/socials.json`. Entries with `"url": null` render **nothing** (not a dead icon):

```json
{
  "schemaVersion": 1,
  "verifiedOn": null,
  "profiles": [
    { "id": "x",        "label": "X",                "handle": "@CypherMonkey", "url": null, "order": 1 },
    { "id": "telegram", "label": "Telegram",         "handle": "@CypherMonkey", "url": null, "order": 2 },
    { "id": "instagram","label": "Instagram",        "handle": "@CypherMonkey", "url": null, "order": 3 },
    { "id": "facebook", "label": "Facebook",         "handle": "@CypherMonkey", "url": null, "order": 4 },
    { "id": "bluesky",  "label": "Bluesky",          "handle": "@CypherMonkey", "url": null, "order": 5 },
    { "id": "tiktok",   "label": "TikTok",           "handle": "@CypherMonkey", "url": null, "order": 6 },
    { "id": "threads",  "label": "Threads",          "handle": "@CypherMonkey", "url": null, "order": 7 },
    { "id": "substack", "label": "Substack",         "handle": "@CypherMonkey", "url": null, "order": 8 },
    { "id": "whatsapp", "label": "WhatsApp Channel", "handle": "@CypherMonkey", "url": null, "order": 9 },
    { "id": "youtube",  "label": "YouTube",          "handle": "@CypherMonkey", "url": null, "order": 10 },
    { "id": "spotify",  "label": "Spotify",          "handle": "@CypherMonkey", "url": null, "order": 11 },
    { "id": "github",   "label": "GitHub",           "handle": "@CypherMonkey", "url": null, "order": 12 },
    { "id": "devto",    "label": "DEV",              "handle": "cyphermonkey",  "url": "https://dev.to/cyphermonkey", "order": 13, "confirm": true },
    { "id": "hf",       "label": "Hugging Face",     "handle": "Cypher0x9",     "url": "https://huggingface.co/Cypher0x9", "order": 14 }
  ],
  "deny": ["linkedin.com"]
}
```

The existing `profiles` array in `/site.json` (13 slots, 11 empty) becomes this file. CI: the front-door link allowlist reads its hosts from `socials.json`, so adding a URL here is the only way to permit a new social host.

### 2.3 Visual: "3D tiles"

- Each icon is a **48 to 52 px rounded glass coin**: a CSS 3D stack (front face, 4 px extruded edge built from 6 stacked layers, soft contact shadow) with the **unmodified flat brand glyph** on the face. The 3D is ours; the logo is not altered (see the asset policy in `SITE_PLAN.md` §9).
- Idle: tiles sit at `rotateY(-18deg)` facing the stage, like they are looking at the monkey. A slow shimmer passes down the rail every 8 s (off with reduced motion).
- Hover/focus: the tile turns to face the visitor (`rotateY(0)`), lifts 6 px, and a label slides out ("X · @CypherMonkey"). The monkey's eyes turn toward the hovered tile (link between rail and stage).
- Press: a 120 ms squash, then the link opens in a new tab.
- Upgrade path (optional, day-sized): render the rail in the same WebGL canvas as the monkey with `SVGLoader` + `ExtrudeGeometry` for the coin, keep the glyph as a decal texture. Only on the `high` quality tier.
- Mobile: one "Follow Cypher Monkey" pill above the bottom bar opens a bottom sheet with a 4-column grid of the same tiles.

---

## 3. CENTER: the living CypherMonkey

### 3.1 Composition

```text
              · ✦ ·   particles drifting upward   · ✦ ·
          ╭──────── zodiac ring: 12 marks ────────╮
         ╱   🐀  🐂  🐅  🐇  🐉  🐍  🐎  🐐  [🐒]  🐓  🐕  🐖  ╲   monkey mark glows; ring turns slowly
        │              ┌──────────────┐               │
        │              │  3D MONKEY   │  breathing,   │
        │              │  head + arms │  eye-tracking │
        │              └──────────────┘               │
         ╲            soft floor glow / reflection   ╱
          ╰─────────────────────────────────────────╯
                     cyphermonkeylabs.com            ← real HTML text, under the monkey
           Lifelong student · AI builder · learning in public
```

- The domain `cyphermonkeylabs.com` is real HTML text (selectable, readable by screen readers), set under the monkey in the display font, with a subtle animated gradient. Alternative: to the right of the monkey on `xl` screens. [HUMAN INPUT REQUIRED: under or beside.]
- "Zodiac monkey symbol everywhere": the ring mark is reused as favicon, logo, card corner stamp, loading spinner, bot avatar, bottom-bar divider, 404 page art, and OG image. Default reading: the Chinese zodiac Monkey (猴; earthly branch 申), ninth of the twelve animals. [HUMAN INPUT REQUIRED: confirm the exact symbol, or provide Lucky's own glyph.]
- The 12 ring marks in the mockups are emoji placeholders. Production art must be original or from a licence-safe set (Fluent Emoji, MIT; or Twemoji graphics, CC BY 4.0 with attribution), recorded in `assets/CREDITS.json`.

### 3.2 States and effects

| State | Trigger | Effect | Reduced motion |
|---|---|---|---|
| Poster | First paint | Inline SVG monkey + ring (LCP element) | Same |
| Wake | WebGL ready | Canvas cross-fades over the poster in 400 ms; monkey blinks | Stays poster |
| Idle | Default | Breathing scale 1.00↔1.02 over 4 s; ring rotates 1 turn / 120 s; particles rise | Static |
| Look | Pointer / focus moves | Head and eyes follow pointer (clamped ±25°), or the focused element | Off |
| Greet | Every 20 s or click | Wave + greeting in one of the 14 existing languages from `site.json` (text only; speech only if sound is on) | Text only |
| Hover door | Pointer over a lab card | Ring glows in that lab's accent colour; monkey glances at the card | Colour only |
| Open lab | Card click | Quick "portal" ring zoom (300 ms) then navigation | Instant navigation |
| Listen | Sound on + mic never used | Particles and ring pulse to the ambient pad (`js/cinema/audio.js`) | Off |
| Sleep | Tab hidden / off screen | Render loop paused | — |
| Fallback | No WebGL / save-data / low tier | CSS parallax on the SVG layers | Static |

Effect stack on the `high` tier: unreal-style bloom on the ring, a fresnel rim light on the monkey, GPU particles (≤ 2,000), a soft floor reflection. `medium`: no bloom, 500 particles. `low`: SVG only.

### 3.3 Calls to action under the stage

1. **Explore N labs** (N from the registry at build time) → `#doors`.
2. **Ask the monkey** → opens the guide bot (existing drag-bot answers).
3. Text link: "What I'm learning this week" → timeline.

---

## 4. BOTTOM: disclaimer bar + 3 globes

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ⚠ Free practice labs, not official training. Not affiliated with any company     │
│   named in the labs. Code MIT · content CC BY-NC-SA 4.0 · Privacy     (◉)(◉)(◉) │
│                                                          website GitHub Linktree │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| Globe | Destination | Verified |
|---|---|---|
| Website | `https://cyphermonkeylabs.com/` | 200, 2026-10-18 |
| GitHub | `https://github.com/CypherMonkeyLabs` | 200, 2026-10-18; already linked on the live site |
| Linktree | `https://linktr.ee/cyphermonkey` | Page content read 2026-10-18; already linked on the live site |

- **Disclaimer text** is the existing Ground Rules wording from `js/trust/footer.js` / `site.json` (`trademark`, `licenseLine`), shortened to one line with a "More" link to `/privacy.html`. No new legal claims.
- **Globe style**: 40 px spheres drawn in CSS (radial-gradient body, two meridian ellipses, a latitude line, a specular highlight) with the destination glyph in the centre. On hover the meridians rotate (CSS `@keyframes` on `rotateY`), giving a spinning-globe feel without WebGL.
- Desktop: fixed slim bar (56 px) that hides on scroll down and returns on scroll up; always visible at the page end. Mobile: static block at the end of the page, globes first, then the disclaimer.
- It replaces nothing in the existing footer: the full `mountFooter` (Ground Rules panel, licence columns) still renders above it at the end of the page.

---

## 5. Timeline: "What I'm learning, building, sharing"

### 5.1 Data

Extend `/data/timeline.json` (today: verified history events) with a second track for Lucky's own log. Draft entry:

```json
{
  "id": "2026-10-17-python-lab",
  "date": "2026-10-17",
  "kind": "building",
  "title": "Python Lab is live",
  "summary": "A browser-based Python lab, from print to projects.",
  "labIds": ["python-lab"],
  "links": [{ "label": "Open the lab", "url": "https://cyphermonkeylabs.com/python-lab-free-university-mesmerizing/" }],
  "source": "registry"
}
```

`kind` is one of `learning` (course, book, paper he is studying), `building` (lab shipped or updated), `sharing` (post, talk, video). Building entries are generated automatically from registry `launchedAt` / `updatedAt`. Learning and sharing entries are written by Lucky. [HUMAN INPUT REQUIRED: the first 5 learning/sharing entries; none are invented here.]

### 5.2 Three placements

| | A. Top strip | B. Right column | C. Scroll story |
|---|---|---|---|
| Where | A ticker band directly under the header, above the stage | A 320 to 360 px column to the right of the stage, sticky | A full-screen chapter after the stage: scroll moves the camera along a path; each stop is an entry |
| Desktop | One line, auto-scrolling marquee (pausable), 3 filter chips | Vertical list of the latest 6 entries, chips for the 3 kinds, "Full log" link | 6 to 10 scenes, sticky canvas, text cards on the side |
| Mobile | Same strip, swipeable | Becomes a horizontal swipe strip under the stage | Same story, simplified (no canvas, CSS reveal) |
| Strength | Recency seen at once, cheap | Visible next to the monkey without scrolling; scannable; keeps the stage centred | Most cinematic, best storytelling |
| Weakness | Marquees are easy to ignore and hard to read; motion near the top hurts reduced-motion users | Takes width from the stage on 1024 to 1280 px screens | Heavy; hides recency below the fold; long scroll on mobile; hardest to make accessible |
| Effort | 0.5 day | 1 day | 2 to 3 days |
| Perf cost | ~2 KB | ~3 KB | ~15 KB JS plus scene work |
| Mockup | [`a-top-strip.html`](mockups/a-top-strip.html) | [`b-right-column.html`](mockups/b-right-column.html) | [`c-scroll-story.html`](mockups/c-scroll-story.html) |

### 5.3 Recommendation

**B, right column**, for the front door; it keeps the monkey in the centre, shows "what's new" without scrolling, and stays readable. On mobile it becomes a swipe strip (A's mobile form). Use **C** only on `/timeline/` as the deep "story of the year" page, where heaviness is acceptable and the visitor chose to be there.

Scoring used (1 = poor, 5 = best):

| Criterion (weight) | A | B | C |
|---|---|---|---|
| Recency at a glance (3) | 4 | 5 | 2 |
| Keeps the monkey central (3) | 4 | 4 | 3 |
| Accessibility (3) | 2 | 5 | 2 |
| Wow factor (2) | 2 | 3 | 5 |
| Mobile quality (2) | 3 | 4 | 3 |
| Effort and perf (2) | 5 | 4 | 2 |
| **Weighted total (max 75)** | **50** | **64** | **41** |

---

## 6. Below the fold (order)

1. **Doors**: featured lab cards (max 12), filter chips, "See all N labs".
2. **Timeline** (if not B, or the full list link).
3. **About Cypher Monkey**: short bio in his words, the "path" chips (existing `site.json` `path`: Voice → Video → Contact centre → AI agents → Coding), and "Where I'm heading: AI omni-channel agents".
4. **Community**: rate, comment, contribute (existing `site.json` `community`).
5. **Contact** (existing Worker form).
6. Full footer (existing `mountFooter`) and then the bottom bar.

## 7. States to design

Empty registry (show "Labs are on their way" plus the GitHub link), a lab with `status: coming-soon` (dimmed door, no open link), a lab with a failing health check (badge "temporarily unreachable", from the nightly `lab-health` workflow), no JS (all links and text present), offline (service worker phase only), RTL greeting, 400% zoom.
