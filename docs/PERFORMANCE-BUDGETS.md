# Performance budgets

The home page budgets below are the redesign targets for the assembled site. This trust slice does not own the scene, nav, or home HTML, and there is no build step, so CI enforces the trust-slice limits only. The home numbers are recorded here so the other slices can be checked against the same table when they land.

## Home page, mobile, first load

| Budget | Limit |
|---|---|
| HTML | ≤ 30 KB gzip |
| CSS, including critical CSS | ≤ 35 KB gzip |
| Initial JS (settings, nav, mascot controller, form) | ≤ 50 KB gzip |
| Scene chunk, lazy | ≤ 230 KB gzip |
| Glyph GLB | ≤ 120 KB |
| Fonts, two subset families | ≤ 110 KB |
| Hero poster AVIF at 768w | ≤ 60 KB |
| First mascot SVG, inline | ≤ 14 KB gzip |
| Transfer before interaction | ≤ 450 KB mobile; ≤ 900 KB desktop after the scene |
| Requests before LCP | ≤ 15 |

Lab targets for the assembled pages: LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.05. Field targets after traffic exists: LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05 at p75.

## What CI enforces on this slice

| File | Limit | Why |
|---|---|---|
| `css/trust.css` | ≤ 8 KB gzip | Leaves room inside the 35 KB CSS budget |
| `js/trust/**/*.js` | ≤ 20 KB gzip | Leaves about 30 KB inside the 50 KB initial JS budget for nav, settings, and the mascot |
| `privacy.html`, `404.html`, `trust-demo.html` | ≤ 30 KB gzip each | Same HTML ceiling as the home page |

The trust script is plain ES modules. It does not load the scene. Fonts on these pages are system fonts, so the slice adds no font bytes. Motion on the footer aurora stops when `prefers-reduced-motion` is set or `data-motion="reduce"`.

GitHub Pages cache headers stay at the platform default. Hashed filenames and a service worker are a later phase, after there is a build that emits hashed assets. This repository deploys as static files from the root.
