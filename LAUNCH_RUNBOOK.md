# Cival Systems launch runbook

The store is launchable only when every blocking item below is complete. A green website build alone is not permission to accept payment.

## 1. Restore account and download infrastructure

- Restore Supabase Auth and Storage service. The production project is currently restricted for exceeding its egress quota; changing the plan or spend cap is an owner billing decision.
- Confirm email verification, password reset, OAuth providers actually shown in the UI, and account sign-out.
- Confirm the `downloads` bucket is private and signed URLs work for the service role.
- Re-run the Supabase security advisors. Store tables must retain RLS and no `anon`/`authenticated` write grants.
- Separately review the non-store trading tables flagged by Supabase; their policies require product-specific decisions.

## 2. Produce customer-safe artifacts

For every active SKU:

- Build an isolated release directory; never archive a developer working tree.
- Exclude `.env*`, credentials, logs, databases, caches, `.git`, `node_modules`, and proprietary customer data.
- Install from the lockfile on a clean machine.
- Pass TypeScript, tests, production build, secret scan, dependency audit, and a paper-mode smoke test.
- Verify the package name, version, contents, license, setup guide, support path, and marketing claims agree.
- Create the final ZIP and run `scripts/verify-release-artifact.ps1`.
- Upload to the private Storage bucket, verify a signed download, then record exact version, object path, SHA-256, and byte size in `products`.
- Set `artifact_ready=true` only after the uploaded bytes and database metadata match.

Current Core candidate note: the source tree contains a populated developer `.env.local`; it has been excluded from the isolated release candidate. The clean dependency tree still needs remediation before Core can be marked ready.

## 3. Finish Stripe customer-facing setup

- Sign in to the Stripe Dashboard and set business name to **Cival Systems**.
- Set the correct canonical website and support URL after the Vercel domain consolidation is complete.
- Set support email to the monitored support inbox.
- Set statement descriptor to **CIVAL SYSTEMS**.
- Add approved Cival logo/icon and brand colors only from final brand assets.
- Review public business details, bank/payout information, legal entity, tax registrations, and refund settings manually. These are owner/legal/accounting decisions.
- Configure separate Stripe test-mode keys and a test webhook. Never verify checkout by creating an avoidable live charge.
- The required live webhook events are checkout completion/expiration/async result, payment failure, refund, and dispute create/close.

## 4. Consolidate domains and hosting

- `civalsystems.com` currently points to the static `cival-systems-store` Vercel project.
- This commerce repository is linked to `gwds-website`; `NEXT_PUBLIC_SITE_URL` and the active Stripe webhook still use `gwds.app`.
- Choose one canonical production project, deploy it, then move both apex and `www` aliases together.
- Update `NEXT_PUBLIC_SITE_URL`, Stripe profile/support URLs, Stripe webhook URL/secret, sitemap, email links, OAuth redirects, and Supabase redirect allow-list together.
- Confirm old domains redirect to the canonical host without redirecting webhook POST requests.

## 5. End-to-end test mode acceptance

Use a new verified test customer:

1. Register and confirm email.
2. Purchase Core with a successful Stripe test card.
3. Verify exactly one order, item set, entitlement set, and confirmation email.
4. Generate a download link, download the correct bytes, and verify expiry/max-use behavior.
5. Retry the same webhook and confirm no duplicate entitlement, coupon count, or email.
6. Test declined payment, expired checkout, asynchronous failure/success where supported, partial/full refund, and dispute revocation/restore.
7. Confirm a second user cannot read the order, receipt, entitlement, or download.
8. Confirm add-ons require Core in the cart or an existing entitlement.
9. Confirm admin login rate limiting, cookie expiry, logout, and audit events.
10. Test mobile navigation, checkout consent, account recovery, contact, newsletter unsubscribe, and refund request.

## 6. Activate and monitor

- Keep `NEXT_PUBLIC_STORE_SALES_ENABLED=false` until the checklist is signed off.
- Take a database backup and record the deployed commit and artifact hashes.
- Deploy production, run read-only health checks, then set the sales flag to `true` and redeploy.
- Place one controlled live purchase only if the owner explicitly approves the charge and refund plan.
- Monitor Stripe events, failed webhooks, fulfillment latency, email outbox failures, Storage errors, support requests, refunds, and disputes daily during launch week.
- If fulfillment or Auth/Storage fails, immediately disable the sales flag and redeploy; do not leave checkout open while delivery is impaired.

## Managed hosting

The customer and operator control plane is implemented under `/account/hosting` and `/admin/hosting`, but `NEXT_PUBLIC_HOSTING_SALES_ENABLED` must remain `false` until every gate below passes:

- Core and every included licence artifact passes clean install, TypeScript, tests, production build, secret scan and dependency audit.
- Each customer receives a genuinely isolated runtime and database boundary; provider project/database references are recorded in the instance.
- `HOSTING_CREDENTIAL_MASTER_KEY` is a unique 32-byte production secret, key rotation is rehearsed, logs are confirmed to redact payloads, and only dedicated trade-only API wallets are accepted.
- Automatic health checks and heartbeats are connected to the real tenant runtime; degraded/unreachable states alert the monitored support channel.
- Backups are enabled and a restore/recovery drill is recorded for the exact deployed release before activation.
- Provision, suspend, resume and decommission tasks have been executed end-to-end on a non-customer tenant.
- Stripe test mode passes subscription start, renewal, failed invoice, payment recovery, plan cancellation, portal access, replayed webhook idempotency and livemode mismatch rejection.
- Customer isolation tests prove a second user cannot read or mutate another subscription, onboarding, instance, usage, incident, audit or credential.
- Service terms, privacy/data handling, refund/cancellation policy, uptime/support targets, tax treatment and incident-response ownership receive business/legal approval.
- At least one plan has valid recurring Stripe product/price IDs, a verified included artifact and `launch_ready=true`.
- Admin activation refuses tenants without active billing, approved onboarding, provider/database/release references, healthy runtime and backups, and a recorded recovery test.

Only after those checks pass: set `NEXT_PUBLIC_HOSTING_SALES_ENABLED=true`, redeploy, complete one controlled live subscription, confirm the webhook-created tenant queue, and monitor billing/runtime events continuously. Store sales can remain independently disabled.
