# Progress

## Done

- Ground Rules panel, footer actions (repo, rate, comment, help), and `mountFooter`.
- Mission Control form, `mountContact`, GitHub issue fallback, Worker handler and tests.
- `privacy.html`, `404.html`, `trust-demo.html`, `robots.txt`, `sitemap.xml`.
- CI for the manifest, lab URLs, links, email exposure, and trust-slice byte budgets.
- Nightly lab-health workflow that can open or update an issue.
- QA matrix, performance budgets, and rollback notes.

## Doing

- Waiting on `/data/labs.json` from the content slice. CI validates it when the file exists and checks legacy `/labs.json` until then.
- Waiting on the home page to call `mountFooter` and `mountContact`. See `docs/INTEGRATION.md`.

## Next

- Maintainer confirms the copyright legal name and the brand exclusion.
- A person deploys the Worker and flips `cml-contact-mode` to `worker` after the staging inbox test.
- Run axe and a screen reader pass on the assembled pages.
- Rehearse rollback from a `pre-redesign` tag on a staging fork.
