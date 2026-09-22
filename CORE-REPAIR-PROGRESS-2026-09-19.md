# Core repair evidence — 19 September 2026

## Scope and release state

Working candidate: `C:\GWDS\selfhost-release-20260918\core`.
This is unpublished repair work. No production trading host, customer download,
source-sales hold, hosting admission cap or mainnet setting was changed by this work.

## Completed and verified

- Strict TypeScript: 74 diagnostics reduced to zero; errors were repaired rather than ignored.
- Final configured Next production build passed after the account-route and SDK repairs.
- Twenty automated tests pass: signing/network guards, API ownership, schema adapters,
  stale market data, refusal of fake execution success and installer guards.
- An isolated local Supabase installation runs on API port 55521 under project
  `cival-core-acceptance`. It has no production credentials or customer data.
- All 26 shipped tables reject anonymous reads and hide rows from a second authenticated
  user. Owner CRUD, cross-account write denial, zero balances and negative P&L passed.
  Two simultaneous conditional close writes updated the trade exactly once.
- Fresh PostgreSQL bootstrap, repeat initialization and refusal to transfer the owner passed.
- Actual running-server checks on localhost:9057 confirmed owner-only Socket.IO and
  external trading proxy access. An unconfigured proxy returns 503 rather than contacting
  an unrelated local service. The local HTTP process was stopped after verification.

## Repairs

- Account balance/positions and alternate autonomous reads use the selected network, rather
  than hardcoded mainnet. Failed or malformed exchange responses return errors, not zero
  balances or empty-position success. Unvalued spot tokens are excluded from USDC equity.

- Database adapters now use the shipped agent/farm/goal/trade columns and primary keys.
- Trade records retain failed/pending/executed/unknown states instead of displaying them
  as open. Closing a ledger record requires its stored status still to be open.
- Public Hyperliquid reads parse actual venue responses, require a master account address
  and reject stale books; unsupported signing methods no longer invent success.
- The legacy server connector uses the shared SDK signing path, rejects paper-mode signing,
  checks order responses and uses the master account for account subscriptions.
- SDK cache identity includes the key, account and network; concurrent initialization is
  deduplicated only for matching identities, with invalidation protected against stale completion.
- Missing cancellation confirmations and incomplete batch-order confirmations are rejected.
  A batch is no longer described as atomic; callers must reconcile before retrying.
- Emergency cancellation targets recorded order IDs instead of blanket wallet cancellation.
  The separate flattening/position-attribution path still needs acceptance.
- Paper-engine duplicate/unresolved code was repaired; initial capital is tracked and an
  explicit fresh-live-price input is available. That input is not yet an end-to-end feed.
- Single-owner RLS policies include a restrictive owner boundary. The portable `db:init`
  command applies schema/policies atomically, checks migration hashes and requires exactly
  one verified owner. No automatic ownership transfer is permitted.
- Owner identity is mandatory for authenticated application APIs and custom-server startup.
  Socket/proxy traffic has its own verified-owner gate; socket identity is rechecked.
- Browser Supabase services now use the shared cookie-session mechanism instead of disabling
  session persistence. Server anonymous clients remain unprivileged.
- Updated environment example, installation instructions and ignore rules; local credentials
  and acceptance fixture files remain excluded.

## Reproduce checks

Private handoff checkpoint (not a customer release):
`C:\GWDS\selfhost-release-20260918\Cival-Core-unpublished-repair-20260919.zip`.
SHA-256: `4f37739623199bec27feca5b78fa9454c615cdf6df14cfadc5d5d6668537599d`.
The explicit source-file allowlist excludes `.env.local`, acceptance credentials,
dependencies and build output. It is not uploaded to the store.

From the candidate directory:

```
npm test
npm run typecheck
npm run build
node tests/isolation.integration.cjs
node tests/server-auth.integration.cjs
```

The integration scripts explicitly require the disposable acceptance environment.
The isolation script regenerates users; before the server test, set the local owner email
to the new owner fixture, then start the local server on 9057. Never print the fixture file
or environment file into a report. The server test expects no external trading backend.

## Outstanding — do not remove the release hold

1. Table inventory gaps are now resolved: 35 tables cover the active callers. Continue
   complete customer workflow acceptance against their real database contracts.
2. Finish real partial-fill, rejection, protection, restart and duplicate-order acceptance;
   review emergency flattening ownership, wallet-wide cancellation callers and nonce concurrency.
3. Replace statistics that convert database errors into zero or infer positions by counting
   recent order events. The activity query also assumes a foreign key not in the shipped schema.
4. Prove every browser service uses authenticated owner sessions, and test authenticated
   internal scheduler operation. A compiler/build pass is not evidence of these workflows.
5. Run clean Windows/Linux installation and exact plugin-loader acceptance for each product;
   test Trader separately and build immutable, checksummed customer archives.
6. Continue the launch audit's purchase/provisioning/cancel/refund, hosted tenant isolation,
   funding/withdrawal review, full-host recovery, snapshot, alert delivery, capacity,
   immutable deployment and support/email acceptance items.

The prior launch audit remains the launch decision. This report updates Core repair progress,
not the readiness of the entire product or business.

## Follow-up — 20 September 2026 UTC

- 27 unit tests pass; strict typecheck and configured production build pass.
- Real Supabase tests verify isolation across 35 tables, paper-session fills and
  short-position accounting, durable trailing state, and exactly-once atomic trade
  closure/P&L with fill receipts. Security advisors report no issues.
- Removed unused database helpers and the browser migration runner. Added migrations
  for actual runtime persistence and generated types from the real local database.
- Paper sessions use their own position ledger instead of the incompatible agent ledger.
- Accepted resting orders now reconcile through explicit venue status and deduplicated
  fills. Partial entries cancel the remainder before promotion to managed exposure.
- Protection recovery persists client order intent before submission; unknown outcomes
  are looked up by client ID rather than blindly submitting duplicate orders.
- Ambiguous position ownership is rejected by the monitor. Realized P&L requires matched
  entry/exit fill evidence; missing evidence is not replaced by an estimated market price.

New unpublished checkpoint: `C:\GWDS\selfhost-release-20260918\Cival-Core-unpublished-repair-20260920.zip`.
266 explicitly selected source files; SHA-256
`aaeebce06a6b59fececa239fc2e3ddf0421021647012fb58733da4eaa175733f`.
Local environment files, fixture credentials, dependencies and build output are excluded.
The prior checkpoint remains available. No customer download was replaced.

Remaining trading acceptance includes durable pre-submit entry intent, every alternate
execution/close path, partial fills racing cancellation, protection cleanup after closure,
multi-agent ownership on a netted account, scheduler authentication, and a complete venue
open/protect/manage/close/restart cycle. Unit and local database tests do not satisfy these.


## Dependency and clean-build checkpoint

A fresh Linux Node 22 install, 27 tests, strict typecheck and production build
passed. Windows checks passed again after the same dependency changes. These
are source-install/build checks, not customer first-run or venue acceptance.
Patched ws and nested PostCSS; production audit now reports 0 high/critical,
5 moderate and 13 low findings in remaining SDK dependencies.

Current private checkpoint: `C:\GWDS\selfhost-release-20260918\Cival-Core-unpublished-repair-20260920-v2.zip`.
266 allowlisted files; SHA-256
`b91e6c2fe8af00a34404e0872f8bd66cab20ac4c91ec520f7797e620907070c7`.
It contains the patched lockfile and updated README. It is not uploaded to the
store; the previous immutable checkpoints are preserved.
