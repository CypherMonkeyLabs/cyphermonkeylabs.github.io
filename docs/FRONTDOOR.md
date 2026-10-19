# Front door

`index.html` is the v2 hub, served at `/`. Pieces stay under `v2/` and are linked with root-absolute paths:

- `v2/css/hub.css`, `v2/css/r3.css`, `v2/css/contact.css`
- `v2/js/hub.js`, `v2/js/r3.js`, `v2/fx/cm-fx.js`
- `v2/bot/bot.js` – Cyph, the guide monkey. The speech bubble is positioned in the viewport so it is not clipped and does not cover the hero eyebrow.
- Contact form: `js/trust/contact.js` (Turnstile loads lazily near the form and posts to `https://contact.cyphermonkeylabs.com`).

`/v2/` redirects to `/`. The previous homepage is the rollback at `/v1/` (`v1/index.html`, `v1/css/cinema.css`, `v1/js/cinema/`).

Link rule: anchors on `index.html` may point only to this site, `github.com/CypherMonkeyLabs`, and `linktr.ee/CypherMonkey`. `node .github/scripts/check-frontdoor-links.mjs` enforces it.
