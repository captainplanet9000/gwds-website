# Current release status — 20 September 2026 UTC

**Restricted testnet pilot; not ready for unrestricted customer automation or source release.**
Keep new entries paused and Core unpublished until the acceptance gates below pass.

## Latest verification — 19:23 UTC

- Final runtime 87759dd478e9ac1f7bb641d250c563391be0eab6 is deployed to all three active tenants, immutable image sha256:09d10fa29c8eabd23390ca577c34b3a93b2e80ac807506f2c6a0c0b1c49e0408. Publication 35530648195 and transport 35531578458 passed. The exact image passed all 24 isolated restore/restart checks in 104.25 seconds: /var/backups/cival/integrated-budget-87759dd-20260920/report.json.
- Browser verification shows three unchanged manual positions, six completed agent trades, no BNB exposure, and the corrected $575.16 estimated remaining budget. Final-image management cycle 19:23:02–19:23:08 returned entries_paused with zero errors, no new orders and no duplicate imported fills. All operator entry halts remain enabled; Core remains unpublished.
- Fresh backup 20260920T192057Z includes the completed BNB exit and current runtime configuration. Offsite verification completed at 19:22:15 UTC: four files, 473,284,834 bytes. Host-agent, scheduler and Caddy remain active.

## Verification — 19:11 UTC (historical)

- Runtime e58c9c10b6bb62ffdcafca98dbb5b20d2b12a0ba is deployed on all three active tenants (sha256:572536b3d028ae5f71d84ff2c2fe1ddd4b17eccf42ccb0fb9e046eedde796f2c). Publication 35530323691 and transfer 35530922261 passed; the exact image passed 24 restore/restart checks in 104.2 seconds. Report: /var/backups/cival/integrated-small-close-e58c9c1-20260920/report.json.
- The 19:10:10–19:10:21 management cycle closed the remaining 0.012 BNB at 771.03 through journal intent aa210fd3-6a93-4d10-bca8-f64928533329 and venue order 60604490043. Fill 859620994916631 and fee 0.004163 were imported; intent is closed/inactive. Agent balance 575.161101, cumulative P&L -44.838899, completed positions 6. Independent venue read at 19:10:40 confirms no BNB exposure or working BNB orders. ETH +0.0345, AVAX +6.08 and SUI -23.1 are unchanged. No new entries or fund transfers were submitted.
- This completes the previous position's exit and accounting, not a new full lifecycle on the final runtime. Fresh entry/protection/replacement/restart acceptance remains required. All entry halts remain enabled.
- Core's actual production server passed seven paper-mode startup/access checks using the disposable database and blank signing keys, including owner dashboard/API access and rejection of anonymous/wrong-owner access. Its acceptance server was stopped afterward.
- Budget-display image 87759dd is still in CI and is not deployed yet.

## Verification — 19:00 UTC (historical)

- At 18:42 UTC, the scheduled pilot reconciled all three partial close fills, persisted exact fees/P&L and released the original close intent with zero errors. The follow-up cycle then found a local minimum-notional check blocking the remaining 0.012 BNB reduce-only close. That rejected intent is inactive; the position remains open. The previous runtime incorrectly reported the failed Renko close as a successful cycle.
- Fix e58c9c1 preserves exact small reduce-only closes, removes dust-as-flat strategy behavior, and propagates failed Renko actions into cycle errors. Nineteen regressions and targeted execution types pass; publication 35530323691 is building, not deployed.
- The refreshed customer dashboard visibly shows the 0.012 BNB position and all three partial fills; manual ETH/AVAX/SUI positions are unchanged. Additional source 95e4aeb corrects the card's misleading allocation-based margin figure to a remaining-budget estimate after losses and position margin; three tests pass. Release 87759dd includes this test in CI; publication 35530648195 is queued.
- Held Core source passes 30 tests, full strict typecheck, a fresh production build, and the isolated 35-table owner/RLS integration suite after the precision and ownership fixes. It remains unpublished pending durable lifecycle/plugin and customer installation acceptance.

## Verification — 18:41 UTC (historical)

- Runtime `5e459ebb5fba98917b72317dd2da3535a96b14b8` is deployed to all three active dashboards, immutable image `sha256:7db921bae379554756eba0e709a8969df7073c6f72675d60b89cc3931bb361fa`. Publication 35528650558 and transport 35529324080 passed. All three containers are running; new entries remain paused.
- The actual image and fresh backup passed 24 isolated restore/restart checks in **94.22 seconds**. Evidence: `/var/backups/cival/integrated-exit-5e459eb-20260920/report.json`. Backup `20260920T183209Z` (473,277,963 bytes) was verified offsite at 18:33:41 UTC.
- Host release `d9dcfb6fae4b7d1d92a7d6043335f5a3441fb3db` is deployed; full hosting typecheck and CI 35528639560 passed. The 18:26 cycle now correctly reports failed reconciliation rather than `ok`, without replaying its trading request.
- This deployment includes emergency/protection controls from 06c5f2b and the BNB sizing/partial-fill fixes. Venue lifecycle verification is ongoing; the last independently verified remaining BNB exposure is short 0.012. The close intent remains active until its exact fills are imported.
- Follow-up `e89ec9625d85813c3e2e700e1f7cc709a957b1d7` blocks entries while any working market order remains and removes fixed 0.001-unit close cutoffs. Focused checks passed; publication 35529153887 is building. It is not yet deployed.
- Held Core source now passes 29 tests and a full typecheck after porting precision, selected-network reads, canonical ownership and per-fill reconciliation. No archive was replaced or published. Durable submission/replacement, full customer setup, plugin acceptance and final build/installation verification still gate publication.

## Verification — 18:20 UTC (historical)

- **Post-deployment lifecycle finding:** the 18:11 UTC scheduled Renko reversal submitted a journaled reduce-only BNB close, order `60601754857`, filled 0.3 BNB in three partial fills. An unloaded precision cache rounded the intended 0.312 close to 0.3, leaving **0.012 BNB short**. Reconciliation then processed same-timestamp fills in trade-ID order rather than exposure order and correctly refused inconsistent ownership. No new entry was opened; ETH, AVAX and SUI quantities are unchanged.
- Runtime fix `5e459ebb5fba98917b72317dd2da3535a96b14b8` requires fresh venue precision for all sizing, orders simultaneous exits by their starting exposure, and reports close fills without claiming a flat position. The exact three venue partial fills now pass regression tests. Nineteen focused tests and focused TypeScript passed. Publication run **35528650558** is in progress; this fix is **not yet deployed**.
- Hosting fix `d9dcfb6fae4b7d1d92a7d6043335f5a3441fb3db` records tenant-reported reconciliation errors as failed cycles even with HTTP 200, without replaying the request. Twenty-four scheduler protocol tests and scheduler TypeScript passed; host deployment is being prepared. The 18:11 cycle's previous `ok` label must not be interpreted as successful reconciliation.

- Runtime `ea02adc79916a8f62cff7340c95e6838e6c64e36`, image `sha256:c2aefb9778a29f6c4b081a030d27742726b87b285f9ad85bca4ee27958bc5951`, is selected for all three active tenants. All queued restart commands completed. The customer agents page opened over HTTPS after rollout; all operator entry halts remain true. Publication CI 35526985172 and private transport 35527554071 passed.
- Production migrations 0040, 0041 and 0042 are applied. They add durable protection modification identities, withdrawal requests persisted before submission, and transactional margin reservations. Unknown submission outcomes retain claims/reservations. Fresh snapshots and agent budgets are checked before entries. Legacy exposure and full venue-boundary acceptance remain release gates.
- Host release `cea9c9bbb733b53ee7776223d2cb22a5ff03f74b` is deployed and active. The runtime checks fresh host ownership before signing exchange mutations; moved/suspended tenants fail closed. This is not physical fencing or completed multi-host failover.
- Renko exit management now runs while new entries are paused, verifies the position owner, and never opens a reversal position in the same cycle as a close. The scheduled post-deployment exit and fill accounting are still awaiting verification.
- Backup `20260920T175516Z` was verified offsite at 17:59:09 UTC (four files, 473,272,801 bytes). The actual ea02adc image and restored database passed **24 isolated checks in 104.62 seconds**, including tenant isolation, setup/cancellation, accounting-write restrictions and unresolved order/withdrawal persistence after restart. Evidence: `/var/backups/cival/integrated-funding-ea02adc-20260920/report.json`. No customer signing keys or external network were available to that test.
- Withdrawal settlement now requires matching venue ledger evidence and finalized Bridge2 evidence. A historical testnet withdrawal was matched read-only to the bridge contract. No new customer deposit/withdrawal journey was performed; deposit credit, reload recovery and mobile wallet acceptance remain outstanding.
- Next candidate `06c5f2b` routes emergency stop and protection controls through the canonical execution path and reports pending/error outcomes. Its publication build is still running; those additional controls are **not yet deployed**.
- Browser verification shows four venue positions, BNB short 0.312 with both original reduce-only protective orders, and the agent allocation of $620. ETH, AVAX and SUI quantities are unchanged. No mainnet orders or customer transfers were submitted during this continuation.
- Core remains unpublished. Complete final-runtime trading acceptance, customer funding settlement, multi-host failover and source-product acceptance are not complete. Earlier sections below are historical evidence, not current deployment instructions.

## Verification — 17:15 UTC (historical)

- Allocation runtime `7ed5b0138ac33792ed86ad0a3beae27bfa5954bb` is deployed to all three active tenants, image `sha256:20b21cdef108329c90db1f24f32fd83a5612737960f724fc1e45afbb17e1bc9a`. All restart commands completed; entry halts remain true. Browser account → dashboard access and the new allocation dialog passed. No allocation or venue order was changed by that UI check.
- Migration 0039 is applied, checksum `2d8ddf9141738f88`. Budget changes are serialised, retry-safe, audited and bounded by fresh venue equity. Agent accounting/history cannot be overwritten through browser writes; running-agent reallocations and unresolved-order changes are refused. Rebalance uses the same atomic path. This does not yet establish full execution-margin reservation or multi-host fencing.
- Allocation publication CI 35501547499, transport 35524459407 and hosting CI 35501551295 passed. Local tests: 30 focused API/proxy/allocation tests; real PostgreSQL concurrent requests, batch rollback, preserved P&L, retry identity, stale snapshots, exposure checks and tenant boundaries. Focused TypeScript passed.
- Backup `20260920T170610Z` includes migration 0039; offsite upload completed. Restored database + actual compiled image passed 20 checks in 100.43 seconds. Evidence `/var/backups/cival/integrated-allocation-7ed5b01-20260920/report.json`. This isolated test had no external network or customer signing keys.
- Next runtime candidate `fd6c0e7` adds durable linked protection modifications, refuses ambiguous resubmission, keeps previous protection identities until reconciliation, blocks identified legacy signing/order paths, and restricts hosted broad cancellation to owned entry orders. 54 execution/ownership tests passed before one additional stop-tightening test was added to CI; PostgreSQL concurrent replacement/identity/unknown-state tests passed. Migration 0040 passed a production-schema rollback-only test, but is NOT applied yet. Candidate is building; no claim of deployed protection replacement or complete venue lifecycle.
- Core remains unpublished. Funding settlement, real final-runtime lifecycle, full failover and source-product acceptance remain outstanding. The following earlier sections are historical.

## Verification at 08:51 UTC (historical)

- Runtime `680ffe226144fdd060e0faa80d22080933ea84ab` is deployed to all three original tenants, image `sha256:acb8e95b911a4c5bf649f2a24288f8fa97f73f8f806faa77575acabcc4ce384a`. All entry halts remain enabled. Earlier e273 and 4b3914b deployment references below are historical; 4b3914b remains the previous rollback image.
- Seven host-capacity/service/telemetry CloudWatch alarms were enabled and verified OK; SNS confirmation and test email delivery passed. The metrics collector runs every minute.
- Backup `20260920T073916Z` was uploaded offsite. Integrated restore with 4b3914b passed nine checks, including tenant isolation and unresolved journal persistence across a full container restart. This is not a public failover or real venue submission/recovery test.
- An actual Stripe sandbox seven-day Solo checkout completed with a test card. Its real event was forwarded with an isolated local webhook signature through the application. This exposed and fixed `HOSTING_PRICE_MISMATCH`: migration 0037 now binds live/test prices independently and rejects conflicting replay/session mismatches. Real production Stripe delivery remains a separate check.
- The sandbox customer verified an unfunded wallet, completed workspace onboarding, installed one Darvas BTC slot, was refused a second Solo slot, opened its private HTTPS dashboard and opened billing portal access. Cancellation and duplicate cancellation replay passed; the tenant is now suspended. No customer funds moved and no new exchange orders were placed.
- The customer dashboard exposed a legacy agent creation gap. Runtime `680ffe226144fdd060e0faa80d22080933ea84ab` now uses installed entitled slots, starts agents/farms paused at zero allocation, blocks the old hosted POST and direct browser creation RPC, and rejects database failure instead of inventing success. Twelve focused API/proxy tests, focused TypeScript, and local PostgreSQL creation/capacity/idempotency/entitlement/cancellation/isolation checks passed. Production-schema rollback-only tests passed without retaining fixture changes.
- Migration 0038 is applied and checksum tracked (`4be21de336a65718`). Publication CI 35499456662 and private transfer 35499994832 passed. Image sha256:acb8e95b911a4c5bf649f2a24288f8fa97f73f8f806faa77575acabcc4ce384a is now deployed to all three active customer containers. All three process-health checks passed. Browser verification confirmed the new setup form and a refreshed pilot position display. Entry halts remain true; the canceled fixture remains suspended/stopped.
- Candidate also includes c5cd003 fill-history pagination and complete timestamp-batch processing. c5 publication and transport passed, but c5 was not rolled out separately.
- Hosting source HEAD `b36e90f`; storefront source HEAD `26dadf6`. Application storefront deployment remains fad5c81. Core remains unpublished.

- Cancellation exposed missing HTTPS routes for suspended customers. Gateway fix 0bad519 is deployed: known unavailable workspaces retain TLS and return a responsive 503 page with a hosting-account link, without an upstream connection. Eight generator tests passed; Caddy validated/reloaded; browser confirmed the repaired page. Active pilot still returns authenticated 401 for anonymous requests.
- Fresh backup 20260920T083106Z completed after migrations 0037/0038. Offsite upload completed at 08:32:29 UTC: four files, 473,162,591 bytes.
- New allocation review finding: legacy agent PATCH accepts balance/statistic overrides and its funding modal ignores non-2xx responses. The alternate allocation endpoint checks then writes separately, leaving a concurrent allocation race. Fix with a single audited allocation path and atomic database limits; keep broad automation paused until verified.

- Final-image restore and setup acceptance passed all 15 checks in 98.99 seconds. Evidence: `/var/backups/cival/integrated-setup-680ffe2-20260920/report.json`. Restored PostgreSQL grants/RLS, real compiled API create/retry/cancellation, blocked legacy and browser-direct writes, cross-tenant isolation, and persistent halt/unresolved intent after container restart were verified. A synthetic hold-only plugin and unfunded sandbox tenant were used offline; this does not prove catalog strategy performance or live execution.
- Read-only venue verification after rollout: BNB short 0.312; both original reduce-only TP/SL orders remain present. ETH 0.0345, AVAX 6.08 and SUI -23.1 remain unchanged. No new orders or fund transfers were submitted during this work.
- The isolated localhost checkout server on port 3107 was stopped after sandbox acceptance. Owner development servers were left alone.

- Hosting CI 35500577147 passed application checks and Terraform validation. Its clean-database fixture now includes the checkout and agent-setup schema contracts; all migrations also passed a separate fresh disposable PostgreSQL test. Production migration history/checksums were not rewritten.
- Temporary private transport release runtime-transfer-35499994832-1 was removed after the image was hash-verified, restored-tested, deployed, and browser-checked. The immutable registry image and prior rollback image remain available.

- First scheduled pilot cycle after rollout completed at 08:50:38 UTC: outcome OK, HTTP 200, 6.346 seconds, zero errors, zero new executions. This verifies a halted management/reconciliation cycle, not a new full trading lifecycle.

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

1. **Allocation and execution acceptance:** atomic allocation, wallet-margin reservation, protection modification and execution-authority guards are implemented and tested. Verify outstanding legacy exposure/reservation migration, alternate execution routes, prepared/unknown-intent operator recovery and real venue protection replacement. Review sizing configuration against each customer's requested budget; do not infer safety from available wallet capital.
2. **Full trading lifecycle:** the previous BNB position is now fully closed and its fills, fees and realized P&L are reconciled. A fresh journaled entry → protection → modification → exit sequence on the final runtime is still required, including real restart/lost-response/cancel-failure boundaries. Do not describe the repaired legacy exit or mocked tests as full lifecycle acceptance. New entries remain paused.
3. **Funding acceptance:** durable withdrawal claims, exact ledger matching and finalized Bridge2 evidence are implemented; unknown requests remain blocked across restart. A historical testnet withdrawal was independently matched, but a fresh user-signed end-to-end deposit/withdrawal journey is still required. Deposit submission/reload recovery and mobile WalletConnect remain unfinished. No new user funds were transferred during these repairs.
4. **Customer purchase/setup:** sandbox Solo checkout, provisioning, wallet verification, one-slot setup, second-slot refusal, dashboard access, cancellation replay and isolated installed-agent API acceptance passed. Complete live delivery/inbox checks, abandoned/failed checkout, trial eligibility, refund/out-of-order events and each catalog-agent installation. The pilot's custom Renko agent is not proof that all six store strategies work.
5. **Source products:** Core now passes 30 tests, full strict types, a fresh production build, 35-table isolation integration and seven actual paper-server startup/access checks. Precision and canonical ownership fixes are ported. Finish the durable execution port, internal scheduler authentication, alternate signer audit, plugin/Trader acceptance and clean customer first-run journeys before building and publishing allowlisted archives. Core remains unpublished.
6. **Recovery and scaling:** isolated restored-database/runtime/restart checks have passed with the latest journal schema. Physical old-host fencing, public failover, authoritative database recovery, exchange reconnect, loaded market-data fan-out and commissioned multi-host placement are not complete. Recovery-host admissions remain disabled. The primary's configured capacity is not load-test evidence.
7. **Operator/customer notifications:** production SNS subscription and delivery passed at 07:33–07:34 UTC. Complete the separate customer verification, reset, purchase, provisioning, trial, failed-payment and cancellation inbox checks.
8. **Business release:** finish admin coverage and refund/support runbooks, publish only accepted source artifacts, and match promotional claims to verified capabilities. Campaign drafts exist but have not been posted.

## Working locations

- Runtime: `C:\GWDS\dashboard-runtime`, branch `fix/hosted-order-reconciliation`, PR captainplanet9000/cival-dashboard-runtime#1.
- Hosting: `C:\GWDS\hosting`, master `d9dcfb6`; deployed, CI 35528639560 passed.
- Storefront: `C:\GWDS\storefront-customer-release`, branch `fix/store-release-customer-flow`, PR captainplanet9000/gwds-website#8.
- Core/private acceptance tools: `C:\GWDS\selfhost-release-20260918`. Private audit proposals and backups contain financial data and must never be packaged in products.
- Leave the owner's separate `C:\TradingFarm\Cival-Dashboard-v9` and localhost:9005 untouched. Preserve unrelated runtime working-tree edits.

See DURABLE-EXECUTION-ACCEPTANCE.md in the runtime repository and LAUNCH-READINESS-2026-09-19.md here for historical evidence. This file separates current verified deployment from outstanding work; it is not a launch certification.
