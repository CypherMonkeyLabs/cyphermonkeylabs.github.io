# Contact Worker (not deployed)

The public site never contains the studio inbox. A Cloudflare Worker holds that address in a secret and is the only thing that can send mail.

This folder is a hook. Do not deploy it, do not create a Cloudflare account, and do not put a destination address in git.

## What the browser does today

`mountContact` reads three meta tags:

- `cml-contact-mode` is `fallback` or `worker`. The trust pages ship `fallback`.
- `cml-contact-endpoint` defaults to `https://contact.cyphermonkeylabs.com`.
- `cml-turnstile-sitekey` is the public Turnstile site key. Leave it off until the Worker is live.

In fallback mode the form opens a GitHub issue on `CypherMonkeyLabs/cyphermonkeylabs.github.io`. Discussions are not enabled on that repo, so issues are the public path. The issue title and body include the name, topic, lab, and message. They do not include the visitor email. If the name or message contains an address, the form refuses to open the issue.

A query such as `?contact=worker` forces Worker mode for one view and is not saved.

## What to turn on later

1. Put the DNS for `cyphermonkeylabs.com` on Cloudflare if it is not already. Email Routing has to be available. Confirm the free tier and do not add paid products.
2. Create a Turnstile widget. The site key goes in the meta tag. The secret does not.
3. From `worker/contact`, set secrets (values stay in the dashboard):

   - `TURNSTILE_SECRET`
   - `TO_ADDR` (the destination inbox)
   - `FROM_ADDR` (a no-reply mailbox on the site domain)
   - `SALT` (any long random string for the rate-limit hash)

4. Bind `SEND_EMAIL` as in `wrangler.toml`. Bind `RATE_LIMITER`, or a KV namespace named `RATE_KV` if rate-limit bindings are not on the plan. If neither exists, the Worker returns `503 unconfigured` and sends nothing.
5. Deploy with Wrangler only when those secrets exist. Suggested command, run by a person: `npx wrangler deploy` inside `worker/contact`.
6. Flip the site meta tag to `cml-contact-mode=worker` and add the site key.
7. Run the contact checks in `docs/QA-MATRIX.md` (T-CON) against a staging inbox before pointing the custom domain at the Worker.

The Worker allows only `https://cyphermonkeylabs.com` and `https://www.cyphermonkeylabs.com`. It does not log message bodies. The hashed IP lives only inside the one-hour rate-limit window. The JSON response is `{ "ok": true }` or `{ "ok": false, "code": "..." }` and never echoes the destination.

GitHub issue creation from this repo is not part of the Worker. The nightly lab-health workflow is separate and only reports broken lab URLs.
