# Contact Worker (deployed)

The public site never contains the studio inbox. A Cloudflare Worker holds that address in a secret and is the only thing that can send mail.

`cml-contact` is deployed and answers at `https://contact.cyphermonkeylabs.com` (custom domain, root path). `worker/contact/wrangler.toml` keeps that route (`routes` with `custom_domain = true`) so a later deploy does not drop the hostname. Do not put a destination address in git.

## What the browser does

`mountContact` reads three meta tags:

- `cml-contact-mode` is `worker` on the pages that render the form (`/` and `/trust-demo.html`). `fallback` remains available for one view with `?contact=fallback`.
- `cml-contact-endpoint` defaults to `https://contact.cyphermonkeylabs.com` in `js/trust/copy.js`.
- `cml-turnstile-sitekey` is the public Turnstile site key. The secret stays in Cloudflare.

In worker mode the form renders the managed Turnstile widget and posts `cf-turnstile-response` with the other fields. The widget stays visible (`appearance: always`).

In fallback mode the form opens a GitHub issue on `CypherMonkeyLabs/cyphermonkeylabs.github.io`. Discussions are not enabled on that repo, so issues are the public path. The issue title and body include the name, topic, lab, and message. They do not include the visitor email. If the name or message contains an address, the form refuses to open the issue.

## Secrets and deploys

Secrets are already set in Cloudflare. Values stay in the dashboard:

- `TURNSTILE_SECRET`
- `TO_ADDR` (the destination inbox)
- `FROM_ADDR` (a mailbox on the Email Routing subdomain `notify.cyphermonkeylabs.com`; write the domain only, never a full address)
- `SALT` (a long random string for the rate-limit hash)

`SEND_EMAIL` and `RATE_LIMITER` are bound in `wrangler.toml`. If the rate-limit binding is not on the plan, bind a KV namespace named `RATE_KV` instead. If neither exists, the Worker returns `503 unconfigured` and sends nothing.

When a secret or the script changes, deploy from `worker/contact` with `npx wrangler deploy`. The custom domain route is in the config, so the command keeps `contact.cyphermonkeylabs.com`.

The Worker allows only `https://cyphermonkeylabs.com` and `https://www.cyphermonkeylabs.com`. It does not log message bodies. The hashed IP lives only inside the one-hour rate-limit window. The JSON response is `{ "ok": true }` or `{ "ok": false, "code": "..." }` and never echoes the destination.

Browser-visible codes are `captcha` (400), `too_fast` (400), `rate` (429), and `unconfigured` (503). The form shows a matching message and leaves the text in place.

GitHub issue creation from this repo is not part of the Worker. The nightly lab-health workflow is separate and only reports broken lab URLs.
