# Lessons

- The published lab list still lives at `/labs.json`. `/data/labs.json` is the contract path and is not on `main` yet, so the checker falls back and says so.
- The Webex canon lab's public URL is a Vercel host and the legacy record has an empty repo field. It does not match the `cipher0x9.github.io/<repo>/` rule. The legacy checker warns. The pack3 checker would reject it.
- GitHub Discussions are disabled on `CypherMonkeyLabs/cyphermonkeylabs.github.io`, so the no-mailbox fallback opens an issue.
- A Pages artifact deploy in this workflow would change how the current site ships. The trust workflow only verifies.
- The contact Worker is intentionally not deployed. A secret inbox cannot be proven from the repository.
- `upgrade-insecure-requests` is left out of the meta policy. GitHub Pages already redirects to HTTPS, and the directive blocks module scripts on a local HTTP preview.
- An older copy of the site, outside this slice, still contains a public mailbox. These pages do not read it and do not print it.
