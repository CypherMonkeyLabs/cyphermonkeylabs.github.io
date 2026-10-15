# QA matrix

Devices to cover before calling the redesign done: iPhone SE and a current iPhone in Safari, Pixel and a low-end Android in Chrome, iPad Air portrait and landscape, Mac Safari/Chrome/Firefox, Windows Edge, and a wide desktop. Assistive tech: VoiceOver, TalkBack, NVDA with Firefox, keyboard only, 200% and 400% zoom, forced colors.

This slice automates the rows marked **auto**. Rows that need the assembled home page, a deployed Worker, or a person with a screen reader are **manual** or **blocked**.

| ID | Test | Status |
|---|---|---|
| T-LINK-01 | Live lab URLs and repos return a success status. Open and repo links render when the manifest has them. | **auto** for URLs in CI. Card rendering is covered on `/404.html` for the legacy manifest. |
| T-LINK-02 | No empty hash links, no empty href, and no mail links on trust pages. | **auto** |
| T-NAV-01…06 | Header, menu, palette, skip links for the full site. | **blocked** on the nav slice. Trust pages have a skip link and a small top bar. |
| T-A11Y-01…05 | axe, 48 px targets, focus, 320 px reflow, forced colors. | **manual**. CSS includes forced-colors borders, visible focus, and 48 px targets. axe is not run here because the full route set is not assembled. |
| T-SET-01…04 | Settings persistence and URL overrides. | Trust pages read `cm.settings` and `?theme=` / `?motion=` without writing them. Persistence belongs to the settings slice. |
| T-SCN-01…08 | Scene quality, WebGL loss, reduced motion. | **blocked** on the scene slice. The footer aurora does stop for reduced motion. |
| T-MAN-01…05 | Manifest schema, legacy file, invalid fixture. | **auto** for schema. A 100-lab scene fixture is not this slice. |
| T-MAS-01…04 | Mascot schedule. | **blocked**. The form dispatches `cm:mascot` with `celebrate` or `oops`. |
| T-CON-01 | Happy path delivered within 60 s. | **blocked** until the Worker is deployed to a staging inbox. Handler unit test covers the send call. |
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

## Contact checks before the Worker is public

1. Submit on `/trust-demo.html` before 3 seconds and confirm the wait message. The text stays.
2. Submit a valid note and confirm the GitHub URL has the topic and message and not the email field.
3. Put an address inside the message and confirm the form stops.
4. Fill the off-screen company field and confirm no issue opens.
5. With JavaScript off, confirm the Ground Rules text and the issue link are visible.
