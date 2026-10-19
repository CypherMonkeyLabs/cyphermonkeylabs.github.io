# Third-party code in v2/fx

Original CMFX code in this folder is part of CypherMonkey Labs. The items below are copied in so the page does not call a CDN. No GPL and no unlicensed assets are included.

## three.js

| | |
| --- | --- |
| Name | three.js |
| URL | https://github.com/mrdoob/three.js |
| License | MIT |
| Version | 0.186.1 (r186) |
| Files | `vendor/three/three.module.js`, `vendor/three/LICENSE`, `vendor/three/VERSION` |

Copyright © 2010-2026 three.js authors. The file is the tree-shaken bundle already stored at `vendor/three/` in this repository (WebGLRenderer, geometries, points, Line2, ShaderMaterial). It was copied here so the effect library does not depend on a path outside `v2/fx/`. It is not a fresh download from a CDN.

## Ashima Arts simplex noise

| | |
| --- | --- |
| Name | webgl-noise (noise3D) |
| URL | https://github.com/ashima/webgl-noise |
| License | MIT |
| Version | `src/noise3D.glsl`, header lastmod 20201014, fetched from the master branch on 2026-10-19 |
| Files | `vendor/webgl-noise/noise3D.glsl`, `vendor/webgl-noise/noise3D.js`, `vendor/webgl-noise/LICENSE` |

Copyright (C) 2011 Ashima Arts. Copyright (C) 2011-2016 Stefan Gustavson. `noise3D.js` is the same source as a string so the aurora shader can inline it. The running aurora calls `snoise`.

## Python Lab studio

| | |
| --- | --- |
| Name | python-lab-free-university-mesmerizing, studio aurora and fx field |
| URL | https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing |
| License | MIT for the lab's code (content in that repo is CC BY-NC-SA and was not copied) |
| Version | commit `dd86534c9d439ee2d72e9b8397be67c5cb5dd375` |
| Files | `vendor/python-lab/LICENSE`, `vendor/python-lab/aurora.js`, `vendor/python-lab/fx.js`, `vendor/python-lab/SOURCE_COMMIT.txt` |

Copyright (c) 2026 CYPHER0X9.

- `aurora.js` is imported by the globe. `makeAurora` draws the backdrop plane.
- The fullscreen aurora keeps that file's band formula (`sin` bands at y 0.62 and 0.42) and adds the Ashima wisps.
- `fx.js` is the snapshot the particle field was adapted from (rising drift, tiered counts, DPR cap, reduced-motion stop). It is not loaded as a module. Mouse attraction was added in `particles.js`. The Web Audio bed in CMFX is new and does not copy the lab's `tone()` sequence or the root site's cinema pad.

## Reviewed and not copied

- tsparticles (MIT, https://github.com/tsparticles/tsparticles). The engine is large for a first-load budget. The Python Lab field covers the particle contract.
- Shadertoy snippets. The site's older universe shader uses a hash in the style of public Shadertoy examples. Those shaders do not carry a general open license, so that hash was not copied into v2/fx. Ashima noise is used instead.
- Hugging Face Spaces and Gradio demos. Per-space licenses differ. No MIT, Apache, or CC0 asset from a Space was small enough and clearly licensed enough to vendor for this API.
- Azure Samples and Google's model-viewer. No small visual sample matched this API without pulling a large SDK.
- canvas-confetti (ISC), which the Python Lab loads separately. The CMFX contract does not ask for confetti.

## For the privacy page

Do not edit `privacy.html` from this change. The text Lucky can paste is in `NOTE-FOR-LUCKY.md`.
