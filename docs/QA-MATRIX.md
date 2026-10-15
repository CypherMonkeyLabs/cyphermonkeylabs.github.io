# QA matrix

Devices to cover before calling the redesign done: iPhone SE and a current iPhone in Safari, Pixel and a low-end Android in Chrome, iPad Air portrait and landscape, Mac Safari/Chrome/Firefox, Windows Edge, and a wide desktop. Assistive tech: VoiceOver, TalkBack, NVDA with Firefox, keyboard only, 200% and 400% zoom, forced colors.

This slice automates the rows marked **auto**. Rows that need the assembled home page, a deployed Worker, or a person with a screen reader are **manual** or **blocked**.

| ID | Test | Status |
|---|---|---|
| T-LINK-01 | Live lab URLs and repos return a success status. Open and repo links render when the manifest has them. | **auto** for URLs in CI. Card rendering is covered on `/404.html` for the legacy manifest. |
| T-LINK-02 | No empty hash links, no empty href, and no mail links on trust pages. | **auto** |
| T-LINK-03 | Social and license links resolve. x.com may refuse the Actions runner. | **auto**. A 404 or 410 on x.com fails. A bot wall (401, 403, 429, or a connection failure) warns and leaves the profile URL in place. |
| T-NAV-01…06 | Header, menu, palette, skip links for the full site. | **blocked** on the nav slice. Trust pages have a skip link and a small top bar. |
| T-A11Y-01…05 | axe, 48 px targets, focus, 320 px reflow, forced colors. | **manual**. CSS includes forced-colors borders, visible focus, and 48 px targets. axe is not run here because the full route set is not assembled. |
| T-SET-01…04 | Settings persistence and URL overrides. | Trust pages read `cm.settings` and `?theme=` / `?motion=` without writing them. Persistence belongs to the settings slice. |
| T-SCN-01…08 | Scene quality, WebGL loss, reduced motion. | **blocked** on the scene slice. The footer aurora does stop for reduced motion. |
| T-MAN-01…05 | Manifest schema, legacy file, invalid fixture. | **auto** for schema. A 100-lab scene fixture is not this slice. |
| T-MAS-01…04 | Mascot schedule. | **blocked**. The form dispatches `cm:mascot` with `celebrate` or `oops`. |
| T-CON-01 | Happy path delivered within 60 s. | **manual**. The Worker is live at `contact.cyphermonkeylabs.com`. A person sends one note. Handler unit test covers the send call. |
| T-CON-02 | Honeypot returns success and does not send. | **auto** (handler) and the form pretends success without opening GitHub. |
| T-CON-03 | Under 3 seconds returns 400 `too_fast`. | **auto** |
| T-CON-04 | Bad Turnstile token returns 400. | **auto** |
| T-CON-05 | Rate limit returns 429. | **auto** |
| T-CON-06 | Body over 10 KB returns 413. | **auto** |
| T-CON-07 | Wrong Origin returns 403. | **auto** |
| T-CON-08 | `#contact` focus and `?topic=&lab=` prefill. | **manual** in the browser on `/trust-demo.html`. |
| T-TRUST-01 | Disclaimer on trust routes, including no-JS noscript. | **auto** text check, **manual** visual. |
| T-TRUST-02 | MIT and CC license links. | **auto** link check. CC uses `rel="license"`. |
| T-TRUST-03 | No vendor logo files. | **manual** file list. This slice adds no images. |
| T-PERF-01…04 | LHCI and size limits. | Size limits for this slice are **auto**. LHCI waits for the assembled site. There is no `dist/` build. |

## Contact checks with the Worker live

The form on `/` (`#contact`) and `/trust-demo.html` posts to the Worker. Do not put a destination address in git, and do not automate a real send.

1. The Turnstile widget is visible. The console has no CSP errors for `https://challenges.cloudflare.com`.
2. Submit with no token and confirm the spam-check message (`captcha`).
3. Submit before 3 seconds and confirm the wait message (`too_fast`). The text stays.
4. A rate limit shows the hourly message (`rate`, HTTP 429). A missing secret or limiter shows the unconfigured message (`unconfigured`, HTTP 503).
5. `?contact=fallback` still opens a public GitHub issue. That URL has the topic and message and not the email field. An address inside the message stops that path.
6. Fill the off-screen company field and confirm the form pretends success and does not send.
7. With JavaScript off, confirm the Ground Rules text and the public issue link are visible.
