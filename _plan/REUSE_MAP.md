# Reuse map: what can be adapted, and under what licence

Planning only. Nothing listed here has been copied into the site.

## 0. Sources and what could not be read

| Source | Status in this session |
|---|---|
| Private repo `cipher0x9/cypher-monkey-labs-library` (~18,736 indexed links) | **Could not read.** `gh repo view` returned "Could not resolve to a Repository", the contents API returned 404 for this session's token, the GitHub MCP connector exposed no file tools, and the agent stores did not contain the index. No row from that index is quoted here. |
| Attached `README` of that library (built 2026-10-17) | Read. Used for category and licence counts (section 6). |
| Attached `REPORT` "Public remix/copy sources survey" (2026-10-17) | Read. Its top-10 list is re-checked below. |
| Attached `x_hunt REPORT` (2026-10-17, 174 URLs) | Read. Its top-20 items that matter for the hub are re-checked below. |
| GitHub REST API | Used 2026-10-18 for licence (SPDX id), stars, and archived flag of every GitHub repo below. |
| Hugging Face public API | Used 2026-10-18 for Space/model likes and the `license` tag in the card. A card tag is the author's claim; it is not the same as a LICENSE file. |

Stars and likes are snapshots from 2026-10-18 and will drift.

## 1. Licence rule (same as `SITE_PLAN.md` §9)

| Status | Meaning | Licences |
|---|---|---|
| **Adapt** | May copy or modify; keep the notice | MIT, ISC, BSD-2/3, Zlib, Unlicense, CC0-1.0 |
| **Adapt + NOTICE** | As above, also keep NOTICE and state changes | Apache-2.0 |
| **CI only** | Fine as a dev/test tool; do not ship in the page | MPL-2.0 tools (axe-core) |
| **Decision** | Custom terms; Lucky reads them first | GSAP standard no-charge licence, Remotion licence, Gemini API Additional Terms, model licences |
| **Link-only** | Do not copy code or assets; re-implement the idea from scratch | AGPL/GPL, CC BY-SA (for the brand), NOASSERTION, no licence, UNKNOWN |

## 2. Already in this repo (reuse first)

| Module | What it gives the hub | Licence |
|---|---|---|
| `vendor/three/three.module.js` (0.186.1) | 3D engine; 147 KB gzip on the wire | MIT (`vendor/three/LICENSE`) |
| `js/universe/*` | Planet layout, quality tiers, WebGL fallback, post effects, palette | Site code (MIT per `docs/MIT-LICENSE.md` scope [TBD: that file names only `/js/trust`, `/css/trust.css`, `/worker`, `/.github`; confirm the rest]) |
| `js/cinema/*` | Lazy hero, drag-bot guide, ambient audio, card tilt | Same [TBD] |
| `js/nav/*` | Menu sheet, command palette, i18n, focus trap | Same [TBD] |
| `js/settings/*` | Theme, motion, sound persistence | Same [TBD] |
| `js/trust/*` | Footer, Ground Rules disclaimer, contact form | MIT |
| `js/content/*` | Render, assemble, schedule, content checker | Same [TBD] |
| `assets/mascot/*.svg` (10 poses) | Day-1 2.5D monkey and bot avatar | Lucky's art, all rights reserved (`docs/LICENSE-CONTENT.md`) |
| `assets/trailer/trailer-src.html` | Deterministic canvas trailer renderer | Same [TBD] |
| Fonts (Atkinson Hyperlegible, Space Grotesk, Outfit, Syne, Noto subsets) | Typography | OFL files present for some (`assets/fonts/OFL.txt`, `css/fonts/OFL-*.txt`); [TBD] confirm OFL notices for Outfit and Syne files |
| Branch `feat/lab-manifest-hooks` | Lab self-registration via PR | Site code |

## 3. Outside code: verified on 2026-10-18

### 3.1 3D and rendering

| Project | URL | Licence | Stars | Use for | Status |
|---|---|---|---|---|---|
| three.js | https://github.com/mrdoob/three.js | MIT | 116,555 | Core (already vendored) | Adapt |
| react-three-fiber | https://github.com/pmndrs/react-three-fiber | MIT | 33,046 | Reference only; the hub has no React build | Adapt (not planned) |
| drei | https://github.com/pmndrs/drei | MIT | 9,978 | Port ideas: ContactShadows, Float, Sparkles, MeshTransmissionMaterial | Adapt |
| postprocessing | https://github.com/pmndrs/postprocessing | Zlib | 2,887 | Selective bloom, vignette | Adapt |
| OGL | https://github.com/oframe/ogl | Unlicense (per `package.json`; no SPDX detected by GitHub) | 4,675 | Tiny WebGL for a 2D-ish effect layer if three.js is too heavy | Adapt (re-check) |
| glTF-Transform | https://github.com/donmccurdy/glTF-Transform | MIT | 1,988 | Compress the monkey GLB (CLI, build-time) | Adapt |
| meshoptimizer | https://github.com/zeux/meshoptimizer | MIT | 8,581 | GLB mesh compression + decoder | Adapt |
| troika (three-text) | https://github.com/protectwise/troika | MIT | 1,981 | Crisp 3D text for the domain name in-scene | Adapt |
| three-mesh-bvh | https://github.com/gkjohnson/three-mesh-bvh | MIT | 3,518 | Fast pointer picking at 100+ planets | Adapt |
| three-mesh-ui | https://github.com/felixmariotto/three-mesh-ui | MIT | 1,482 | In-scene labels (optional) | Adapt |
| three-vrm | https://github.com/pixiv/three-vrm | MIT | 2,221 | VRM monkey idea | Adapt |
| TalkingHead | https://github.com/met4citizen/TalkingHead | MIT | 1,612 | Lip-sync and avatar reference | Adapt |
| model-viewer | https://github.com/google/model-viewer | Apache-2.0 | 8,276 | AR "monkey on your desk" | Adapt + NOTICE |
| Spark (Gaussian splats) | https://github.com/sparkjsdev/spark | MIT | 3,751 | Splat backdrop idea | Adapt |
| GaussianSplats3D | https://github.com/mkkellogg/GaussianSplats3D | MIT | 2,916 | Alternative splat renderer | Adapt |
| rapier.js | https://github.com/dimforge/rapier.js | Apache-2.0, **archived** | 698 | Physics toys; archived repo, look for its successor first | Decision |
| matter-js | https://github.com/liabru/matter-js | MIT | 18,479 | 2D physics toys | Adapt |
| PixiJS | https://github.com/pixijs/pixijs | MIT | 48,412 | 2D games layer if needed | Adapt |
| webgl-noise (ashima / stegu) | https://github.com/ashima/webgl-noise, https://github.com/stegu/webgl-noise | MIT | 3,000 / 595 | Noise in shaders (hologram, aurora) | Adapt |
| glTF Sample Assets | https://github.com/KhronosGroup/glTF-Sample-Assets | Per asset (`LICENSES/` folder; no single SPDX) | 1,115 | Test models only | Check each asset |

### 3.2 Motion, effects, transitions

| Project | URL | Licence | Stars | Use for | Status |
|---|---|---|---|---|---|
| Motion | https://github.com/motiondivision/motion | MIT | 34,279 | Magnetic buttons, springs, scroll | Adapt |
| anime.js | https://github.com/juliangarnier/anime | MIT | 73,679 | Timeline animations | Adapt |
| GSAP | https://github.com/greensock/GSAP | Custom "Standard no-charge" licence (`package.json`; README says free incl. commercial) | 29,377 | SplitText, ScrollTrigger | **Decision** |
| Theatre.js | https://github.com/theatre-js/theatre | Apache-2.0 | 12,773 | Choreographing the intro/story camera | Adapt + NOTICE |
| Lenis | https://github.com/darkroomengineering/lenis | MIT | 16,646 | Smooth scroll on `/timeline/` only | Adapt |
| Splitting | https://github.com/shshaw/Splitting | MIT | 1,756 | Text split for scramble/reveal | Adapt |
| vanilla-tilt.js | https://github.com/micku7zu/vanilla-tilt.js | MIT | 4,014 | Card tilt reference | Adapt |
| WebGL mouseover effects | https://github.com/akella/webgl-mouseover-effects | MIT | 403 | Card hover distortion | Adapt |
| canvas-confetti | https://github.com/catdad/canvas-confetti | ISC | 12,816 | First-lab celebration | Adapt |
| lottie-web | https://github.com/airbnb/lottie-web | MIT | 32,245 | Status micro-animations | Adapt |
| dotlottie-web | https://github.com/LottieFiles/dotlottie-web | MIT | 919 | Smaller Lottie runtime | Adapt |
| Rive runtime | https://github.com/rive-app/rive-wasm | MIT (runtime; art files are separate) | 1,007 | Bot face state machine | Adapt |
| Barba / swup | https://github.com/barbajs/barba, https://github.com/swup/swup | MIT / MIT | 12,999 / 5,245 | Page transitions; prefer the native View Transitions API | Adapt (likely unneeded) |
| react-spring | https://github.com/pmndrs/react-spring | MIT | 29,169 | Reference only | Adapt (not planned) |
| hydra | https://github.com/hydra-synth/hydra | AGPL-3.0 | 2,732 | Live-coded visuals | **Link-only** |

### 3.3 Codrops (verified subset of `github.com/codrops`)

| Repo | Licence | Stars | Status |
|---|---|---|---|
| https://github.com/codrops/3DStackMotion | MIT | 119 | Adapt |
| https://github.com/codrops/IntroGridMotionTransition | MIT | 68 | Adapt |
| https://github.com/codrops/HoverGrid | MIT | 40 | Adapt |
| https://github.com/codrops/CinemaSeatPreview | MIT | 4 | Adapt |
| https://github.com/codrops/isle-thorne-collective | MIT | 10 | Adapt |
| https://github.com/codrops/PageTransitions | none detected | 2,316 | Link-only |
| https://github.com/codrops/HoverEffectIdeas | none detected | 1,641 | Link-only |
| https://github.com/codrops/Animocons | none detected | 1,549 | Link-only |
| https://github.com/codrops/RainEffect | none detected | 1,783 | Link-only |
| https://github.com/codrops/ParticleEffectsButtons | none detected | 1,264 | Link-only |
| https://github.com/codrops/TextInputEffects | none detected | 953 | Link-only |

Pattern: newer Codrops repos tend to carry MIT; many older popular ones have no licence file. Check each repo, not the brand. **CodePen**: not verified in this session (the attached x-hunt report notes CodePen was bot-blocked); treat every pen as link-only until its page shows a licence.

### 3.4 Icons and emoji (for the rail, globes, ring)

| Project | URL | Licence | Stars | Use for | Status |
|---|---|---|---|---|---|
| Simple Icons | https://github.com/simple-icons/simple-icons | CC0-1.0 (the path data); trademarks remain with each brand | 26,031 | Social glyphs on our 3D tiles | Adapt; follow brand guidelines [TBD per brand] |
| Tabler Icons | https://github.com/tabler/tabler-icons | MIT | 22,349 | UI icons | Adapt |
| Lucide | https://github.com/lucide-icons/lucide | ISC (LICENSE file; GitHub's detector says NOASSERTION) | 25,116 | UI icons | Adapt |
| Phosphor core | https://github.com/phosphor-icons/core | MIT | 392 | UI icons | Adapt |
| Twemoji (maintained fork) | https://github.com/jdecked/twemoji | Code MIT; **graphics CC BY 4.0** (README, LICENSE-GRAPHICS) | 1,882 | Zodiac animal placeholders | Adapt with visible attribution |
| Fluent Emoji | https://github.com/microsoft/fluentui-emoji | MIT | 10,168 | 3D-style emoji art for zodiac ring | Adapt |
| Noto Emoji | https://github.com/googlefonts/noto-emoji | Fonts OFL-1.1; tools and most images Apache-2.0 (README) | 5,078 | Emoji fallback | Adapt + NOTICE |
| OpenMoji | https://github.com/hfg-gmuend/openmoji | CC BY-SA 4.0 | 4,566 | Avoid for brand marks (share-alike) | Link-only for brand use |

### 3.5 Audio and speech

| Project | URL | Licence | Stars / likes | Use for | Status |
|---|---|---|---|---|---|
| howler.js | https://github.com/goldfire/howler.js | MIT | 25,395 | UI sound sprite | Adapt |
| Tone.js | https://github.com/Tonejs/Tone.js | MIT | 14,778 | Sonified timeline, ambient pad | Adapt |
| transformers.js | https://github.com/huggingface/transformers.js | Apache-2.0 | 16,349 | On-device STT, embeddings, TTS | Adapt + NOTICE |
| Kokoro-82M (model) | https://huggingface.co/hexgrad/Kokoro-82M | apache-2.0 (card tag) | 7,272 likes | Monkey voice | Adapt + NOTICE (check voice terms) |
| Kokoro-82M ONNX | https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX | apache-2.0 (card tag) | 276 likes | Browser TTS | Adapt + NOTICE |
| kokoro (code) | https://github.com/hexgrad/kokoro | Apache-2.0 | 9,408 | Reference | Adapt + NOTICE |
| KittenTTS | https://github.com/KittenML/KittenTTS | Apache-2.0 | 16,138 | Small TTS alternative | Adapt + NOTICE |
| whisper-tiny.en (ONNX) | https://huggingface.co/Xenova/whisper-tiny.en | apache-2.0 (card tag) | 33 likes | Push-to-talk STT | Adapt + NOTICE |
| whisper-web | https://github.com/xenova/whisper-web | no licence detected | 3,345 | Reference only | Link-only |
| Whisper (original) | https://github.com/openai/whisper | MIT | 110,787 | Reference | Adapt |
| Piper | https://github.com/rhasspy/piper | MIT, **archived** | 11,303 | Server TTS reference | Decision (archived) |

### 3.6 Bot, agents, omni-channel references

| Project | URL | Licence | Stars | Use for | Status |
|---|---|---|---|---|---|
| shadcn chatbot template | https://github.com/shadcn-ui/chatbot-template | MIT | 1,155 | Bot panel UI patterns | Adapt |
| Vercel chatbot | https://github.com/vercel/chatbot | NOASSERTION | 20,997 | Reference | Link-only |
| Pipecat | https://github.com/pipecat-ai/pipecat | BSD-2-Clause | 16,561 | Voice-agent pipeline demo (omni-channel story) | Adapt |
| LiveKit Agents | https://github.com/livekit/agents | Apache-2.0 | 14,805 | Voice/WebRTC agent reference | Adapt + NOTICE |
| WebLLM | https://github.com/mlc-ai/web-llm | Apache-2.0 | 19,279 | Opt-in on-device LLM | Adapt + NOTICE (model licence separate) |
| Azure search + OpenAI demo | https://github.com/Azure-Samples/azure-search-openai-demo | MIT | 7,784 | RAG reference | Adapt |
| Gemini cookbook | https://github.com/google-gemini/cookbook | Apache-2.0 | 17,843 | Gemini API examples | Adapt + NOTICE (API terms apply to calls) |
| Gemini Live API web console | https://github.com/google-gemini/live-api-web-console | Apache-2.0 | 2,561 | Real-time voice demo reference | Adapt + NOTICE |
| Gemini CLI | https://github.com/google-gemini/gemini-cli | Apache-2.0 | 107,433 | Dev tooling | Adapt + NOTICE |
| xyflow | https://github.com/xyflow/xyflow | MIT | 38,702 | Agent-flow visualiser, routing puzzle | Adapt |
| Mermaid | https://github.com/mermaid-js/mermaid | MIT | 90,727 | Diagrams in docs and timeline | Adapt |

### 3.7 Search, quality, build, video

| Project | URL | Licence | Stars | Use for | Status |
|---|---|---|---|---|---|
| MiniSearch | https://github.com/lucaong/minisearch | MIT | 6,173 | Registry search at 60+ labs | Adapt |
| Pagefind | https://github.com/Pagefind/pagefind | MIT | 5,520 | Static index over built HTML, cross-lab | Adapt |
| FlexSearch | https://github.com/nextapps-de/flexsearch | Apache-2.0 | 13,807 | Alternative | Adapt + NOTICE |
| Fuse.js | https://github.com/krisk/Fuse | Apache-2.0 | 20,505 | Fuzzy match in the palette | Adapt + NOTICE |
| Playwright | https://github.com/microsoft/playwright | Apache-2.0 | 97,953 | Visitor tests and screenshots | CI only |
| axe-core | https://github.com/dequelabs/axe-core | MPL-2.0 | 7,659 | Accessibility gate | CI only |
| Lighthouse CI | https://github.com/GoogleChrome/lighthouse-ci | Apache-2.0 | 7,113 | Performance gate | CI only |
| stats.js / lil-gui / Tweakpane | https://github.com/mrdoob/stats.js, https://github.com/georgealways/lil-gui, https://github.com/cocopon/tweakpane | MIT / MIT / MIT | 9,151 / 1,648 / 4,606 | Dev-only tuning panels (`?debug`) | Adapt |
| ffmpeg.wasm | https://github.com/ffmpegwasm/ffmpeg.wasm | MIT (wrapper; FFmpeg core has its own LGPL/GPL terms [TBD]) | 17,887 | In-browser share clips | Decision |
| CCapture.js | https://github.com/spite/ccapture.js | MIT | 3,777 | Deterministic canvas capture | Adapt |
| canvas-sketch | https://github.com/mattdesl/canvas-sketch | MIT | 5,310 | Generative OG art | Adapt |
| Remotion | https://github.com/remotion-dev/remotion | NOASSERTION (Remotion's own licence; free tier rules [TBD]) | 64,817 | Programmatic social videos | **Decision** |
| pdf.js | https://github.com/mozilla/pdf.js | Apache-2.0 | 54,014 | Inline PDF views (Sutra Nexus) | Adapt + NOTICE |
| zustand | https://github.com/pmndrs/zustand | MIT | 58,831 | Not needed without React | — |

## 4. Hugging Face Spaces (card tags, 2026-10-18)

| Space | Likes | SDK | Card licence | Use for | Status |
|---|---|---|---|---|---|
| https://huggingface.co/spaces/hexgrad/Kokoro-TTS | 3,524 | gradio | apache-2.0 | Voice reference | Adapt + NOTICE |
| https://huggingface.co/spaces/webml-community/kokoro-webgpu | 366 | static | apache-2.0 | Browser TTS demo to port | Adapt + NOTICE |
| https://huggingface.co/spaces/webml-community/kokoro-web | 226 | static | apache-2.0 | Same | Adapt + NOTICE |
| https://huggingface.co/spaces/webml-community/deepseek-r1-webgpu | 573 | static | apache-2.0 | On-device LLM UI pattern | Adapt + NOTICE (model licence separate) |
| https://huggingface.co/spaces/Xenova/realtime-whisper-webgpu | 467 | static | UNKNOWN | STT demo | Link-only |
| https://huggingface.co/spaces/HumanAIGC-Engineering-Team/open-avatar-chat | 45 | static | apache-2.0 | Avatar chat reference | Adapt + NOTICE |
| https://huggingface.co/spaces/awacke1/HTML5-ThreeJS-3D | 5 | static | mit | Simple three.js starter | Adapt (check repo LICENSE file) |
| https://huggingface.co/spaces/awacke1/3d-Breakout-Game-Three.JS | 2 | static | mit (card tag; the attached REPORT listed it UNKNOWN) | Breakout mini-game idea | Adapt only after checking files |
| https://huggingface.co/spaces/pearsonkyle/Gaussian-Splat-Viewer | 4 | static | mit | Splat viewer | Adapt |
| https://huggingface.co/spaces/Umama-at-Bluchip/threejs-avatar-demo | 6 | static | UNKNOWN | Avatar idea | Link-only |
| https://huggingface.co/spaces/sky24h/Free-View_Expressive_Talking_Head_Video_Editing | 40 | gradio | cc-by-nc-4.0 | Talking head | Link-only (non-commercial, also server GPU) |

Lucky's own Hugging Face account `Cypher0x9` had 0 public Spaces and 0 public models on 2026-10-18 (HF API), so there is nothing of his to reuse there yet.

## 5. Google AI Studio / Gemini apps

| Item | Source | Licence | Status |
|---|---|---|---|
| AI Studio Build app gallery | https://aistudio.google.com/social_preview/page/apps (from attached x-hunt, 3,320 likes on the X post) | Per app UNKNOWN; Gemini API Additional Terms apply (attached REPORT) | Link-only / inspiration |
| Argon Tennis | https://aistudio.google.com/social_preview/page/apps/bundled/argon-tennis | UNKNOWN | Link-only |
| Desk Racer | https://aistudio.google.com/social_preview/page/apps/bundled/desk-racer | UNKNOWN | Link-only |
| Gemini 4 Argon Builders Showcase | https://aistudio.google.com/learn/gemini-4-argon-showcase (attached REPORT) | UNKNOWN | Link-only |
| Lucky's Gemini Gems gallery | https://cyphermonkeylabs.com/gemini-gems-free-gallery/ (and `data/gems.json`) | Lucky's own | Reuse for the bot shelf |

AI Studio pages need a Google sign-in, so they were not opened in this session. "Remix" inside AI Studio produces a copy under Lucky's account; whether the exported code can be published depends on the app's own terms [TBD per app].

## 6. How the private library maps to hub needs (from the attached README)

The library README reports category and licence counts. Once the repo is readable, filter it like this:

| Hub need | Library category / `reuse_for` tag | Rows (README) |
|---|---|---|
| Stage effects, 3D | Category `3D/WebGL`; tag `3D` | 119 / 136 |
| Cards, rail, bottom bar styling | Category `UI/CSS/Design`; tag `design` | 217 / 1,478 |
| Mini-games | Category `Games`; tag `quiz-game` | 58 / 105 |
| Guide bot | Category `RAG/Chat`, `Agents`; tag `bot widget` | 246, 571 / 726 |
| Omni-channel / voice demos | Category `Voice/Telephony`; tag `voice-CC` | 426 / 512 |
| Dashboards (lab health, open metrics) | Category `Dashboards/Data Viz`; tag `dashboards` | 95 / 294 |
| Bot tools | Category `MCP` | 750 |

Licence filter for "Adapt" rows: `license ∈ {MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, CC0-1.0, Zlib, Unlicense}`. The README reports **3,117 rows with UNKNOWN licence ("62%")**; it does not say what the 62% is measured against, and 3,117 is about 17% of 18,736. Either way, those rows are link-only by the rule in section 1.

Gaps the README itself lists (not harvested yet): CodePen/Codrops pages, the three.js examples list, Google AI Studio apps, Vercel templates site, awesome-azd, Kaggle. Those are exactly the effect sources this hub needs most, so a harvest of the three.js examples (MIT, part of the three.js repo) and of licensed Codrops repos is the first library task in `BUILD_PHASES.md`.

## 7. Not recommended

- Copying any CodePen, Dribbble, or Awwwards site code without a visible licence.
- Brand logos modified into 3D shapes (extruded X, recoloured Instagram).
- Vendor product logos (existing rule).
- Fonts from Google Fonts CDN (privacy and CSP); self-host OFL copies instead.
- Any model or Space tagged non-commercial for the main site if Lucky may ever take sponsorship.
