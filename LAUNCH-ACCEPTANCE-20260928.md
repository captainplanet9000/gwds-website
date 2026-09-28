# Launch acceptance — 28 September 2026 UTC

Source/UI/framework sales are now open under the owner's explicit instruction. Hosted operational acceptance remains separate; this is not unrestricted trading launch approval.

## Latest evidence — 07:00 UTC

See the first section of CURRENT-RELEASE-STATUS.md for the current state. Subsequent work supersedes older unfinished/publication/pause statements below:

- Three-plan application acceptance passed against the isolated local database with real sandbox Stripe Checkout. Wallet proofs use new unfunded fixture wallets. Webhooks are locally signed using actual Stripe objects; provisioning commands are checked but not executed by a host in this harness.
- A declined Solo renewal and paid recovery exposed stale queued billing suspension. Hosting commit 60af252 fixes execution against obsolete billing state; 63 host-agent tests, full hosting types and the real-database stale-command check pass. Deployed on the primary without changing tenant containers; all four health endpoints returned 200.
- Purchase, trial, queued workspace, cancellation and failed-payment emails have provider-confirmed delivered examples. Inbox placement is not asserted.
- Recovery disk and installed inactive services survive a reboot. Authoritative database/public failover is not accepted. AWS instance quota request remains open; 100-runtime operation remains unmeasured.
- Owner testnet pilot is unpaused by explicit instruction, but its request quota is exhausted and withdrawable balance is zero. No request-capacity fee was submitted.

Additional evidence: hosting-app-acceptance-20260928.json, hosting-app-acceptance-solo-20260928.json, customer-email-delivery-20260928.json, recovery-preparation-20260928.json and host-agent-billing-recovery-20260928.json in C:/GWDS/artifacts.

## Source publication and application commerce — final update

- All eight live product pages passed 390px mobile and 1440px desktop checks: HTTP 200, no horizontal overflow, loaded images, source/framework disclosures and no obsolete sale-hold copy. Core mobile was also visually inspected. Evidence: C:/GWDS/artifacts/published-source-pages-20260928.json.
- Fresh local hosting checks passed mode-bound activation/replay rejection; eight competing notification workers acquired one send lease with recovery/acknowledgement protections; and 120 concurrent reservation attempts admitted exactly 100. This verifies reservation concurrency, not capacity to run 100 dashboards. No external email was sent by the notification lease test.
- Promoted fa1440c as dpl_2wdddDF1suNPxecwtnBo47Gwy4qo. Public catalog independently reports all eight registered products available. Comet confirms the customer-facing catalog and purchase controls.
- Eight immutable ZIPs were uploaded and downloaded with exact checksum/size verification. Live Stripe prices match. Package code is byte-identical to the tested r7 builds; documentation now describes source/framework scope and installation/validation requirements. Published identities: src/lib/source-releases.json.
- Real sandbox Stripe Checkout completed through the actual local application, creating exactly one order item/entitlement. The customer regenerated a download, followed its signed Storage URL, and received bytes matching the exact published Core SHA-256 and size.
- Same-payload webhook replay preserved state; invalid signatures were rejected. A declined card stayed unpaid and its expired checkout had no entitlement. Partial refunds retained access and permitted fresh download generation. Full refunds revoked access and blocked the old link. A new delayed checkout success did not restore the refunded entitlement.
- The fixture initially rebuilt a duplicate event with a changed creation timestamp; the replay guard correctly rejected it. The test now resends the original payload, matching a real retry.
- Email outbox reached sent/provider acceptance. Actual recipient inbox arrival is not established. Webhook requests in this isolated test are signed test fixtures with real Stripe objects, not proof of production Stripe delivery. Production customers and payment rows were not used for the gauntlet; all charges/refunds were sandbox.
- Full source venue/recovery acceptance remains outside this source-framework sale approval. Hosted entry pauses remain enabled. Embedded/mobile funding, complete hosted-plan application journeys, public failover and measured 100-runtime capacity remain unfinished. Earlier blanket source-sale holds below are historical and superseded.

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
