# Rollback

The live site is GitHub Pages serving this repository root from `main`. This redesign is landing in parallel pull requests. Do not switch Pages to an Actions artifact deploy as part of the trust slice. That would change how the current site ships.

## Before replacing the live site

These steps need a person's OK. They are not done in the trust pull request.

1. Push the current `main` to a branch named `legacy`.
2. Tag that commit `pre-redesign`.
3. Keep building on the redesign branches. Preview with a fork or a Pages preview, not by force-pushing `main`.
4. Fill in the open maintainer choices: legal name on the copyright line, and confirmation that the name, logo, and mascot stay out of the content license.
5. Deploy the contact Worker to a staging hostname with a test inbox. Run the T-CON rows in `docs/QA-MATRIX.md`. Do not put the inbox address in git.
6. Merge to `main` only after the scene, nav, and content slices are integrated and the manifest at `/data/labs.json` validates.
7. Confirm the custom domain, HTTPS, and `/CNAME` (`cyphermonkeylabs.com`).

## If the redesign misbehaves

1. Re-run the Pages deploy from the `pre-redesign` tag, or reset `main` to that tag and let Pages publish it.
2. The trust workflow does not deploy the site, so rerunning it does not roll the site back.
3. If the Worker was enabled, set `cml-contact-mode` back to `fallback` or disable the Worker route. The static site keeps working without it.
4. A rollback of the static site should be a Pages publish of the tag, which is a short operation once the tag exists. It has not been rehearsed on a staging fork in this pull request.

## What this pull request already changed

`/privacy.html` and `/404.html` are replaced. Their URLs stay the same. The previous pages linked to a public mailbox. The new pages do not. Rolling those two files back means checking out the copies from `pre-redesign` once that tag exists, or from the parent commit of this branch.
