# Ideas: ranked backlog for the hub

Planning only. **230 ideas**, ranked by a simple score so the list can be re-sorted when Lucky changes a rating.

**Score = impact × 3 − effort × 2**, where impact is 1 (nice) to 5 (defines the site) and effort is S = 1 (≤ half a day), M = 2 (about 1 day), L = 3 (2 to 3 days), XL = 4 (4+ days or needs outside help). Ties break by higher impact, then lower effort.

Effort and impact are my estimates, not measurements. "Reuse" points at code already in this repo (backticked paths) or at outside projects whose licence is recorded in [`REUSE_MAP.md`](REUSE_MAP.md); anything marked UNKNOWN or [TBD] is link-only until checked.

Rewards and credits ideas carry **no cash or token value**. Anything involving money, sponsorship, or a blockchain is listed only so Lucky can decide; none is recommended by default.

## Count by category

| Category | Ideas |
|---|---|
| 3D | 25 |
| Effects | 25 |
| Interactions | 25 |
| Games | 21 |
| Audio and video | 17 |
| Community | 17 |
| Rewards and credits | 15 |
| Developer contribution | 20 |
| Scale and information architecture | 20 |
| Guide bot and agents | 15 |
| Accessibility and performance | 15 |
| Learning in public | 15 |
| **Total** | **230** |

## Top 25 at a glance

1. **'Where I'm heading' card** (Learning in public, S, impact 5)
2. **2.5D layered SVG monkey (day-1 stage)** (3D, S, impact 5)
3. **Asset credits check** (Developer contribution, S, impact 5)
4. **Bot cites its source** (Guide bot and agents, S, impact 5)
5. **Command palette as universal search** (Interactions, S, impact 5)
6. **Content linter** (Developer contribution, S, impact 5)
7. **Eye and head tracking** (3D, S, impact 5)
8. **Filter chips with URL state** (Interactions, S, impact 5)
9. **Lighthouse CI budgets** (Developer contribution, S, impact 5)
10. **No-JS parity** (Accessibility and performance, S, impact 5)
11. **Now page** (Learning in public, S, impact 5)
12. **Poster-first stage** (Accessibility and performance, S, impact 5)
13. **Quality tiers with frame probe** (Accessibility and performance, S, impact 5)
14. **Reduced-motion parity** (Accessibility and performance, S, impact 5)
15. **Single registry with aliases** (Scale and information architecture, S, impact 5)
16. **Static FAQ guide (default)** (Guide bot and agents, S, impact 5)
17. **axe accessibility gate** (Developer contribution, S, impact 5)
18. **Build step renders doors and pages** (Scale and information architecture, M, impact 5)
19. **Lab planets orbit the monkey** (3D, M, impact 5)
20. **Lab template repo** (Developer contribution, M, impact 5)
21. **Learning path builder** (Interactions, M, impact 5)
22. **Procedural low-poly monkey** (3D, M, impact 5)
23. **Resume where you left off** (Interactions, M, impact 5)
24. **Visual regression in CI** (Developer contribution, M, impact 5)
25. **Zodiac badges (local-only)** (Rewards and credits, M, impact 5)

## Full ranked list

| Rank | Idea | Category | What it is | Effort | Impact | Score | Reuse |
|---|---|---|---|---|---|---|---|
| 1 | **'Where I'm heading' card** | Learning in public | A clear statement of the move into AI omni-channel agents, with the labs that lead there. | S | 5 | 13 | registry `agents` category |
| 2 | **2.5D layered SVG monkey (day-1 stage)** | 3D | Split the existing mascot SVG into 5 layers and parallax them with pointer and gyro; it is the poster and the low tier forever. | S | 5 | 13 | `assets/mascot/*.svg`; CSS transforms |
| 3 | **Asset credits check** | Developer contribution | CI fails when an asset has no row in CREDITS.json. | S | 5 | 13 | own script |
| 4 | **Bot cites its source** | Guide bot and agents | Every answer shows which registry or timeline entry it came from. | S | 5 | 13 | registry ids |
| 5 | **Command palette as universal search** | Interactions | Ctrl/Cmd+K finds labs, timeline entries, settings, and actions. | S | 5 | 13 | `js/nav/palette.js` (existing) |
| 6 | **Content linter** | Developer contribution | CI word list that flags banned identity labels and unverified numbers. | S | 5 | 13 | `js/content/check-content.mjs` (existing) |
| 7 | **Eye and head tracking** | 3D | The monkey's head and pupils follow the pointer, the focused element, or the hovered social tile, clamped to ±25°. | S | 5 | 13 | Pointer Events; `Object3D.lookAt` |
| 8 | **Filter chips with URL state** | Interactions | Category, level, status chips that write to the query string for sharing. | S | 5 | 13 | registry; URLSearchParams |
| 9 | **Lighthouse CI budgets** | Developer contribution | Fail PRs that break the performance budget. | S | 5 | 13 | lighthouse-ci (Apache-2.0) |
| 10 | **No-JS parity** | Accessibility and performance | All links and text exist without JS; CI test with JS disabled. | S | 5 | 13 | Playwright `javaScriptEnabled:false` |
| 11 | **Now page** | Learning in public | A '/now' panel: what I'm learning this week, edited in one JSON file. | S | 5 | 13 | timeline.json |
| 12 | **Poster-first stage** | Accessibility and performance | SVG poster is the LCP; WebGL fades in after. | S | 5 | 13 | `js/cinema/hero.js` pattern |
| 13 | **Quality tiers with frame probe** | Accessibility and performance | Measure frame time for 2 s and pick high/medium/low. | S | 5 | 13 | `js/universe/quality.js` |
| 14 | **Reduced-motion parity** | Accessibility and performance | Every animated feature has a still equivalent; CI screenshot under reduced motion. | S | 5 | 13 | Playwright `reducedMotion` |
| 15 | **Single registry with aliases** | Scale and information architecture | Retire `/labs.json`; `/data/labs.json` is the only source, old ids kept as aliases. | S | 5 | 13 | existing validators |
| 16 | **Static FAQ guide (default)** | Guide bot and agents | The guide answers from registry and FAQ JSON only; no network call. | S | 5 | 13 | `js/cinema/dragbot.js` |
| 17 | **axe accessibility gate** | Developer contribution | Fail PRs with serious/critical axe findings. | S | 5 | 13 | axe-core (MPL-2.0; CI-only, not shipped) |
| 18 | **Build step renders doors and pages** | Scale and information architecture | A zero-dependency Node script renders cards, /labs/, categories, sitemap from the registry. | M | 5 | 11 | `js/content/render.mjs`, `assemble.mjs` (existing) |
| 19 | **Lab planets orbit the monkey** | 3D | Each registry lab becomes a small planet on the ring; at 100 labs they cluster by category into moons. | M | 5 | 11 | `js/universe/scene.js`, `layout.js`, `normalize.js` |
| 20 | **Lab template repo** | Developer contribution | A starter repo with the shared header, manifest, CI, and Playwright tests so a new lab is one click. | M | 5 | 11 | `templates/lab-repo/` on feat/lab-manifest-hooks |
| 21 | **Learning path builder** | Interactions | Choose a goal ('AI agent for a contact centre') and get an ordered list of labs. | M | 5 | 11 | registry `level` + tags; static rules |
| 22 | **Procedural low-poly monkey** | 3D | Build the monkey from three.js primitives (spheres, capsules, torus ears) so it costs no model download and can be recoloured per theme. | M | 5 | 11 | vendored three.js 0.186.1; `js/universe/quality.js` tiers |
| 23 | **Resume where you left off** | Interactions | Labs write a tiny `cm.progress.<id>` record; the hub shows 'continue room 4'. | M | 5 | 11 | shared `<cm-header>` |
| 24 | **Visual regression in CI** | Developer contribution | Playwright screenshots of hub and sample labs compared on every PR. | M | 5 | 11 | Playwright (Apache-2.0) |
| 25 | **Zodiac badges (local-only)** | Rewards and credits | Earn one of 12 zodiac badges per category explored; stored on the device only. | M | 5 | 11 | same-origin storage; own SVG badges |
| 26 | **Zodiac ring of 12 marks** | 3D | A slowly turning ring of the 12 zodiac animals with the monkey mark lit; doubles as a progress ring while the scene loads. | M | 5 | 11 | three.js `TorusGeometry` + sprites, or pure CSS 3D for low tier |
| 27 | **Zodiac spin quiz** | Games | Spin the ring; land on a lab; answer one question from that lab to light its mark. | M | 5 | 11 | lab quiz banks [TBD per lab]; ring |
| 28 | **lab.manifest.json auto-sync** | Developer contribution | Labs register themselves through a PR, never a direct push. | M | 5 | 11 | `sync-lab.yml` on feat/lab-manifest-hooks |
| 29 | **'Built with' page** | Developer contribution | List every open-source project used and its licence. | S | 4 | 10 | THIRD_PARTY_NOTICES |
| 30 | **Accessibility feedback button** | Community | A dedicated route to report accessibility problems. | S | 4 | 10 | issue template |
| 31 | **Animated gradient domain text** | Effects | `cyphermonkeylabs.com` with a slow moving gradient and a shine sweep on load. | S | 4 | 10 | CSS `background-clip:text` |
| 32 | **Bloom on the zodiac ring** | Effects | Selective bloom so only the ring and monkey eyes glow; high tier only. | S | 4 | 10 | three.js UnrealBloomPass or pmndrs/postprocessing (Zlib) |
| 33 | **Bot handoff to a human** | Guide bot and agents | 'Talk to Lucky' hands off to the contact form with context prefilled. | S | 4 | 10 | `?topic=&lab=` prefill (existing) |
| 34 | **Bot transcripts stay local** | Guide bot and agents | Conversation history lives only on the device; one-click clear. | S | 4 | 10 | localStorage |
| 35 | **Breathing and blink idle** | 3D | Subtle scale breathing and random blinks so the monkey reads as alive even when nobody touches anything. | S | 4 | 10 | three.js clock; CSS for SVG tier |
| 36 | **Bug bounty in thanks** | Rewards and credits | Reporters of verified corrections get named in the changelog and a 'fixer' badge. | S | 4 | 10 | correction issues; changelog |
| 37 | **Captioned everything** | Audio and video | Every video and audio has captions/transcripts; a CI check enforces it. | S | 4 | 10 | WebVTT |
| 38 | **Category landing pages** | Scale and information architecture | One generated page per category with its own OG image. | S | 4 | 10 | build script |
| 39 | **Contributor guide per lab** | Developer contribution | CONTRIBUTING.md with 'how to verify a fact' and 'how to run tests'. | S | 4 | 10 | existing docs style |
| 40 | **Drag the monkey anywhere** | Interactions | The guide monkey can be dragged and snaps to edges; position remembered. | S | 4 | 10 | `js/cinema/dragbot.js` (existing) |
| 41 | **Featured rotation** | Scale and information architecture | The hub shows 12 doors: pinned + newest + random, seeded per day. | S | 4 | 10 | registry `featured`, `updatedAt` |
| 42 | **Good-first-issue board** | Developer contribution | A page listing good-first-issue items across all lab repos. | S | 4 | 10 | GitHub search API at build time |
| 43 | **Health-aware cards** | Scale and information architecture | Cards show 'temporarily unreachable' from the nightly health check. | S | 4 | 10 | `lab-health.mjs` output |
| 44 | **High-contrast theme** | Accessibility and performance | A forced-colours friendly theme in the theme switcher. | S | 4 | 10 | tokens.css |
| 45 | **Hover a social tile, monkey looks** | Interactions | Rail and stage connect: the monkey glances at whichever tile you hover. | S | 4 | 10 | head tracking idea above |
| 46 | **Idle-until-urgent loading** | Accessibility and performance | Load bot, palette, and scene code on idle or first intent. | S | 4 | 10 | `requestIdleCallback` |
| 47 | **Lab cards as 3D tilting doors** | 3D | Cards tilt toward the pointer with a light sheen; already in the cinema hero, extend to every door. | S | 4 | 10 | `js/cinema/main.js` tilt; vanilla-tilt.js (MIT) as reference |
| 48 | **Lab collections** | Scale and information architecture | Curated sets ('Start with voice', 'Agents in 7 days') as JSON. | S | 4 | 10 | registry tags |
| 49 | **Lab health dashboard** | Developer contribution | Public page of nightly lab-health results. | S | 4 | 10 | `lab-health.yml` (existing) |
| 50 | **Learning-in-public feed** | Community | Timeline 'sharing' entries link to Lucky's posts once URLs are known. | S | 4 | 10 | timeline.json |
| 51 | **Pause-all-motion button** | Accessibility and performance | One visible control that stops every animation on the page. | S | 4 | 10 | `js/settings` motion |
| 52 | **Per-lab accent sweep** | Effects | Hovering a door recolours ring, particles, and focus rings to that lab's accent. | S | 4 | 10 | registry `theme.accent`; CSS custom properties |
| 53 | **Reading shelf** | Learning in public | Books, papers, and courses Lucky is studying, each with a link and a one-line takeaway. | S | 4 | 10 | [HUMAN INPUT REQUIRED] entries |
| 54 | **Recently opened labs** | Interactions | The hub remembers the last 3 labs you opened (same origin, localStorage) and shows them first. | S | 4 | 10 | same-origin storage, `cm.recent` |
| 55 | **Request a lab** | Community | Visitors vote on the next lab via GitHub issues with a 'lab-request' label. | S | 4 | 10 | existing new-lab issue form |
| 56 | **Rising particle field** | Effects | Soft particles drift upward behind the monkey, tinted by the hovered lab's accent. | S | 4 | 10 | three.js `Points`; existing universe particles |
| 57 | **Save-data mode** | Accessibility and performance | Respect `saveData`: no scene, no video, smaller images. | S | 4 | 10 | Network Information API |
| 58 | **Schools and nonprofits page** | Community | Explains free use for schools and rural programs, from `site.json` mission text. | S | 4 | 10 | `site.json` `work`, `mission` |
| 59 | **Shared chrome semver** | Developer contribution | `/shared/v1/`, `/shared/v2/` with a changelog and deprecation banner. | S | 4 | 10 | own convention |
| 60 | **Sitemap generated from registry** | Scale and information architecture | Sitemap includes every lab URL with lastVerified dates. | S | 4 | 10 | build script |
| 61 | **Source-first fact cards** | Learning in public | Every number on the hub shows its source and date on hover. | S | 4 | 10 | existing `verify` principle in author.json |
| 62 | **Status lifecycle** | Scale and information architecture | live / beta / coming-soon / archived with clear visual states. | S | 4 | 10 | schema `status` |
| 63 | **Sticky mini-stage** | Interactions | After scrolling, the monkey shrinks to a corner dock and keeps reacting. | S | 4 | 10 | `dragbot.js` dock |
| 64 | **TIL (today I learned) snippets** | Learning in public | Short TIL notes that can cross-post to DEV. | S | 4 | 10 | dev.to/cyphermonkey (confirm) |
| 65 | **Text scramble on headings** | Effects | Headings resolve from random glyphs like a cipher, a nod to 'Cypher'. | S | 4 | 10 | Splitting (MIT) + own scramble; Codrops demos link-only |
| 66 | **Timeline filters** | Interactions | Learning / building / sharing chips plus 'this month'. | S | 4 | 10 | timeline.json `kind` |
| 67 | **Build-an-agent card game** | Games | Combine cards (channel, model, tool, guardrail) to build an omni-channel agent and see if it passes a scenario. | L | 5 | 9 | AI Lab + contact-centre scenarios; own rules |
| 68 | **Voice-agent demo booth** | Audio and video | A booth that shows an AI voice agent pipeline step by step (STT → LLM → TTS), with recorded samples. | L | 5 | 9 | pipecat (BSD-2) and livekit/agents (Apache-2.0) as references |
| 69 | **Agent-flow visualiser** | Guide bot and agents | Show the bot's steps (intent → retrieve → answer) as a live flow diagram. | M | 4 | 8 | xyflow (MIT) or mermaid (MIT) |
| 70 | **Auto OG images per lab** | Scale and information architecture | Build-time OG cards from the registry with the zodiac stamp. | M | 4 | 8 | existing `og.html` + Playwright |
| 71 | **Banana hunt across labs** | Games | Hidden bananas in each lab; find all to unlock a monkey costume. | M | 4 | 8 | shared `<cm-header>` + same-origin storage |
| 72 | **Bot reads the current lab** | Guide bot and agents | Inside a lab, the bot answers from that lab's glossary JSON. | M | 4 | 8 | labs' `glossary.json` (seen in cypher-ai-lab) |
| 73 | **Bot suggests a path** | Guide bot and agents | Ask 'I want to build an AI agent' and get a 3-lab path. | M | 4 | 8 | learning path rules |
| 74 | **Contributor credits wall** | Rewards and credits | Everyone who contributed to any lab, generated from the GitHub API at build time. | M | 4 | 8 | GitHub contributors API; all-contributors spec (licence [TBD]) |
| 75 | **Effect plug-in API** | Developer contribution | A tiny interface (`mount(stage)`, `dispose()`) so contributors can add a stage effect behind a flag. | M | 4 | 8 | `js/universe` structure |
| 76 | **Flashcard streak** | Games | Daily 5-card review drawn from all labs' flashcards. | M | 4 | 8 | lab flashcard files [TBD format per lab] |
| 77 | **Guardrail demo** | Guide bot and agents | The bot visibly refuses prompt-injection attempts and explains why. | M | 4 | 8 | AI Lab T2-R07 prompt-injection content |
| 78 | **IVR maze** | Games | Navigate a phone menu maze by DTMF keys to reach a human; teaches IVR design. | M | 4 | 8 | contact-centre lab content |
| 79 | **Lab passport** | Rewards and credits | A passport page stamped by each lab you finish; printable. | M | 4 | 8 | same-origin storage; print CSS |
| 80 | **Latency limbo** | Games | Slide jitter and latency and hear how a call degrades. | M | 4 | 8 | Web Audio delay nodes |
| 81 | **Monkey costume unlocks** | Rewards and credits | Badges unlock cosmetic costumes for the monkey. | M | 4 | 8 | costume system above |
| 82 | **Monkey voice greeting** | Audio and video | The monkey greets in the visitor's language using on-device TTS. | M | 4 | 8 | Web Speech; or Kokoro-82M (Apache-2.0) via transformers.js (Apache-2.0) |
| 83 | **Portal zoom into a lab** | 3D | Clicking a door dives the camera through the ring into the lab's accent colour, then navigates; instant with reduced motion. | M | 4 | 8 | `js/universe/post.js` wormhole |
| 84 | **Prompt golf** | Games | Get the model to output a target answer in the fewest words; scored locally against fixed answers. | M | 4 | 8 | AI Lab content; no live model needed with fixed cases |
| 85 | **Shareable lab cards** | Interactions | 'Share' generates a link with a per-lab OG image. | M | 4 | 8 | build-time OG images (existing `og.html` pattern) |
| 86 | **Static search index** | Scale and information architecture | MiniSearch or Pagefind index generated at build time once labs exceed ~60. | M | 4 | 8 | MiniSearch (MIT), Pagefind (MIT) |
| 87 | **Trailer re-render from registry** | Audio and video | The 12 s trailer is rendered from data, so the lab count and names stay current. | M | 4 | 8 | `assets/trailer/trailer-src.html` (existing deterministic renderer) |
| 88 | **Translation PRs** | Developer contribution | i18n strings in JSON with a coverage report per language. | M | 4 | 8 | `js/nav/i18n.js` |
| 89 | **View Transitions between hub and /labs/** | Effects | Cross-document view transitions so the clicked card morphs into the page header. | M | 4 | 8 | View Transitions API (same origin) |
| 90 | **Weekly build log** | Learning in public | Auto-generated weekly summary of commits across lab repos. | M | 4 | 8 | GitHub API at build time |
| 91 | **Omni-channel demo: same bot, many channels** | Guide bot and agents | Show the guide answering the same question on web, a mock SMS, a mock WhatsApp, and voice; ties to Lucky's direction. | XL | 5 | 7 | pipecat (BSD-2), livekit/agents (Apache-2.0) as references |
| 92 | **Rigged GLB monkey with blend shapes** | 3D | A Blender-modelled monkey with visemes (mouth shapes) for speech and expressions for celebrate/oops. | XL | 5 | 7 | glTF-Transform (MIT) + meshoptimizer (MIT) for compression |
| 93 | **'Credits' as learning hours, not money** | Rewards and credits | Show estimated learning time completed; explicitly no cash value. | S | 3 | 7 | lab room metadata [TBD] |
| 94 | **Ambient pad, off by default** | Audio and video | A gentle generative pad that starts only after a click. | S | 3 | 7 | `js/cinema/audio.js` (existing) |
| 95 | **Archive page** | Scale and information architecture | Archived labs stay findable with a notice instead of disappearing. | S | 3 | 7 | status `archived` |
| 96 | **Aurora background per theme** | Effects | Slow aurora gradient behind the stage; already in the trust footer, reuse the token set. | S | 3 | 7 | `css/trust.css` aurora |
| 97 | **Bot personality modes** | Guide bot and agents | Calm teacher, hype coach, Socratic: same facts, different tone. | S | 3 | 7 | string tables |
| 98 | **Changelog per lab** | Scale and information architecture | Each card links to the lab's latest release notes. | S | 3 | 7 | GitHub releases API at build time |
| 99 | **Click-to-load video facades** | Audio and video | YouTube or other embeds only load after a click, keeping privacy and speed. | S | 3 | 7 | lite facade pattern; own code |
| 100 | **Community lab of the month** | Community | Feature one learner-contributed improvement each month. | S | 3 | 7 | GitHub contributors API |
| 101 | **Confetti on first lab open** | Effects | One burst of confetti in the lab's accent the first time a visitor opens any lab. | S | 3 | 7 | catdad/canvas-confetti (ISC) |
| 102 | **Copy-ready citations** | Interactions | Every fact card has 'copy citation' with title, URL, and access date. | S | 3 | 7 | sources arrays in data files |
| 103 | **Corrections board** | Community | A public list of fixed errors per lab, celebrating corrections. | S | 3 | 7 | existing correction issue template |
| 104 | **Cross-lab breadcrumb trail** | Interactions | A thin trail across the top of each lab showing hub → category → lab → room. | S | 3 | 7 | `<cm-header>` |
| 105 | **Daily cipher** | Games | A daily Caesar/Vigenère puzzle tied to 'Cypher'. | S | 3 | 7 | own puzzle set, dated JSON |
| 106 | **Day/night sky by local time** | 3D | Sky gradient and star density follow the visitor's local hour; the monkey yawns after midnight. | S | 3 | 7 | `Intl.DateTimeFormat`; tokens.css themes |
| 107 | **Dev container** | Developer contribution | A one-click dev environment with Node 22 and Playwright browsers. | S | 3 | 7 | devcontainer spec |
| 108 | **Dyslexia-friendly font toggle** | Accessibility and performance | Switch body text to Atkinson Hyperlegible (already self-hosted). | S | 3 | 7 | `assets/fonts/atkinson-*.woff2` (OFL) |
| 109 | **Easter-egg credits roll** | Rewards and credits | A movie-style credits roll of tools and libraries used, from THIRD_PARTY_NOTICES. | S | 3 | 7 | notices file |
| 110 | **Floor reflection and contact shadow** | 3D | Cheap baked shadow plus a faint mirror floor to ground the monkey. | S | 3 | 7 | three.js `ShadowMaterial`; drei `ContactShadows` (MIT) as reference |
| 111 | **Focus-follows monkey** | Accessibility and performance | The monkey looks at the focused element, making focus visible in a fun way. | S | 3 | 7 | head tracking |
| 112 | **Font subsetting** | Accessibility and performance | Subset display fonts to used glyphs. | S | 3 | 7 | existing subset fonts |
| 113 | **Gemini Gems shelf** | Guide bot and agents | Link to the existing 33 Gems desk pages from the bot. | S | 3 | 7 | `data/gems.json` |
| 114 | **Glass shimmer down the social rail** | Effects | A light streak travels down the 3D tiles every 8 s. | S | 3 | 7 | CSS `@keyframes` |
| 115 | **Glitch effect on 404** | Effects | The monkey glitches and reassembles on the 404 page. | S | 3 | 7 | CSS clip-path glitch |
| 116 | **Gyro parallax on phones** | Interactions | Tilting the phone moves the SVG layers; permission asked on tap, never on load. | S | 3 | 7 | DeviceOrientation API |
| 117 | **Hologram mode** | 3D | Scanline + fresnel shader turns the monkey into a hologram when the AI-agents category is selected. | S | 3 | 7 | custom ShaderMaterial; stegu/webgl-noise (MIT) |
| 118 | **Holographic foil on featured cards** | Effects | Featured labs get a foil gradient that shifts with tilt. | S | 3 | 7 | CSS conic gradients |
| 119 | **JSON-LD for courses** | Scale and information architecture | Schema.org `Course` / `LearningResource` markup per lab card. | S | 3 | 7 | schema.org vocab |
| 120 | **Keyboard shortcuts sheet** | Interactions | '?' shows shortcuts: L labs, T timeline, S sound, M motion. | S | 3 | 7 | `js/nav` focus utilities |
| 121 | **Lab origin stories** | Learning in public | Each lab card can flip to show why Lucky built it. | S | 3 | 7 | registry `story` field (new) |
| 122 | **Lab ratings from GitHub stars** | Community | Show each lab's star count, fetched at build time (not live), with the date. | S | 3 | 7 | GitHub API in CI |
| 123 | **Language greeting picker** | Interactions | Click the greeting to cycle the 14 languages; sets `lang`/`dir` correctly. | S | 3 | 7 | `site.json` greetings (existing) |
| 124 | **Leaderboard without accounts** | Games | Local-only best scores; optional share card image, no server. | S | 3 | 7 | canvas to PNG |
| 125 | **Magnetic buttons** | Effects | CTA buttons pull slightly toward the pointer. | S | 3 | 7 | Motion (MIT) or plain JS |
| 126 | **Mega-menu by category** | Scale and information architecture | The Menu sheet groups labs by category with counts. | S | 3 | 7 | `js/nav/sheet.js` |
| 127 | **Mistakes I made** | Learning in public | A candid page of mistakes and fixes; builds trust. | S | 3 | 7 | `docs/LESSONS.md` (existing, internal) as seed |
| 128 | **Monkey costume per season** | 3D | Lantern for Diwali, scarf for winter, etc.; driven by a dated JSON, no code change. | S | 3 | 7 | `js/content/schedule.mjs` (existing schedule logic) |
| 129 | **Monkey says (memory game)** | Games | Simon-style colour and tone sequence on the zodiac ring. | S | 3 | 7 | Web Audio; ring segments |
| 130 | **Monthly 'build with me' livestream page** | Community | A page with the schedule and past recordings. | S | 3 | 7 | YouTube URL [HUMAN INPUT REQUIRED] |
| 131 | **Newsletter signup via Substack** | Community | A link (not an embed) to Lucky's Substack once known. | S | 3 | 7 | [HUMAN INPUT REQUIRED] Substack URL |
| 132 | **Open metrics** | Learning in public | Show stars, contributors, and labs over time (counted by scripts). | S | 3 | 7 | GitHub API at build time |
| 133 | **Proof-of-learning share image** | Rewards and credits | A shareable image 'I finished 5 Cypher Monkey labs' with no personal data. | S | 3 | 7 | canvas |
| 134 | **Public roadmap from issues** | Developer contribution | A roadmap page generated from milestone issues. | S | 3 | 7 | GitHub API at build time |
| 135 | **Random lab dice** | Interactions | A 'surprise me' die that rolls the zodiac ring and lands on a lab. | S | 3 | 7 | ring animation |
| 136 | **Registry API file** | Scale and information architecture | Publish `/api/labs.v2.json` as a stable public contract for other sites and bots. | S | 3 | 7 | registry |
| 137 | **Screen-reader stage description** | Accessibility and performance | A short, optional text description of the scene for screen-reader users. | S | 3 | 7 | visually-hidden text |
| 138 | **Scroll-linked reveals with View Timelines** | Effects | Use CSS scroll-driven animations where supported, JS fallback elsewhere. | S | 3 | 7 | CSS `animation-timeline`; no library |
| 139 | **Sound-reactive ring** | Effects | When sound is on, the ring pulses to the ambient pad's analyser. | S | 3 | 7 | `js/cinema/audio.js` + `AnalyserNode` |
| 140 | **Starfield warp on CTA press** | Effects | Pressing 'Explore N labs' warps the stars toward the doors section. | S | 3 | 7 | existing universe stars |
| 141 | **Streaks with forgiveness** | Rewards and credits | Daily learning streaks that allow 2 missed days per week; no guilt mechanics. | S | 3 | 7 | local storage |
| 142 | **Study-group finder** | Community | Static list of community groups per lab (Telegram/WhatsApp when URLs are known). | S | 3 | 7 | [HUMAN INPUT REQUIRED] group links |
| 143 | **Theme contribution format** | Developer contribution | Contributors add a theme as a JSON token file; CI checks contrast. | S | 3 | 7 | `css/tokens.css` |
| 144 | **Theme switcher with live preview** | Interactions | Hover a theme swatch to preview the whole page before committing. | S | 3 | 7 | `js/settings` themes |
| 145 | **UI sound kit** | Audio and video | Soft clicks, whooshes, and a 'portal' sound; one sprite file, mute respected everywhere. | S | 3 | 7 | howler.js (MIT) or plain Web Audio; own sounds |
| 146 | **WebGL context-loss recovery** | Accessibility and performance | Recover or fall back to poster on context loss. | S | 3 | 7 | `js/universe/fallback.js` |
| 147 | **Zodiac year finder** | Games | Enter a birth year and see your zodiac animal on the ring (computed locally, nothing stored). | S | 3 | 7 | own lookup; note lunar new year boundary |
| 148 | **Agent routing puzzle** | Games | Drag calls to agents with the right skills before the queue overflows. | L | 4 | 6 | xyflow (MIT) or plain DOM |
| 149 | **Cross-lab lesson search** | Scale and information architecture | Index lesson titles from each lab's published search index. | L | 4 | 6 | Pagefind multisite; labs' `search-index.js` (seen in cypher-ai-lab) |
| 150 | **Escape room in 5 labs** | Games | Clues spread across 5 labs; solve in order to escape. | L | 4 | 6 | same-origin storage |
| 151 | **Lip-sync to speech** | 3D | Drive mouth visemes from Web Speech `boundary` events or audio amplitude when the monkey greets. | L | 4 | 6 | met4citizen/TalkingHead (MIT) as a reference |
| 152 | **Packet runner (SIP)** | Games | An endless runner where you route a SIP INVITE through proxies and avoid 486 Busy. | L | 4 | 6 | SIP Universe content; canvas 2D |
| 153 | **Plugin MCP server for the labs** | Developer contribution | An MCP server that lets AI tools search the lab registry and timeline. | L | 4 | 6 | MCP registry examples; awesome-mcp-servers list (MIT) |
| 154 | **Programmatic videos for socials** | Audio and video | Generate weekly 'what I shipped' clips for TikTok/YouTube Shorts from timeline.json. | L | 4 | 6 | remotion (NOASSERTION, own licence; check terms) or Playwright + ffmpeg (existing pipeline) |
| 155 | **Retrieval over the registry** | Guide bot and agents | Keyword + embedding search over labs and timeline, embeddings computed at build time. | L | 4 | 6 | transformers.js (Apache-2.0) embeddings |
| 156 | **Speak to the monkey (STT)** | Audio and video | Push-to-talk questions, transcribed on device; answers from the registry. | L | 4 | 6 | transformers.js Whisper; Xenova/whisper-tiny.en (Apache-2.0) |
| 157 | **Translation hub** | Community | Volunteers translate lab UI strings; progress bars per language. | L | 4 | 6 | `js/nav/i18n.js` (existing) |
| 158 | **Worker-proxied LLM (opt-in)** | Guide bot and agents | A Cloudflare Worker Lucky controls proxies to a model provider; rate-limited, no logs of content. | L | 4 | 6 | existing contact Worker pattern; OpenRouter free models (API terms) |
| 159 | **Year-in-review story** | Learning in public | The scroll-story timeline as an annual recap. | L | 4 | 6 | placement C |
| 160 | **3D social coins in WebGL** | 3D | Upgrade the CSS rail to extruded coins in the same canvas, glyph as decal; high tier only. | M | 3 | 5 | three.js `SVGLoader`, `ExtrudeGeometry`; Simple Icons (CC0 data) |
| 161 | **AR 'monkey on your desk'** | 3D | A `model-viewer` button that places the monkey in AR on phones. | M | 3 | 5 | google/model-viewer (Apache-2.0) |
| 162 | **Category constellations** | 3D | Each category is a constellation; hovering a category chip draws lines between its labs. | M | 3 | 5 | three.js `Line2` (already in the vendored bundle) |
| 163 | **Chat UI from an open template** | Guide bot and agents | Adopt an MIT chat UI for the bot panel. | M | 3 | 5 | shadcn-ui/chatbot-template (MIT) |
| 164 | **Compare two labs** | Interactions | Pick two contact-centre labs and see their topics side by side. | M | 3 | 5 | registry tags; lab topic JSON [TBD] |
| 165 | **Deep-link to rooms** | Scale and information architecture | Registry can list a lab's top rooms so search can link directly. | M | 3 | 5 | lab manifests |
| 166 | **Guess the codec by ear** | Games | Hear a clip and pick G.711 vs Opus; teaches audio quality. | M | 3 | 5 | own recordings only |
| 167 | **Hackathon kit** | Developer contribution | A themed weekend: build a mini-lab in a day with the template. | M | 3 | 5 | lab template |
| 168 | **Hold-to-peek lab preview** | Interactions | Long-press a door to see a screenshot preview of the lab. | M | 3 | 5 | nightly Playwright screenshots |
| 169 | **Image CDN-free AVIF pipeline** | Accessibility and performance | Build-time AVIF/WebP generation for card art. | M | 3 | 5 | sharp (licence [TBD]) or squoosh CLI |
| 170 | **Lab audio tours** | Audio and video | A 60 s narrated tour per lab, with transcript. | M | 3 | 5 | TTS above; transcripts required |
| 171 | **Learner showcase** | Community | Learners submit what they built after a lab (link + one line), moderated by PR. | M | 3 | 5 | GitHub PR flow |
| 172 | **Learning roadmap graph** | Learning in public | A graph of skills Lucky is learning, linked to labs and timeline. | M | 3 | 5 | mermaid (MIT) or xyflow (MIT) |
| 173 | **Monkey holds the current lab's tool** | 3D | Headset for contact-centre labs, snake for Python, book for Sutra Nexus: a prop swaps by context. | M | 3 | 5 | `data/mascot.json` context map; existing mascot poses |
| 174 | **Noise-displaced card hover** | Effects | A WebGL distortion on lab card art on hover. | M | 3 | 5 | akella/webgl-mouseover-effects (MIT) |
| 175 | **Notes drawer** | Interactions | A private notes drawer per lab, stored only on the device. | M | 3 | 5 | localStorage; export as Markdown |
| 176 | **Process videos** | Learning in public | Short 'how I built this lab' clips, captioned. | M | 3 | 5 | Playwright + ffmpeg |
| 177 | **Remix of an AI Studio 3D game** | Games | Remix a Gemini 'Argon' showcase game into a lab mini-game after checking its terms. | M | 3 | 5 | AI Studio apps (terms per app UNKNOWN; link-only until checked) |
| 178 | **Rive-animated bot avatar** | Effects | A Rive state machine for the guide bot face (idle, thinking, talking). | M | 3 | 5 | rive-wasm (MIT runtime) |
| 179 | **Sanskrit sandhi match** | Games | Match word pairs to their sandhi result; from Sutra Nexus. | M | 3 | 5 | Sutra Nexus data |
| 180 | **Screen-recorded lab walkthroughs** | Audio and video | Short silent loops of each lab, auto-captured nightly. | M | 3 | 5 | Playwright video; existing ffmpeg flow |
| 181 | **Seasonal challenge** | Rewards and credits | A 30-day challenge across labs with a special badge. | M | 3 | 5 | schedule.mjs |
| 182 | **Share-your-path cards** | Community | Visitors create an image card of their learning path to share. | M | 3 | 5 | canvas; no upload |
| 183 | **Storybook-like component gallery** | Developer contribution | A static `/shared/v1/gallery.html` showing every shared component in every theme. | M | 3 | 5 | existing `nav-demo.html`, `trust-demo.html` pattern |
| 184 | **Swipe deck of labs on mobile** | Interactions | Tinder-style swipe through labs: right to save, up to open. | M | 3 | 5 | Pointer Events |
| 185 | **Typing defence with protocol terms** | Games | Type SIP/RTP/WebRTC terms to stop falling packets. | M | 3 | 5 | canvas 2D |
| 186 | **'Ask me anything' week** | Community | Time-boxed AMA collected via issues, answered in a post. | S | 2 | 4 | issue form |
| 187 | **Ask-the-builder Q&A** | Learning in public | Answers to visitor questions become timeline 'sharing' entries. | S | 2 | 4 | issues |
| 188 | **Cross-post status** | Learning in public | Each sharing entry shows where it was posted (X, Bluesky, DEV...) once URLs exist. | S | 2 | 4 | socials.json |
| 189 | **Cursor trail of tiny glyphs** | Effects | A short trail of zodiac glyphs follows the cursor on the stage only. | S | 2 | 4 | canvas 2D; off for reduced motion |
| 190 | **Depth-of-field focus on hovered card** | Effects | Background blurs slightly when a card is focused. | S | 2 | 4 | CSS `backdrop-filter` |
| 191 | **Event countdowns** | Community | Countdowns to Lucky's next stream or lab launch. | S | 2 | 4 | timeline.json future entries |
| 192 | **Hover-to-hear lab names** | Interactions | With sound on, hovering a door speaks its name in the chosen language. | S | 2 | 4 | Web Speech synthesis |
| 193 | **Hugging Face shelf** | Learning in public | Show Lucky's HF Spaces when he publishes some (0 public on 2026-10-18). | S | 2 | 4 | HF API at build time |
| 194 | **Konami code secret** | Games | Konami code turns the monkey into a pixel-art version. | S | 2 | 4 | keydown listener |
| 195 | **Lab size tiers** | Scale and information architecture | Planets sized by lesson count once counts are script-verified. | S | 2 | 4 | registry `stats` (null until counted) |
| 196 | **Lottie micro-animations** | Effects | Small Lottie icons for status chips (live, beta, coming soon). | S | 2 | 4 | lottie-web (MIT) or dotlottie-web (MIT) |
| 197 | **Podcast/Spotify shelf** | Audio and video | A shelf of Lucky's audio episodes once the Spotify URL is known. | S | 2 | 4 | [HUMAN INPUT REQUIRED] Spotify URL |
| 198 | **Shader 'cipher rain'** | Effects | A slow cipher-character rain behind the timeline column. | S | 2 | 4 | canvas 2D; low opacity |
| 199 | **Smooth scroll for the story page** | Effects | Inertial smooth scroll on /timeline/ only, never on the main hub. | S | 2 | 4 | lenis (MIT) |
| 200 | **Sponsor tiers (later)** | Rewards and credits | If Lucky enables GitHub Sponsors, show tiers; nothing until he decides. | S | 2 | 4 | [HUMAN INPUT REQUIRED] |
| 201 | **Teacher pack rewards** | Rewards and credits | Teachers who use a lab in class get a printable thank-you certificate. | S | 2 | 4 | print CSS |
| 202 | **3D timeline helix** | 3D | On /timeline/, entries sit on a helix that you scroll along; learning, building, sharing on 3 strands. | L | 3 | 3 | three.js `CatmullRomCurve3` |
| 203 | **Call-quality demo with WebRTC loopback** | Audio and video | A two-tab WebRTC loopback that visualises jitter and packet loss. | L | 3 | 3 | WebRTC getStats; own code |
| 204 | **In-browser neural TTS** | Audio and video | High-quality TTS in the browser with WebGPU, no server. | L | 3 | 3 | webml-community/kokoro-webgpu Space (Apache-2.0 tag) |
| 205 | **Multi-language hub** | Scale and information architecture | Hub UI in the 14 greeting languages, starting with 3. | L | 3 | 3 | `js/nav/i18n.js` |
| 206 | **Offline 'save this lab' button** | Interactions | Pin a lab for offline use where the lab ships an offline pack. | L | 3 | 3 | service worker phase; lab `download` field |
| 207 | **Open Badges 3.0 certificate export** | Rewards and credits | Export a self-issued completion badge as an Open Badges 3.0 JSON (clearly not an official credential). | L | 3 | 3 | 1EdTech Open Badges 3.0 spec (licence of spec [TBD]) |
| 208 | **Python one-liner duels** | Games | Timed Python puzzles in the browser. | L | 3 | 3 | Python Lab runtime [TBD which interpreter it uses] |
| 209 | **Service worker for the hub** | Scale and information architecture | Offline shell and cached registry after the build emits hashed assets. | L | 3 | 3 | Workbox (licence [TBD]) or own SW |
| 210 | **Webcam mirror monkey** | Audio and video | Optional: your head movement drives the monkey (on-device face landmarks). | L | 3 | 3 | MediaPipe Tasks (licence [TBD]: verify) |
| 211 | **Breakout with lab bricks** | Games | Bricks are lab names; break one to open its card. | M | 2 | 2 | awacke1/3d-Breakout-Game-Three.JS (HF tag MIT; verify LICENSE in repo) |
| 212 | **Guestbook as GitHub issues** | Community | A playful guestbook backed by a pinned GitHub issue's comments (read via API, link to comment). | M | 2 | 2 | GitHub REST API (unauthenticated read limits apply) |
| 213 | **Ink-wash transition for Sutra Nexus** | Effects | Sanskrit-themed brush transition when entering the Sutra Nexus door. | M | 2 | 2 | SVG turbulence filter |
| 214 | **Kinetic typography intro (once)** | Effects | A 2 s intro spelling 'learning in public' that runs once per visitor, skippable. | M | 2 | 2 | GSAP (custom no-charge licence; decision needed) or Motion (MIT) |
| 215 | **Liquid metal logo on hover** | Effects | The monkey mark ripples like liquid chrome when hovered. | M | 2 | 2 | custom shader; inspiration only from CodePen (licence unknown) |
| 216 | **Mentor map** | Community | Opt-in list of people who help with specific labs, by GitHub handle only. | M | 2 | 2 | YAML in repo, PR-moderated |
| 217 | **Physics toys on the stage** | 3D | Toss bananas or lab badges that bounce off the ring; purely playful. | M | 2 | 2 | rapier.js (Apache-2.0, repo archived; check successor) or matter-js (MIT) in 2D |
| 218 | **Pinch and orbit on the stage** | Interactions | Touch users can orbit the monkey with two fingers; one-finger scroll stays scroll. | M | 2 | 2 | three.js OrbitControls (limited) |
| 219 | **Real-user metrics without trackers** | Accessibility and performance | Collect anonymous Web Vitals to a Worker only if Lucky opts in. | M | 2 | 2 | web-vitals library (licence [TBD]) |
| 220 | **Sonified timeline** | Audio and video | Each timeline entry is a note; scroll plays your year as a melody. | M | 2 | 2 | Tone.js (MIT) |
| 221 | **Spinning globe icons in WebGL** | 3D | Website, GitHub, Linktree globes as real spheres with a wireframe and glyph decal. | M | 2 | 2 | three.js `SphereGeometry` + `EdgesGeometry` |
| 222 | **Voice command 'open SIP lab'** | Interactions | Optional speech recognition to open labs by name; off by default. | M | 2 | 2 | Web Speech API (browser support varies) |
| 223 | **Gaussian-splat studio backdrop** | 3D | A captured splat of a real room or desk as the stage backdrop for a 'Lucky's lab' feel. | XL | 3 | 1 | sparkjsdev/spark (MIT) or mkkellogg/GaussianSplats3D (MIT) |
| 224 | **On-device small LLM (opt-in)** | Guide bot and agents | A WebGPU small model answers questions locally after a clear download prompt. | XL | 3 | 1 | web-llm (Apache-2.0); model licence per model |
| 225 | **VRM avatar option** | 3D | Offer the monkey as a VRM model so it can be used in VTuber tools and on Lucky's streams. | XL | 3 | 1 | pixiv/three-vrm (MIT) |
| 226 | **Live coding visuals (link-only)** | Audio and video | Point to a live-coded visual session rather than embedding it. | S | 1 | 1 | hydra (AGPL-3.0: link-only) |
| 227 | **Leaderboard opt-in by GitHub** | Rewards and credits | Opt-in public leaderboard where learners submit progress via PR. | L | 2 | 0 | GitHub PR flow |
| 228 | **Planet surface preview on hover** | 3D | Hovering a planet shows a mini 3D thumbnail of the lab's signature diagram. | L | 2 | 0 | lab art SVGs as textures |
| 229 | **WebGPU renderer path** | 3D | Use WebGPU where available for more particles; WebGL2 stays default. | L | 2 | 0 | three.js WebGPURenderer (MIT) |
| 230 | **On-chain badge (optional, not default)** | Rewards and credits | Optional mint of a badge on a public chain; only after Lucky weighs cost, privacy, and legal risk. | XL | 1 | -5 | link-only research; no wallet prompts by default |

## How to use this list

- `BUILD_PHASES.md` pulls from the top of this list day by day; anything below rank 120 is a someday idea.
- Change a rating by editing the impact or effort and re-sorting; the ranking rule above is the only rule.
- Before building any idea that reuses outside code, re-check the licence in that repo on the day (licences change).
