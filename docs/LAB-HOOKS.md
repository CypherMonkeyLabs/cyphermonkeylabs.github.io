# Lab hooks: how a new lab becomes a planet

```
lab repo push -> notify-site.yml -> repository_dispatch(lab-updated) -> sync-lab.yml
  -> fetch lab.manifest.json @ sha -> validate -> upsert data/labs.json -> PR bot/lab-<id> -> CI -> merge -> Pages deploy
nightly: sync-lab.yml reconcile (topic cml-lab) opens bot/lab-reconcile if anything drifted
```

## Files

| File | Purpose |
|---|---|
| `.github/schema/lab.manifest.schema.json` | Fields a lab author owns (documentation + editor support) |
| `.github/schema/lab.schema.json` | Shape of one `data/labs.json` entry (documentation; `validate-labs.mjs` is authoritative) |
| `.github/scripts/validate-labs.mjs` | Authoritative validator used by CI and by the sync job |
| `.github/scripts/lab-manifest.mjs` | Merge logic + CLI used by `sync-lab.yml` (tests: `lab-manifest.test.mjs`) |
| `.github/workflows/sync-lab.yml` | Receives dispatches, runs reconcile, opens the PR |
| `templates/lab-repo/` | What each lab repo copies |

## Reconciling the schema with the live data (decisions)

- `lab.schema.json` previously required `url` to match `https://cipher0x9.github.io/<repo>/` exactly. Live entries point at landing pages such as `/campus/`, and `validate-labs.mjs` already allowed paths. The validator was treated as authoritative and the schema doc was updated to match.
- Owners accepted: `cipher0x9` and `CypherMonkeyLabs`, so labs validate before and after the transfer in `TRANSFER_PLAN.md`. Hosts accepted: `*.github.io` of those owners, `cyphermonkeylabs.com/<repo>/`, and an explicit allowlist `EXTERNAL_LAB_HOSTS` for non-Pages labs (currently the Canon on Vercel; those may omit `repo`).
- Ownership split: the manifest holds lab-owned fields only. The merge keeps `order, featured, accent, scene, i18n` from `labs.json`, sets `repo`, `updatedAt`, `lastVerified`. New labs get `featured:false`, `order = max(category)+10`, a hash-derived `accent` and `scene`. A manifest containing site-owned fields is rejected.
- `js/universe/normalize.js` already defaults `scene.size`, `moons` and `order`, so new planets render even without hand-tuned values.

## One-time setup Lucky must do (this PR creates no secrets)

1. **Create a GitHub App** (Settings > Developer settings > GitHub Apps > New), e.g. `cml-lab-sync`. Webhook off. Repository permissions: **Contents: Read and write**, **Pull requests: Read and write**, Metadata: read. Generate a private key.
2. **Install it** on the site repo `CypherMonkeyLabs/cyphermonkeylabs.github.io`. Because the labs are currently under the personal account `cipher0x9`, a user-installed app and an org-installed app are separate installations. Simplest: do the transfer first (so all repos are in the org) and install once on the org.
3. **Site repo secrets** (Settings > Secrets and variables > Actions): `LAB_SYNC_APP_ID`, `LAB_SYNC_APP_PRIVATE_KEY`.
4. **Each lab repo secrets** (or org secrets after transfer): `SITE_APP_ID`, `SITE_APP_PRIVATE_KEY`. The same App can serve both roles (give it Contents write on the site repo); then reuse the same values under the second names. A fine-grained PAT with Contents: Read and write on the site repo also works for the dispatch step, at the cost of an expiry date and tying it to your account.
5. **Settings**: create label `lab-sync`; keep Actions allowed to create PRs not required, because the App creates them. Optional: enable "Allow auto-merge" and set repository variable `LAB_SYNC_AUTOMERGE=true`; also require the `verify` check in a ruleset on `main`. Leave auto-merge off until you have watched a few PRs.
6. **Topic**: add `cml-lab` to every lab repo.

## Why an App token

A pull request created with `GITHUB_TOKEN` does not trigger `pull_request` workflows, so `ci` would never run on the sync PR (GitHub Docs, "Use GITHUB_TOKEN for authentication in workflows"). A PR opened by an App installation token does trigger CI.

## Limits to remember

`repository_dispatch` needs the workflow on the default branch, `event_type` <= 100 chars, `client_payload` <= 10 properties. Scheduled workflows can be delayed or dropped and are disabled after 60 days without repo activity in public repos; that is why the nightly job is a backstop and dispatch is the primary path. The workflow reads only `repo` and `sha` from the payload and validates both (owner allowlist, 40-hex SHA).

## Test plan

1. `node --test .github/scripts/lab-manifest.test.mjs`
2. After setup, run `sync-lab` manually (Actions > Run workflow) with `repo = cipher0x9/<lab>`; expect "unchanged" for labs whose manifest matches.
3. Add `lab.manifest.json` to one lab, push; expect a `bot/lab-<id>` PR with CI running.
4. Push an invalid manifest; expect the run to fail with REJECTED in the log and no PR.
