# Security policy

This is a static, no-login learning site. It has no user accounts and stores no personal data on the server. The contact form goes to a separate Cloudflare Worker (`worker/contact`).

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. (Maintainer note: this needs *Settings > Code security > Private vulnerability reporting* switched on. It is a repository setting, not something a pull request can enable.)

If that is unavailable, use the contact form on https://cyphermonkeylabs.com/ and write "security" in the subject. Do not put exploit details in the form; ask for a private channel first.

## What to expect

This is a solo-maintained project. I aim to acknowledge a report within 7 days and to say whether I can reproduce it within 14 days. These are goals, not guarantees. Fixes ship as a normal commit to `main`; there are no versioned releases, so only the current `main` (the live site) is supported.

## Scope

In scope: this repository, the live site at `cyphermonkeylabs.com`, `worker/contact`, and the GitHub Actions workflows.
Out of scope: third-party sites linked from labs, the vendor products the labs describe, and the separate lab repositories (report those on the lab repository itself).

## Good-faith research

Test only against your own browser and data. No denial-of-service, no social engineering, no scanning of other people's infrastructure. I will not pursue good-faith reports.
