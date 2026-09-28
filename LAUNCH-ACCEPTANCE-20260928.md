# Launch acceptance — 28 September 2026 UTC

This is continued operational acceptance, not unrestricted launch approval.

## Completed in this pass

- Inspected the authenticated Stripe dashboard in Comet. The AWS pilot webhook showed 37 failed deliveries out of 37; the main website destination showed 0% errors.
- AWS service logs identified `HOSTING_ACTIVATION_FAILED:Invalid API key` and `HOSTING_SYNC_FAILED:Invalid API key` in the obsolete website pilot.
- Verified the main website subscribes to all 13 pilot event types plus trial reminders. The current main handler retains direct provisioning and lifecycle RPCs. Its database records show all three pending financial/subscription events completed on 24 September.
- Disabled only `we_1UGgseLLyk0oaesNRCAVUoZ3`, retaining history. Main destination `we_1U6fUgLLyk0oaesNuymN6cPp` remains enabled. Confirmed Disabled in the Stripe UI. No events were fabricated/replayed against production, and no live payment or refund was made.
- Real Stripe sandbox provider checks passed for Solo ($29), Desk ($79), and Fund ($199): required payment-method collection, abandoned checkout expiry without subscription, exact invoice settlement, partial and full refunds, and cancellation. Solo's trial was exactly seven days. A declined test card was rejected. All 13 fixture cleanup operations passed.
- Found and fixed customer access after a partial refund: account download eligibility, regeneration, legacy order claiming, and refund requests now accept `partially_refunded`. Active entitlement and owner checks remain required. Full refunds and revoked/disputed licenses remain blocked.
- Found and fixed clean commerce installation failures in migrations 011/012. Optional legacy objects are hardened only when present. Thirteen base migrations pass against a new disposable PostgreSQL database; repeated legacy hardening, RLS, grants, view invoker, and function-access checks pass.
- All 140 storefront tests and strict TypeScript checks pass.
- A second refund defect was confirmed in the deployed PostgreSQL function: a different, delayed success event could reactivate a refunded entitlement and count the purchase twice. The new migration preserves prior paid/refunded/disputed state, validates payment-intent identity, and rejects conflicting event replay. Real PostgreSQL tests prove partial-refund downloads still work, full-refund tokens remain revoked, delayed success cannot reactivate access, and revenue remains counted once.
- Applied `20260928001555_prevent_refund_access_reactivation.sql` transactionally to the authoritative AWS `supabase-db`, after saving the prior function in `C:/GWDS/artifacts/fulfill-store-order-before-20260928.sql`. Production readback confirms both guards and denied `anon`/`authenticated` execution. No production order rows were changed by this DDL.
- Storefront ca929b6 built Ready and was promoted as `dpl_8jLoe4GBuSvXMTXhDFPa1ayDqFXR`, https://cival-systems-store-b21bfqoro-civals-projects.vercel.app. Public store/hosted/account return 200, anonymous download regeneration 401, unsigned webhook 400. Focused lint has zero errors and two pre-existing `any` warnings in the account page.

## Evidence

- `C:/GWDS/artifacts/stripe-webhook-consolidation-20260928.json`
- `C:/GWDS/artifacts/stripe-provider-acceptance-20260928.json`
- `scripts/consolidate-stripe-webhooks.mjs` (audit by default; explicit `--apply` retires the named duplicate)
- `scripts/stripe-provider-acceptance.mjs` (sandbox-only, no application fulfillment claim)
- `scripts/test-commerce-bootstrap.mjs` (disposable local database only)

## Limits and remaining work

Provider tests do not prove application checkout-to-provisioning, delivered customer email, webhook refund entitlement changes, or every plan's customer journey. The older full gauntlet still assumes Core is on sale and needs restructuring without weakening its production release gate. Its previously referenced local database contained runtime tables rather than commerce tables; the base commerce migrations have now been applied there, but full hosted control-plane setup is still needed for an isolated application acceptance environment.

Embedded funding/mobile, public failover, measured runtime capacity, and final exact source-archive venue/recovery acceptance/publication remain open. All source release holds and hosted new-entry pauses remain unchanged. No mainnet trading was enabled. The earlier hosted testnet lifecycle and control-recovery results remain recorded in the preceding status reports.
