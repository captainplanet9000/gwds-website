# Cival Systems nine-step release gauntlet

Run date: 2026-08-20 PDT

Storefront commit: `31128b4`

Production deployment: `dpl_3QARBUzukBvY2TKs693PmrubbHfm`

Canonical URL: `https://www.civalsystems.com`

Release verdict: **storefront deployed and verified; paid sales remain gated**

## 1. Product scope and truth — PASS

- Cival Core 2.0 is the only customer-visible product release.
- The supported product is paper-only. It has no exchange connector, wallet-secret form, withdrawal path, or live-order endpoint.
- Retired and unverified catalog items are hidden from the store, sitemap, static generation, and direct routes.
- The clean Core repository was merged to `main` at commit `f7c82977858214160f917746f0e8e49ec6a14242`.

## 2. Artifact, demo, and gallery — PASS

- Customer ZIP: `cival-core-v2.0.0.zip`
- Size: `77,635` bytes
- SHA-256: `9a6ef85723054149ff62d197d6a0324fede093d527f12510172f09ec445ca070`
- Supabase catalog metadata matches the uploaded private artifact.
- Four unique production gallery images load at their verified dimensions.
- The public Core demo responds successfully at `https://cival-core-v2-template.vercel.app`.

## 3. Customer accounts and operator access — PASS

- Customer registration, verified-email login, order ownership, entitlements, download regeneration, and account-bound access are implemented.
- Admin shared-password access was removed.
- Operator access requires a verified Supabase identity, a database role, and AAL2/TOTP before the short-lived HTTP-only admin session is issued.
- Unauthenticated customer, admin, and hosting routes fail closed.

## 4. Stripe account and checkout configuration — PASS WITH SALES GATE CLOSED

- Stripe business details, public branding, statement descriptor, customer portal, live products/prices, and production webhook are configured.
- Store and hosting payment gates remain `false` in production.
- Automatic Tax remains disabled until the owner confirms legal entity and tax registrations.

## 5. Payment, fulfillment, and refund lifecycle — PASS

The automated Stripe sandbox gauntlet completed a real hosted Checkout flow and verified:

- successful card payment;
- signed webhook validation;
- exactly-once order and entitlement fulfillment;
- confirmation email delivery;
- customer download-token generation and signed artifact redirect;
- idempotent webhook replay;
- invalid-signature rejection;
- declined-card handling;
- expired-checkout handling;
- partial refund with access preserved;
- full refund with access revoked;
- removal of temporary users, orders, catalog objects, and local processes.

The run found and fixed two real PL/pgSQL `order_id` ambiguity defects in fulfillment and refund event handling before deployment.

## 6. Storefront, support, legal, and status surfaces — PASS / OWNER SIGN-OFF REQUIRED

- Home, store, product, hosted, status, setup, account, contact, terms, privacy, refunds, disclaimer, and hosting terms return HTTP 200 without browser errors.
- The Hyperliquid mint token remains `#4ade9f`, and the WebGL hero canvas is present.
- Support copy is best-effort and does not invent response-time or uptime promises.
- Refund, incident, daily-operations, recovery, and launch procedures are documented.
- A qualified attorney/accountant and the owner must still confirm entity name, address, refund language, privacy obligations, sales-tax registrations, and launch jurisdiction. These facts cannot be inferred from code.

## 7. Managed hosting control plane — CODE PASS / LAUNCH HOLD

- Paper-only subscriptions, onboarding, tenant records, task leasing, idempotent provisioning, deployment, health checks, workspace state, backups, recovery, suspend/resume, incidents, audit records, and operator views are implemented.
- The former secret-vault endpoint returns HTTP 410. Customers are never asked for exchange keys, wallet secrets, seed phrases, or private keys.
- Hosting sales and automation remain disabled.
- Launch still requires a dedicated scoped Vercel automation token, a Vercel Pro-grade two-minute scheduler (or equivalent), and a complete create/deploy/isolation/backup/restore/suspend/resume/delete tenant drill. The current Hobby-compatible daily cron is intentionally not presented as a customer SLA.

## 8. Security and recovery gates — HOLD

- Targeted source and artifact secret scans pass.
- Anonymous/authenticated access to legacy operational trading tables is revoked; only the deliberate public catalog and read-only paper-demo surfaces retain grants.
- Production no longer contains the old admin password or hosting credential-vault variables.
- Required owner actions before any sale:
  1. Rotate the Supabase service-role key exposed in old Git history, update deployments, and prove the old key is rejected.
  2. Revoke the legacy GitHub classic PAT that was embedded in an earlier remote URL.
  3. Enable Supabase leaked-password protection.
  4. Complete and record the managed-tenant backup and recovery drill.

## 9. Build, deploy, and production verification — PASS WITH GATES CLOSED

- TypeScript: pass.
- Unit tests: 13/13 pass.
- Production build: pass; 60 static pages generated.
- ESLint: zero errors; 119 legacy warnings remain, mostly in older admin UI and the intentionally preserved landing animation.
- Credential scan: pass for storefront source and Core product.
- Production crawl: pass, including four unique gallery images, Core demo, canonical legal/account/status routes, retired-product HTTP 404, and no unexpected console errors.
- Gate checks: checkout HTTP 503, hosting checkout HTTP 503, removed credential vault HTTP 410, protected admin API HTTP 401, protected cron HTTP 401.

No paid gate may be enabled until every HOLD item above has recorded evidence.
