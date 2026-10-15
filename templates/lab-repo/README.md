# Lab repo template

Files to copy into a new lab repository (or mark that repo as a GitHub template repository):

- `lab.manifest.json`: fill in; schema at `.github/schema/lab.manifest.schema.json` in the site repo.
- `.github/workflows/notify-site.yml`: tells the site to open a PR.
- Add the GitHub topic `cml-lab` to the repo (the nightly reconcile finds labs by this topic).
- Add repo secrets `SITE_APP_ID` and `SITE_APP_PRIVATE_KEY` (see `docs/LAB-HOOKS.md`).

Do not put `order`, `featured`, `accent`, `scene`, `repo`, `updatedAt` or `lastVerified` in the manifest. The site owns those and the sync rejects them.
