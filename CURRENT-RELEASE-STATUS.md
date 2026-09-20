# Current release status — 20 September 2026 UTC

**Restricted testnet pilot; not ready for unrestricted customer automation or source release.**
Keep new entries paused and Core unpublished until the acceptance gates below pass.

## Latest verification — 08:46 UTC

- Runtime `680ffe226144fdd060e0faa80d22080933ea84ab` is deployed to all three original tenants, image `sha256:acb8e95b911a4c5bf649f2a24288f8fa97f73f8f806faa77575acabcc4ce384a`. All entry halts remain enabled. Earlier e273 and 4b3914b deployment references below are historical; 4b3914b remains the previous rollback image.
- Seven host-capacity/service/telemetry CloudWatch alarms were enabled and verified OK; SNS confirmation and test email delivery passed. The metrics collector runs every minute.
- Backup `20260920T073916Z` was uploaded offsite. Integrated restore with 4b3914b passed nine checks, including tenant isolation and unresolved journal persistence across a full container restart. This is not a public failover or real venue submission/recovery test.
- An actual Stripe sandbox seven-day Solo checkout completed with a test card. Its real event was forwarded with an isolated local webhook signature through the application. This exposed and fixed `HOSTING_PRICE_MISMATCH`: migration 0037 now binds live/test prices independently and rejects conflicting replay/session mismatches. Real production Stripe delivery remains a separate check.
- The sandbox customer verified an unfunded wallet, completed workspace onboarding, installed one Darvas BTC slot, was refused a second Solo slot, opened its private HTTPS dashboard and opened billing portal access. Cancellation and duplicate cancellation replay passed; the tenant is now suspended. No customer funds moved and no new exchange orders were placed.
- The customer dashboard exposed a legacy agent creation gap. Runtime `680ffe226144fdd060e0faa80d22080933ea84ab` now uses installed entitled slots, starts agents/farms paused at zero allocation, blocks the old hosted POST and direct browser creation RPC, and rejects database failure instead of inventing success. Twelve focused API/proxy tests, focused TypeScript, and local PostgreSQL creation/capacity/idempotency/entitlement/cancellation/isolation checks passed. Production-schema rollback-only tests passed without retaining fixture changes.
- Migration 0038 is applied and checksum tracked (`4be21de336a65718`). Publication CI 35499456662 and private transfer 35499994832 passed. Image sha256:acb8e95b911a4c5bf649f2a24288f8fa97f73f8f806faa77575acabcc4ce384a is now deployed to all three active customer containers. All three process-health checks passed. Browser verification confirmed the new setup form and a refreshed pilot position display. Entry halts remain true; the canceled fixture remains suspended/stopped.
- Candidate also includes c5cd003 fill-history pagination and complete timestamp-batch processing. c5 publication and transport passed, but c5 was not rolled out separately.
- Hosting source HEAD `e604b44`; storefront source HEAD `26dadf6`. Application storefront deployment remains fad5c81. Core remains unpublished.

- Cancellation exposed missing HTTPS routes for suspended customers. Gateway fix 0bad519 is deployed: known unavailable workspaces retain TLS and return a responsive 503 page with a hosting-account link, without an upstream connection. Eight generator tests passed; Caddy validated/reloaded; browser confirmed the repaired page. Active pilot still returns authenticated 401 for anonymous requests.
- Fresh backup 20260920T083106Z completed after migrations 0037/0038. Offsite upload completed at 08:32:29 UTC: four files, 473,162,591 bytes.
- New allocation review finding: legacy agent PATCH accepts balance/statistic overrides and its funding modal ignores non-2xx responses. The alternate allocation endpoint checks then writes separately, leaving a concurrent allocation race. Fix with a single audited allocation path and atomic database limits; keep broad automation paused until verified.

- Final-image restore and setup acceptance passed all 15 checks in 98.99 seconds. Evidence: `/var/backups/cival/integrated-setup-680ffe2-20260920/report.json`. Restored PostgreSQL grants/RLS, real compiled API create/retry/cancellation, blocked legacy and browser-direct writes, cross-tenant isolation, and persistent halt/unresolved intent after container restart were verified. A synthetic hold-only plugin and unfunded sandbox tenant were used offline; this does not prove catalog strategy performance or live execution.
- Read-only venue verification after rollout: BNB short 0.312; both original reduce-only TP/SL orders remain present. ETH 0.0345, AVAX 6.08 and SUI -23.1 remain unchanged. No new orders or fund transfers were submitted during this work.
- The isolated localhost checkout server on port 3107 was stopped after sandbox acceptance. Owner development servers were left alone.

## Earlier verification (historical; see latest state above)

- Storefront `fad5c81`: Vercel `dpl_Eq35uBdxPfozdgZU2RxGmeKyai7N`, Ready and aliased to www.civalsystems.com. 118 tests and TypeScript passed. Customer workspace navigation, expired-session handling and configuration-error reporting updated. The published customer page was inspected in the browser.
- Runtime `e273ecf76084b8603b73f09503ba2443e3ec8521`: all three active containers use image `sha256:6778feb7124f0eeae6a05c24f5d2ab958a58a166096b1f35c8a177e68f1c5a24`. Publication CI 35487541510 and private transport 35488086470 passed.
- Production migrations 0035/0036 applied atomically as the existing postgres schema owner; both tracked checksums and forced tenant RLS verified. Initial attempt as supabase_admin rolled back completely on ownership mismatch before the successful application.
- All three control-plane entry halts remain true. Pilot local halt also true. Host agent requires an image digest, not a commit tag; its selection was corrected to the verified local digest before queued restarts ran. All restart commands completed.
- Pilot read-only venue check: BNB short 0.312; TP 60555855825 at 721.21 and SL 60555844736 at 790.27, both reduce-only for 0.312. ETH, AVAX and SUI customer positions unchanged.
- Cycle at 04:17:29 UTC succeeded in 6.072 seconds. Saved result: no errors, entry and reduction reconciliation successful, one agent's statistics updated. Canonical accounting: five completed positions, one win, four losses, realized results/recorded fees -44.121785. This includes fees booked on entries; it is not a profitability claim.
- Backup 20260920T035357Z: 473,094,922 bytes, four files, verified offsite upload to the private recovery bucket completed 03:57 UTC.
- Customer dashboard opened over HTTPS through the account button; agent card showed the BNB exposure and venue-snapshot timestamp. No mainnet orders, customer transfers or live purchases were made in this verification.

## Changes now deployed in 4b3914b (historical build notes)

Runtime commit `4b3914b121d27a37cefaed0a1ef65e0d2eba4960`, publication run **35488710079** passed; private image transport **35497159116** started:

- Requires canonical position ownership for exit attribution; refuses latest-agent and nearby-time matching.
- Imports protective exits and updates accounting during drawdown-paused cycles; returns unsuccessful cycle status for reported errors.
- Blocks legacy bank/PayPal withdrawal API in hosted workspaces and redirects legacy funding screens to the wallet-signed flow.
- Withdrawal signature tests cover own-wallet destination, network, tampering, expiry, minimum amount and HTTP-200 venue rejections. Tests use an unfunded fixture key and mocked venue; no funds moved.
- Wallet panel derives mark prices from venue position value, reports allocation-read failure instead of zero, and labels failed refreshes stale.
- Health endpoint describes process liveness and does not pretend to verify database or trading readiness.
- Focused TypeScript check passes. New ownership tests (4), funding tests (4), wallet tests (3), and existing fill tests pass. Full legacy repository typecheck remains a separate unresolved gate.

## Remaining work in priority order

1. **Execution integrity:** deploy/verify the final image; implement durable protection replacement and recovery without canceling the only confirmed stop; reconcile legacy working orders; paginate bounded fill history; remove unsafe alternate maker/plugin/emergency execution routes or bring them under the same journal. Prepared/unknown-intent operator recovery needs an explicit audited workflow. Ensure durable execution fencing across hosts, not just scheduler lease coordination.
2. **Full trading acceptance:** exercise real process/container restart boundaries with the order journal. Verify open → protect → manage → close on the final testnet runtime, partial fills, lost responses, failed cancellation, stale data and emergency controls. The current BNB trade has not completed its exit; the production journal has not yet recorded a new pilot entry. Do not equate a successful idle reconciliation or mocked venue test with that acceptance.
3. **Funding acceptance:** verify connected-wallet/chain/asset checks, rejection, deposit credit and withdrawal settlement. Unknown withdrawal acknowledgement and retry recovery need dedicated work before broad real-fund use. Mobile WalletConnect is currently unconfigured. Confirm the user-facing flow identifies testnet USDC2 clearly.
4. **Customer purchase/setup:** Complete the remaining purchase/setup cases after the successful sandbox checkout described above; deploy and browser-verify the new installed-slot agent creation path. Include abandoned checkout, failure/retry, seven-day trial eligibility, duplicate/out-of-order events, cancellation/refund and cross-account isolation. A stored test subscription or route unit test is not this journey. Test credentials already exist in protected local configuration; never print them. Pilot custom Renko configuration is outside the store's six-strategy loadout and must not be presented as a completed catalogue install.
5. **Source products:** Core's previous strict TypeScript and clean Windows/Linux install checks passed, but its older execution path still contains retry/adoption and ownership-on-read-failure hazards. Port the durable execution design with an appropriate single-owner schema, verify each plugin and Trader bundle, rebuild the allowlisted artifacts, then publish. Do not upload the currently held archive.
6. **Recovery and scaling:** repeat the isolated restore with the final journal schema/runtime; verify public recovery, old-host fencing, exchange reconnect, loaded market-data fan-out, concurrent placement and exhausted-capacity handling. Recovery host admission stays disabled until commissioned. Current primary capacity is five, with three assigned; this is not load-test evidence.
7. **Operator notifications:** Production SNS confirmation and delivery PASS. The user confirmed the subscription; AWS independently verified it at 07:33 UTC. The labeled test notification, message ID `63d3a737-93b7-57e6-a91e-c41e1dc377ac`, was visibly delivered to the recipient's Inbox and opened at 07:34 UTC. The confirmation email itself had been in Spam. Customer verification/reset/purchase/provisioning/trial/payment-failure/cancellation inbox checks remain separate.
8. **Business release:** finish admin coverage and refund/support runbooks; publish corrected source products only after their acceptance; ensure promotional copy matches verified capabilities. Campaign drafts already exist but have not been posted.

## Working locations

- Runtime: `C:\GWDS\dashboard-runtime`, branch `fix/hosted-order-reconciliation`, PR captainplanet9000/cival-dashboard-runtime#1.
- Hosting: `C:\GWDS\hosting`, master `47d5028`; its CI 35487545502 passed.
- Storefront: `C:\GWDS\storefront-customer-release`, branch `fix/store-release-customer-flow`, PR captainplanet9000/gwds-website#8.
- Core/private acceptance tools: `C:\GWDS\selfhost-release-20260918`. Private audit proposals and backups contain financial data and must never be packaged in products.
- Leave the owner's separate `C:\TradingFarm\Cival-Dashboard-v9` and localhost:9005 untouched. Preserve unrelated runtime working-tree edits.

See DURABLE-EXECUTION-ACCEPTANCE.md in the runtime repository and LAUNCH-READINESS-2026-09-19.md here for historical evidence. This file separates current verified deployment from outstanding work; it is not a launch certification.
