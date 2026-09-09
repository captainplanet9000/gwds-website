# Cival Systems store — full product & fulfilment audit

**Date:** 2026-08-27
**Scope:** purchase → download → install → run, for all 11 live SKUs
**Method:** 6 parallel audit lanes + 24 adversarial verification passes (30 agents).
95 findings raised; 27 blockers survived verification; 8 findings were **refuted** and are recorded
below so they are not re-fixed.

---

## Verdict

**The storefront cannot deliver any product today, and it is correctly refusing to try.**

Checkout is switched off (`NEXT_PUBLIC_STORE_SALES_ENABLED` is false), and behind that flag
`requireCatalog` fail-closes on catalog mismatch, artifact readiness, and a live pre-sign of every
artifact. That design is doing its job: it declines money it cannot deliver against.

The commercial problem is not the plumbing. It is that **what is described on the product pages is
not what is in the packages.**

---

## What was refuted (do NOT spend time on these)

| Claim | Reality |
|---|---|
| "Checkout returns 503 for everyone" | Intentional — the store is deliberately paused. Not a defect. |
| "`is_active = false` on 26 rows is a blocker" | Correct-by-design while artifacts are not ready. Flip it *last*, not first. |
| "14 Stripe orders sit unfulfilled" | Those are abandoned/incomplete sessions, not paid orders. |
| "Live `service_role` JWT sits in repo-root scripts" | **False.** Zero JWT literals in `scripts/`; they read from env. |
| "Bundle purchases grant no child entitlements" | Downgraded to minor. |

I reported to you earlier that *"someone can pay you $399 today and receive nothing."*
**That was wrong** — the store refuses at checkout, before payment. No customer can currently be
charged for an undeliverable product. The correction matters because it means there is no ongoing
customer harm, and no emergency.

---

## Blocker 1 — Seven real customers already paid and received nothing

This is the only finding involving actual customer harm, and it predates the pause.

- 7 completed orders in the live DB, two of them $149
- **0 entitlements** issued against any of them
- 5 of the 7 have **no line items** at all
- None of the buyers has a user account, so `/account` is a registration wall to them

**Action:** reconstruct `order_items` from the Stripe payment intents, insert entitlements, flip
`fulfillment_status`, and email those 7 addresses a one-time account-creation link. This should
happen regardless of what you decide about the rest.

---

## Blocker 2 — The packages do not match the sales copy

### Core Edition ($99)

The artifact the DB points at is **77,635 bytes / 48 files**: one page, one API route, two
components, and a *paper*-trading module with hardcoded demo prices and fake agent P&L.

The page sells ten capabilities. **None are present:** the working VWAP+RSI Hyperliquid agent,
goal-based execution, multi-strategy farms, real-time P&L and order management, drawdown and
correlation monitoring, agent health scoring, the plugin slot, 44 themes.

The product detail page also contradicts itself on the same screen — the feature list says it
trades real money; the "Not included" panel says it does not.

### The six $49 agents

Each ships **a single JSON prompt file with no strategy code**. The pages sell 44 specific
technical behaviours between them — box detection, Fibonacci ratio validation, order-flow
tracking, Z-score sizing, ADX gates. A buyer opens the zip and finds a prompt string.

Two of the six (VWAP Pro, Bollinger Mean Reversion) have **no implementation anywhere** to
package. The other four exist in `strategy-engine.ts`.

Separately: all six plugins emit an **undefined signal** — the loader reads `result.signal`, the
strategies return a different shape. Even wired up, they would not trade.

### Trader ($249) and Desk ($399)

Contain **zero of the six strategy agents they are sold on**, and they *do* contain all three
modules you asked to exclude.

### Extensions

- **Meme Trading Suite** — imports 8 library modules, ships 0 of them. Cannot build.
  Also sells smart-money wallet tracking that was deliberately removed for having no data source.
- **Flash Loan Arbitrage** — missing 4 modules and the contract executor it advertises.

### Demo links

`demoUrl` on **all 11 products** points at a deployment that is materially richer than the artifact
being sold. This is the strongest consumer-protection exposure here, because the buyer can observe
the gap themselves within minutes of downloading.

---

## Blocker 3 — Credentials that would have shipped to every buyer

Found in the dashboard source. **Now scrubbed** — 9 literals removed, all fail closed:

| Credential | Module | Was it live? |
|---|---|---|
| Hyperliquid signing key | `exchanges/hyperliquid.ts` | Dead module (0 importers) — disclosure risk only |
| Bybit API key + secret (×3 envs) | `exchanges/bybit.ts` | Dead module |
| Coinbase API key id | `exchanges/coinbase.ts` | Dead module |
| Alchemy API key | `alchemy/networks.ts` | Dead module |
| `WALLET_ENCRYPTION_KEY` default | `blockchain/wallet-manager.ts` | **Live** (5 importers) — env var was set, so no runtime change |

None were on a live signing path, so nothing was compromised and no restart was needed.
**You still need to rotate all of them — they are in git history.**

### Not fixed, needs your decision

`JWT_SECRET`, `SIGNATURE_SECRET`, `ENCRYPTION_KEY` and `NEXT_PUBLIC_ENCRYPTION_KEY` are **unset**,
so the live system is running on public default strings (`'dev-secret-change-in-production'`).
Any buyer running defaults gets forgeable auth. Making these fail closed requires generating real
secrets and **restarting your trading system**, so I left it for you to schedule.

`NEXT_PUBLIC_ENCRYPTION_KEY` is structurally wrong regardless of value — `NEXT_PUBLIC_` is inlined
into the browser bundle, so that key is visible to every visitor.

---

## Blocker 4 — Both bundles are unbuyable even after everything else is fixed

`requireCatalog` requires `products.ts`, `products.price_cents` and `products.stripe_price_id` to
all agree. They do not:

| SKU | products.ts | DB | Stripe |
|---|---|---|---|
| Trader Edition | $249 / `price_1U09vf…rCpa` | `19900` / `price_1U6fUf…m8mS` | **both ids live**, $249 and $199 |
| Desk Edition | $399 / `price_1U09vf…dx9a` | `34900` / `price_1U6fUg…X8MN` | **both ids live**, $399 and $349 |

Two live Stripe price objects per bundle at different amounts. The code fails closed so a
mispriced charge cannot occur, but both SKUs return an opaque *"A product is being updated"* 503.

**This needs a decision from you: what are the real bundle prices?** I will not pick a price for
your product. Once you say, I make all three surfaces agree and archive the orphan Stripe prices.

---

## Blocker 5 — A fresh install cannot run or trade

- **9 tables** the code writes to have **no `CREATE TABLE` anywhere** in the repo. A buyer cannot
  provision a working database. Needs one consolidated `schema/001_core.sql`.
- **2 npm packages on the order-signing path** (`hyperliquid`, `@msgpack/msgpack`) are missing from
  `package.json`. A clean `npm install` yields a dashboard that cannot place a trade.
- **No paper/live switch.** Whatever private key is in `.env` trades real funds immediately, with
  no arming step. For a product sold to strangers this is the most dangerous defect in the list.
- `npm run check` and `npm run build` fail from a clean tree; `npm run dev` serves HTTP 500.

---

## The good news — packaging the real dashboard is feasible

An import-closure resolver over the real dashboard produced working manifests, and five packages
were physically assembled and compressed:

| Package | Files | Size |
|---|---|---|
| Core | 229 | 3.7 MB |
| Trader | 272 | 4.5 MB |
| Desk | 396 | 6.2 MB |
| Meme extension | 43 | 1.2 MB |
| Flash Loan extension | 34 | 907 KB |

**The three exclusions are near-perfectly isolated — zero import edges** from shipping files into
`prop-firms`, `defi-lending` or `scalper`. The backend is far more decoupled than expected: the
whole strategy engine is 2 files with 1 internal import; the live farm engine is 15 files.

Two residual leaks, both from a single import edge in `goal-profit-collector.ts:5`:
`blockchain/defi-service.ts` and `blockchain/alchemy-service.ts`. Making that one import lazy drops
both. Two further contamination points: `/api/system/self-healing` drags the meme engine into Desk
(collapsing the $79 extension boundary), and `public/office` is 62 MB that must never ship.

---

## What I need from you before building

1. **Bundle prices** — $249/$399 as advertised, or $199/$349 as in the DB?
2. **Rotate** the Hyperliquid, Bybit, Coinbase and Alchemy credentials.
3. **A restart window** for the auth-secret fix.
4. **Confirm the Core story:** one agent, real Hyperliquid execution, paper-by-default with an
   explicit arming step. That is what I intend to build unless you say otherwise.

## Then, in order

1. Fix the 7 orphaned orders (independent of everything else)
2. Lazy-import fix + secret-scan gate in the packaging pipeline
3. Write the 2 missing strategies; fix the `result.signal` contract for all 6
4. Consolidated schema + missing deps + `TRADING_MODE=paper` gate
5. Build and upload real artifacts; populate sha256/size; flip `artifact_ready`
6. Rewrite all 11 product pages to match what ships
7. Fix bundle prices across all three surfaces
8. Flip `is_active`, then unpause the store
