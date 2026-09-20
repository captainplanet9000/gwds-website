# Store release audit — 19 September 2026

## Verification update — 20 September 2026

The Core repair candidate now passes 33 tests, strict TypeScript checking, a
production build, and seven production-server startup/access checks. The latest
repairs make eight market/risk/strategy consumers use the configured Hyperliquid
network. Market-data failures and malformed prices return HTTP 502 with an
explicit stale indicator. This supersedes the earlier 74-diagnostic candidate
count below; it does not approve the old published ZIP or a replacement sale.
Candidate evidence is in `C:/GWDS/selfhost-release-20260918/core/.acceptance/`.

All 118 storefront tests pass. The local database activation checks pass for
test/live price binding, replay idempotency, conflicting events, mismatched
sessions and rollback. A concurrent admission test accepted exactly 100 of 120
attempts with 100 available slots, released one slot after expiration, and denied
customer capacity writes. This measures reservations, not running-host capacity.
All 47 existing synthetic strategy-package cases pass; these are not evidence of
profits or complete live execution.

The read-only Stripe check verified active live USD prices, enabled charges and
payouts, and the enabled production webhook. It does not verify successful
customer payment or webhook delivery end to end. The legacy sandbox harness now
refuses remote customer databases before catalog mutations, even when given a
Stripe test key. A complete isolated purchase-to-install journey remains required.

Source sales remain held pending exact-artifact installation, fresh trade
lifecycle/fault acceptance, bundle acceptance and replacement archive publication.

## Release decision

**Source products are not approved for new sales.** Storage integrity and payment fulfillment pass the checks below; they do not prove the software installs or manages trades correctly. The source-sales guard is in `src/lib/release-readiness.ts` and the checkout API. Existing entitlements/downloads and managed hosting are separate paths.

Production baseline: storefront commit `c55ebfb`, branch `sync/hosting-dashboard-link`, Vercel deployment `dpl_DkVqcQB8YbExxrgNy65DvwfyRY2Z`. This branch preserves its mode-specific Stripe price fields and customer hosting integration.

## Verified evidence

- All eight active downloadable products have active, live USD Stripe prices matching the database amounts.
- Paginated paid store Checkout sessions: one; unmatched paid orders: zero. The matching order is an earlier $0.50 fulfillment test, not proof of normal customer volume.
- That order has an active entitlement and fulfilled status. Its email outbox entry is marked sent; recipient mailbox arrival was not verified.
- All eight exact production ZIP downloads match their registered SHA-256 and byte lengths.
- Core 2.1 repair candidate strict typecheck currently reports 74 diagnostics. The original exact archive reported 278 before prior repairs. Passing a build with ignored TypeScript errors is not acceptance.
- Its schema lists 23 referenced-but-undefined tables, including order and position storage. The old README described a larger v10 runtime with unsupported performance claims. Replacement candidate README/RUNBOOK files are in `release-assets/core-documentation`; these have not replaced paid downloads.
- The six published plugin manifests contained settings absent from their source defaults. VWAP used a string session length and scalar band multiplier; supplied defaults threw during evaluation. Flat prices also exposed an invalid equal-price protection setup.
- The unpublished 2.1.1 plugin candidates align manifest defaults and declared timeframes with code. VWAP rejects malformed configuration/data, collapsed bands and invalid protection geometry. Strict compilation plus 47 synthetic signal-contract and input-rejection checks pass. These are not profitability or runtime-integration tests.
- Storefront automated tests: 76 passing at the initial verification. Re-run the commands below after any subsequent change.

## Implemented storefront changes

- Catalog availability endpoint fails closed; checkout rejects archives awaiting acceptance before creating an order or payment session.
- Cart normalization removes products already included in editions. API independently rejects overlapping licenses.
- Desk remains hidden, matching its inactive production status. Core includes Darvas; Trader includes Core and six frameworks. Correct Trader comparison: $344 separately versus $249, a $95 difference.
- Descriptions now reflect source behavior. Removed unverified average hold times, returns, chart overlays, ADX, order-flow feed, automated farm coordination and external macro/on-chain data claims.
- Sentiment Proxy Research explicitly labels its candle-derived estimates and simulated variables. It can issue trade signals.
- Version-aware purchase/setup guide, installation requirements, troubleshooting, backups, rollback and first-run acceptance. Linked from product details, purchase success, account downloads and order email template.
- Removed richer-runtime screenshots and promotional videos from current source products. New illustration assets are explicitly not screenshots.
- Server-key handling recognizes Stripe restricted keys consistently across checkout, webhook and hosting paths.
- Updated Next.js, image processing and development dependencies. Full `npm audit`: zero known vulnerabilities.
- Corrected production catalog descriptions and versions to match the exact 2.1.0 archives. Historical order snapshots and archive hashes/paths remain unchanged.

## Required before re-enabling sales

1. Finish the full Core runtime repair in `C:\GWDS\selfhost-release-20260918\core`. Repair schema/model mismatches, missing connector methods, internal scheduler authentication and alternate execution paths. Do not suppress compiler diagnostics or weaken authentication.
2. Complete strict clean installation from a new immutable ZIP on supported Windows and Linux environments. Include a lockfile and accurate Node requirements. Verify Supabase Auth/REST/schema setup; plain PostgreSQL is insufficient.
3. Prove owner authorization and isolation against an empty dedicated database. Verify missing/invalid secrets fail closed, no credentials reach the client, and startup binds safely.
4. Prove paper mode across every signing path. Complete testnet open → protect → manage → close, restart reconciliation, cancel failures, partial fills, stale data and emergency stop. Record actual evidence without manufacturing trades or results.
5. Validate all six candidates through the exact dashboard loader and agent UI. Confirm configuration edits, ownership, status, lifecycle and install/uninstall behavior. Keep the Macro proxy limitations visible.
6. Apply accepted repairs to Trader and validate that bundle independently. Do not copy a Core result to Trader without testing.
7. Package source, compiled plugin entry, LICENSE, INSTALL, README, environment example, release notes and a portable first-run check. Add container/reverse-proxy, backup and restore guidance validated against the shipped runtime.
8. Record replacement archive version, SHA-256 and size. Scan for secrets and dependency findings. Update catalog version and immutable storage path/hash/size only after acceptance. Preserve historical purchase terms and existing artifact access.
9. In an isolated Stripe test environment, complete account registration/verification, checkout success/cancel, webhook retry/duplicate/out-of-order events, entitlement creation, email retry, authorized re-download, cross-account denial, refund/revocation and plugin dependency/plan limits. Current paid production evidence is only one prior fulfillment test.
10. Capture screenshots and tutorial walkthroughs from those exact artifacts. Replace conceptual imagery only with correctly labelled evidence. Verify desktop/mobile, keyboard use, validation errors and recovery paths.
11. Remove accepted product IDs from the release gate and disable the broad source-sales hold only when appropriate. Deploy and verify real customer-facing availability. Never enable a product solely because Storage contains a ZIP.

## Reproducible local checks

Storefront deployment `dpl_7dGEdU68m8SLuiuU5pBh2kbeed67` was promoted to www.civalsystems.com on 2026-09-19. Public store/catalog/guide return 200, source availability is false for all eight held products, and anonymous account-order requests return 401. Desktop/mobile checks verified category links, search, product navigation, guide contrast and expandable help. Code and candidates are preserved in draft PR #8 against the actual production source branch.

```powershell
npm ci --ignore-scripts
npm test
npm run build
npm audit
node scripts/verify-strategy-packages.mjs
git diff --check
```

`release-assets/strategy-packages/validation.json` records the candidate signal results. Candidates are excluded from Vercel deployment and have not replaced customer downloads. Local `.vercel` audit files contain access-dependent diagnostics and are intentionally not committed. Do not upload environment files or signed download links.

## Artwork provenance

AI-generated conceptual artwork: `public/images/guides/customer-journey-v1.png`. Created through the image generation tool in text-to-image mode; no model selector was available. Prompt direction: premium Cival onboarding composition, ivory/cobalt/charcoal studio palette, matte 3D software cube, blank manual, server and connected modules; no text, UI, trading charts or coins. It represents onboarding, not application functionality.

Six vector strategy covers are reproducible using `scripts/create-strategy-covers.mjs`; they explicitly identify themselves as conceptual strategy illustrations. No fabricated performance screenshots are used.

## Screenshot gallery release

The store now uses browser captures from the user-selected demo and hosted testnet workspace. Core, Trader and all six standalone strategies retain their product IDs and contents. Product-specific captions, source labels, full-detail images, thumbnails and a keyboard-accessible native dialog replace conceptual hero art. See PRODUCT-SCREENSHOT-AUDIT.md for provenance and remaining findings. This is presentation evidence from broader editions, not acceptance of the currently held archives.

Validation: 78 tests passed (including image type/dimensions and complete product coverage); production build and TypeScript check passed. Browser checks covered desktop and 390px mobile width, no horizontal overflow, full-size viewer navigation, Escape and focus restoration, plus all six corrected demo agent profiles. No orders, funding or withdrawals were submitted.
