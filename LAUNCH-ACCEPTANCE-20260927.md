# Launch acceptance update — 27 September 2026 UTC

**Not approved for unrestricted launch, 100 running dashboards, or source publication.**
This report supersedes the older verification counts, but does not mark any of the six launch workstreams fully complete.

## 1. Exact source products

Candidate directory: `C:/GWDS/selfhost-release-20260918/acceptance-20260927-r4`.
Core SHA-256: `1f5f86a6217404c6f1fb15182d0de07d3a73f67964726180975df4ba7fbe790a`.
Trader SHA-256: `262a38d5826091db4eac6fdcc68f8bd3da0b6f58ba597ef5b5631efadf8fe43b`.
All eight archives have byte counts and hashes in `archives.json`; none was uploaded or registered as a replacement paid download.

Completed:
- Core clean Windows npm installation, full typecheck, 35 tests, production build, dependency audit with zero known findings.
- Trader independent clean Node 22/Linux installation, full typecheck, 35 tests, production build, dependency audit with zero known findings.
- Exact Core production server: anonymous and wrong-owner access denied, authorized dashboard/API access passed.
- Each of the six exact plugin ZIPs loaded through the production Core catalog and API. Created each agent and farm paused, disabled and unfunded; replay returned the same agent; saved strategy defaults and market restriction were honored; analysis preserved paused state. Trader independently passed those six strategy runtime checks.
- Atomic agent creation migration: eight concurrent retries create only one agent/farm, conflicting request rejected, failure rolls back, direct customer RPC execution denied.
- Fresh disposable database bootstrap and repeat-bootstrap check passed for the r2 candidate, which contains the same bootstrap and migration as r4. Do not confuse this with a new r4 bootstrap run.
- Real database paper-ledger checks: partial/full fills, duplicate protection, short-position P&L, persisted history, trailing state reload and closed-state non-reactivation.
- Removed unused simulated custody/transfer modules and the vulnerable unused Alchemy dependency graph from the source candidate. Backups retained outside the release.

Remaining: exact-artifact customer browser setup/install/edit/uninstall, durable live execution parity, internal scheduler and alternate-path audit, fresh testnet lifecycle and recovery, documentation/screenshots on the final artifacts, independent final bundle acceptance, immutable registration and publication. Passing paper tests does not approve live execution.

## 2. Hosted runtime

Runtime commit `768154b75bdd17be05524c6dba1b32f107a16436`:
`sha256:ff8747342931065e7ed5ca2af75179678fe3f09654f116c2f5f610c9dce5a848`.
Publication 36282812939 and transport 36284220055 passed.
Deployed as a canary to tenant `cival-860b9dad18f04b2284f7`; other three containers remain on the previous image. The host image setting now points to the new immutable image for subsequent starts.

Browser acceptance: Analyze produced only the configured BTC analysis; the existing agent remained paused with zero allocation and the operator halt enabled. The previous hardcoded ETH analysis was historical, not repeated.
All four tenant entry halts were verified enabled. No new order, close or funding transfer was submitted in this acceptance pass.

Remaining: fresh eligible-account entry/protection/modify/exit plus real-venue restart/partial-fill/cancel/lost-response acceptance. Isolated fault tests are not substitute evidence. Pilot account quota restrictions must be respected.

## 3. Commerce

122 storefront tests, typecheck and focused lint passed. Real PostgreSQL activation checks passed test/live price binding, replay/conflict, wrong session, null/mismatched price, rollback and customer privilege refusal.
Production storefront commit `718cbdd` deployed to `https://cival-systems-store-603lfqin1-civals-projects.vercel.app`, verified on www.civalsystems.com: installed strategies now say INSTALLED instead of claiming they are running/trading.

Remaining: actual sandbox purchase/setup journeys for every plan, failed/abandoned checkout, eligibility, production webhook delivery evidence, delayed events/refunds/entitlements and final customer installation. Existing paid-history evidence is not a normal paid customer lifecycle.

## 4. Funding

Customer screenshot and dashboard show ownership verified, trading agent approved, 999 testnet USDC venue equity; the screenshot showed zero Arbitrum Sepolia USDC and gas. No fresh signed funding movement has been accepted in this run.
Fresh database deposit/withdrawal tests passed concurrent claims, durable replay, pending locks, conflicting identities, restricted mutation, tenant isolation, ambiguous-state retention and evidence-gated settlement.
Remaining: customer wallet signature for a small testnet withdrawal and return deposit, chain/venue settlement, reload reconciliation, error and mobile flow. No private key or signature may be fabricated or substituted.

## 5. Recovery and capacity

Fresh production backup: `/var/backups/cival/daily/20260927T011033Z`.
Exact new image passed 15 isolated recovery checks in 86.65 seconds; report: `/var/backups/cival/integrated-768154b-20260927/report.json`.
These cover actual runtime/database restore, cross-tenant boundaries, restricted journal writes and restart retention of halts/unresolved execution/funding records. Signing keys were not loaded and external networking was disabled.
Fresh reservation stress: exactly 100 accepted and 20 rejected from 120 concurrent attempts at a configured capacity of 100; expiry freed one slot and customer writes were denied.

This is NOT a 100-dashboard runtime load test or public failover. Production admission remains four. Remaining: host fencing/authority under public failover, real loaded multi-host placement, measured CPU/RAM/latency/fan-out and capacity provisioning.

## 6. Customer/operator operations

Read-only provider verification of the ten latest hosting notifications:
- Eight provider-confirmed delivered, spanning hosting_started, hosting_activated, hosting_canceled and provisioning_failed.
- One hosting_started bounced despite the local outbox saying sent.
- One hosting_activated remains pending, attempts zero.
Evidence: `C:/GWDS/artifacts/hosting-email-delivery-20260927.json` (message IDs/status only; no keys).
A sent outbox state means provider submission, not delivery. Inbox arrival was not independently read.

Newly identified gap: hosting notifications have no scheduled general outbox drain, and a process crash after setting sending has no lease recovery. Failed delivery/bounce needs actionable admin status and controlled retry, not blind resending. Verification/purchase/payment-failure delivery, support/refund procedure and remaining operator incident alerts still require acceptance.

## Operator constraints

Keep source sales held and broad new entries paused. The user's customer wallet must complete the outstanding signature actions. Do not raise the admission limit to 100 based on reservation-only evidence. Preserve exact image/artifact hashes and historical entitlements. Do not treat earlier status notes as current production evidence.

## Owner release decision and subsequent repairs

The owner explicitly selected **finish operational acceptance first**. There is no authorization to relabel the paid offering as early access to bypass acceptance.

All eight r4 ZIPs were staged privately and remotely hash-verified during publication preparation, with no product delivery pointers or checkout gates changed. Subsequent local source repairs make those ZIPs stale candidates. Details: `C:/GWDS/selfhost-release-20260918/core/OPERATIONAL-ACCEPTANCE-20260927.md`.

The newer source passes 38 regression tests and strict types. Real PostgreSQL checks cover a persistent emergency latch and atomic agent/farm state changes. Production runtime internal-authentication and owner-isolation checks passed before the final hosted-only scheduler cleanup; the final build/run log is under the Core `.acceptance` directory. Full durable execution/venue acceptance is still required.

### Continued acceptance: farm setup and roster correctness

The newer local Core source now passes 40 tests, strict typecheck, production build and built-server setup/readback checks. Farm creation and add-agent use the atomic installed-strategy transaction; concurrent retries do not duplicate agents. Server farm/trade-history reads no longer use anonymous credentials or hide their permission failures as successful empty data. New farms and their agents appear immediately after creation in the acceptance API tests. None of this has been packaged into the staged r4 ZIPs or published.

Browser acceptance found additional Overview/network-health discrepancies and remaining farm allocation/control paths to consolidate; these are recorded in Core `OPERATIONAL-ACCEPTANCE-20260927.md`. The six launch workstreams remain incomplete. The live funding page still shows an approved agent and $999 testnet balance, but no signing provider or Arbitrum Sepolia gas in this browser, so no signed settlement has been proven.

### Durable Core execution repairs (local, unpublished)

Core now has a PostgreSQL order journal, serialized reservations, exact identity recovery, journaled protection modification, and ownership checks shared by self-hosted and hosted-style execution paths. Goal exits, emergency closes, and protection recovery use the durable route. Installed strategy signals now have an explicit live-mode execution path instead of only recording analysis or falling back to an unrelated farm LLM strategy. Forty-eight regression tests and strict typecheck pass; real disposable PostgreSQL concurrency/lost-response tests pass with simulated venue acknowledgements.

This is not fresh venue acceptance and does not close any of the six launch workstreams. Final build/runtime evidence and remaining source gaps are in `C:/GWDS/selfhost-release-20260918/core/OPERATIONAL-ACCEPTANCE-20260927.md`. These changes are not in the private r4 candidate archives and have not changed source product checkout gates or hosted entry halts.

### Continued launch acceptance: allocation and control boundaries

Local Core now uses serialized, idempotent allocation transactions; service-side fresh account capacity; browser mutation denial; durable farm controls; and preservation of agent financial history. Agent and farm allocation dialogs show failures and use stable retry IDs. All 48 unit tests, strict types, production build, final built-server owner/setup/allocation tests and real PostgreSQL allocation/journal fault tests passed. See the Core operational acceptance record for exact evidence and limits. These changes remain outside the older staged ZIPs and have not been deployed to hosted tenants.

The live customer funding page still has no connected signing provider and no Arbitrum Sepolia USDC/gas, though the approved Hyperliquid testnet account has $999. User wallet connection/signatures remain necessary for fresh settlement acceptance. Source publication and broad automation have not been enabled; the six overall workstreams are not yet complete.

### Hosting email recovery deployed

Production deployment `dpl_9GJ4hNsQfuSPKGPizXAW375C32WU` adds leased queue recovery, frozen message retries, bounded deduplication-aware retry windows, provider delivery checks, and Admin → Notifications. The primary host now runs the authenticated drain every five minutes. Initial production run completed with zero failures and nine provider checks: eight delivered and one bounced. The old pending activation email was held for operator review rather than sent with stale content.

126 tests, strict types, production build and real PostgreSQL notification concurrency/recovery acceptance passed. Full lint has zero errors and 145 warnings. Authenticated admin visual acceptance is blocked by the active browser account lacking admin access. Details, rollback, and operator procedure are in `HOSTING-NOTIFICATIONS-RUNBOOK.md`. This repair does not complete the six overall launch workstreams or authorize publication of the older unaccepted source archives.

### Exact r7 archives and final verification

Both Windows Core and independently installed Linux Trader passed clean npm installation, all 49 unit tests, strict typecheck, production build, and actual compiled-server acceptance. Five standalone agent ZIPs were installed into Core alongside its bundled Darvas agent; all six strategies passed catalog, create/retry, configured-symbol/defaults, analysis and paused/unfunded readback checks. Trader independently passed the same six-agent checks. Tests used paper mode, no signing keys and the disposable acceptance database. They are not a live trading, clean database provisioning, uninstall, or complete visual/mobile acceptance claim.

Evidence: C:/GWDS/selfhost-release-20260918/acceptance-20260927-r7/{windows-core,linux-trader}/.acceptance/. Archive manifest: acceptance-20260927-r7/archives.json. Core SHA-256 cda4150f3bcaa637c79de9e6e32de9fb34e7cdb9ef6ed81cc9f4edb36007b120; Trader f102e43ff1293a09641b2e5a25c368b919a0d912160fb3a5aa192dec4d57a3e7. No delivery pointers or source sales gates were changed.

Customer-facing fixes include removal of unavailable Core navigation links, a truthful network/execution-mode badge, read-only wallet refresh, explicit stale/unavailable feedback, and separation of paper budgets from venue funds. The r6 Windows clean build exposed Google-font download failures; r7 bundles unchanged fonts and their SIL licenses and passes without that external build dependency.

### Hosted ownership canary and remaining release gates

Runtime 3be250226c3bb69b74e64f04dd964726c84bbc3a passed publication CI 36293867116, transport 36294504373, and 15 isolated restore/restart checks in 86.04 seconds. Image sha256:e797ff123defd272d30ca941e0debc757978a33ca4890674d33c5e0ed8a71e37 is running on customer canary a0da08ed-6269-44c8-932f-0315a4d12981 only. Entry halt remains enabled; other tenant images remain unchanged. Restore report: /var/backups/cival/integrated-3be2502-20260927/report.json. A redundant start after automatic supervision recovery was refused by the duplicate-process guard. Production notification drain continued successfully at 04:49 UTC.

Launch is still withheld pending final-runtime real testnet lifecycle/fault acceptance, fresh customer-signed funding settlement/mobile flow, complete purchase/refund/plan/email acceptance, public failover and actual multi-host capacity measurement, and remaining authenticated admin/operations acceptance. Current browser customer account lacks admin access; administrator sign-in was requested. Wallet connection/signatures were requested separately. No new trades, funds transfers or customer charges were initiated in this pass. The site repair deployment is live; source products are not newly published and broad automation is not enabled.

### Customer-signed external withdrawal verified (05:47 UTC)

Owner connected wallet 0xAe93892da6055a6ed3d5AAa53A05Ce54ee28dDa2 and signed a separate 10 testnet USDC withdrawal in the official Hyperliquid app. Official history reports Completed with a 0.2 USDC route fee. Independent Arbitrum Sepolia receipt 0xba1327fc92277eac8e6a5b3074f8e700ca236c2dd5524b45c119d1ff0d0a795b succeeded and minted 9.8 Circle native USDC to that wallet; balance readback is 9.8. Legacy USDC2 balance is zero. This verifies the external withdrawal, not the earlier rejected Cival legacy request or a native Cival CCTP flow.

The store funding page now reads Circle native testnet USDC, removes the deprecated bridge destination, and links to the network-matched official funding flow with current route/fee review. Wallet verification and trading-key approval remain unchanged. Local validation: 126 tests, strict typecheck, production build and targeted lint passed. Source product release gates and trading entry halts are unchanged. Native Cival CCTP, return deposit/mobile acceptance and the other launch workstreams remain open.

Production store deployment dpl_B7oQZej6CTmm898rnYLi6PjkZ97h (commit 2d5be3b) is Ready and aliased to www.civalsystems.com. Authenticated Comet verification confirmed civallee4, the matching original wallet, native USDC contract, $9.80 wallet balance and current Hyperliquid funding link. Independent finalized block 313170139 exceeds receipt block 313168838; the withdrawal mint is finalized. Agent approval still displays approved. The UI currently asks to sign ownership again after reload; durable proof display remains a separate UX issue to inspect rather than falsely claiming that previous proof was lost.
