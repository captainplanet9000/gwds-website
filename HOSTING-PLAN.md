# Hosting 1000 tenants — architecture, buy-list, and the two things that decide it

**Date:** 2026-08-27
**Method:** 5 research lanes + cost model + decision synthesis (7 agents)
**Measured baseline:** one tenant = ~250 MB web + ~60 MB worker ≈ 310 MB, on a 128 GB / 32-core host

---

## The headline: the binding constraint is not RAM

Everyone assumes the limit is memory. It is not.

**Hyperliquid enforces 1,200 request-weight per minute per source IP.** `/api/market/context`
alone costs ~256 weight per cycle — and roughly **92% of that is public market data that is
byte-identical for every tenant.**

At today's shape that means:

| Profile | Tenants per egress IP |
|---|---|
| Farm profile (15-min cycle) | ~36 |
| Scalper profile (7 coins / 30s) | **1** |

Fetch the public leg **once** per cycle into Redis and per-tenant residual weight drops to
~30–50/min, moving the ceiling to ~25–40 tenants per IP. That single change is the difference
between **9 servers and 60** — about **$3,900/month** at 1000 tenants.

Buy IP addresses, not RAM. The workload is 100% memory-bound on compute (0.036% of a core per
idle tenant; ~3 cores total at 1000 tenants) and IP-bound on throughput.

---

## Architecture: four planes

Not the usual "shared web tier, per-tenant worker." That split doesn't apply here, because **all
trading logic lives inside Next.js route handlers** — sharing the web tier *is* full multi-tenancy.
So the split runs the other way: **share everything read-only, isolate everything that signs.**

1. **Control plane** (shared, one process) — replaces 1000 copies of `scheduler-worker.mjs`, a
   112-line file whose entire state is `let running = false`. Takes `pg_try_advisory_lock(tenant_id)`
   per cycle so split-brain is impossible. **Saves 60 GB** at 1000 tenants. ~1 day of work.
2. **Market-data plane** (shared + Redis) — the deduplication above. Highest-leverage component
   in the design.
3. **Tenant plane** (per-tenant container) — keep process isolation for anything that signs.
4. **Data plane** (shared Postgres, RLS on `tenant_id`) — see below.

### Schema-per-tenant has to go

Each tenant schema is **131–161 tables / 180–277 indexes**. At 1000 tenants that's ~161,000 tables
and ~360,000 catalog relations. **PostgREST cache-load failures are documented at ~67,000.** It
will not reach 1000 — it breaks somewhere in the low hundreds.

Replace with RLS + `tenant_id NOT NULL REFERENCES tenants(id) ON DELETE CASCADE` on every table.
Make that decision at migration time: it's what turns GDPR erasure into one line. Partition
telemetry by **time**, never by tenant, or you rebuild the catalog problem you just escaped.

### Why not full multi-tenancy

It saves **$692/mo — $0.69 per tenant** — in exchange for unwinding 332 runtime env vars, 121
module-level singletons, 65 `globalThis` sites, and putting 1000 customers' signing keys in one
heap. This codebase already had that failure at **n=6**: a family member merely *opening* the
scalper tab rewrote the owner's live position tracking. Process isolation is the backstop that made
that survivable. Do not sell it for $692/mo.

---

## Margins: three of four prices work

| Tier | Price | Cost | Gross margin |
|---|---|---|---|
| Paper | $0 | $2.19 | **undefined — broken** |
| Solo | $19 | $9.21 | 51.5% |
| Desk | $79 | $15.41 | 80.5% |
| Fund | $299 | $35.62 | 88.1% |

**The free Paper tier cannot be fixed by repricing, because its price is zero.** A free tenant
running an autonomous 15-minute cycle consumes *the same scarce egress-IP weight as a $299 Fund
tenant*. Fix it with a tier limit, not a discount — the recommended option is: Paper gets **no
autonomous loop**, only manual/backtest use.

### Fleet cost at 1000 tenants

| Architecture | Monthly |
|---|---|
| Naive (today's shape) | $10,812 |
| Container-per-tenant, always-on | $11,729 |
| **Recommended (4-plane)** | **$6,881** |
| Full multi-tenant | $6,189 (rejected — see above) |

100 tenants: $4,692/mo · 500: $5,681/mo · 1000: $6,881/mo

---

## What to buy, and when

**Phase 0 — before taking a single dollar**

| Item | Vendor | Monthly |
|---|---|---|
| Crypto-derivatives regulatory memo | fintech boutique | $1,040 (≈$25k one-time) |
| KMS envelope encryption (1 CMK + per-tenant DEKs) | AWS | $5 |
| Supabase PITR, 7-day | Supabase | $100 |
| Immutable order/decision audit log (WORM) | S3 Object Lock | $50 |
| Delaware C-Corp + registered agent | — | $40 |
| SaaS legal package (ToS, privacy, subscription) | counsel | $190 |

> Note the KMS anti-pattern: **one key per tenant is $1,000/mo for strictly worse blast radius.**
> One CMK + per-tenant data keys is 200× cheaper *and* safer.

**Phase 1 — fleet primitives** (~25 tenants): Managed Valkey $15, ops droplets $48,
Better Stack $59, Sentry $26, Supabase compute step-up.

**Phase 2 — first real capacity**: **OVH US RISE-S, 64 GB RAM, Ryzen 7, $77/mo** as the first
tenant box, plus **additional IPv4 addresses (~$32/mo)** — the actual scaling unit. Cloudflare Pro $20.

**Phase 3+**: HA load balancer $24, counsel retainer, dispute reserve.

**Contingent, do not pre-buy**: SOC 2 Type II $2,500/mo (only when a Fund customer demands it);
NFA CTA registration $4,167/mo (only if the Phase 0 memo says register).

### Vendor calls

- **OVH over Hetzner.** Hetzner T&C 8.3 prohibits crypto "mining, farming and plotting" with
  open-ended language their support reads broadly. An account lock takes **every tenant offline
  simultaneously** on a product where downtime is customer financial loss.
- **DigitalOcean stays** for the small, bursty ops plane ($24/box is noise) but **not** the tenant
  fleet — 4× the $/GB.
- **Not always-on Fly.** $5.92/machine/mo is 31% of Solo's gross and strictly negative for Paper.

---

## The regulatory gate is the highest-variance number in the plan

CFTC exemption **17 CFR 4.14(a)(9)** is unavailable to anyone "directing client accounts," and
(a)(10)'s **15-client cap is gone at 1000**. The standard non-customized-software carve-out does
not obviously fit an autonomous executing agent.

If the answer is *register*, the ~$4,167/mo compliance load pushes **Solo to 14.7% gross margin and
the $19 tier ceases to exist.**

Learning that after 1000 signups is unwindable. Learning it now costs ~$25k. **Commission the memo
before `/hosted` takes a dollar.**

---

## Two live defects this research surfaced

1. **`wallet-manager.ts` "encrypted" private keys with `Buffer.from(k).toString('base64')`** —
   an encoding, not a cipher. One `SELECT` was total fleet compromise. **Fixed**: real AES-256-GCM,
   scrypt-derived key, per-record salt+IV, auth tag verified. Legacy records still readable for
   migration but must be treated as leaked and rotated.

2. **`scheduler-state.json` holds `haltNewTrades` — currently `true`.** An operator-set trading
   halt lives on the filesystem. Containerize before moving that to Postgres and **a routine deploy
   silently resumes trading.** The real durable per-tenant state is ~11 KB across four JSON files;
   the 43 MB `data/` directory is mostly SQLite from the disarmed meme engine plus stale logs.

---

## Monitored invariant

Reframe from *"is the worker up?"* to **"does every open position have a resting reduce-only stop
on the exchange?"**

A crashed worker holding protected positions is a bounded loss that resolves itself. A crashed
worker holding a naked leveraged position is unbounded. That distinction is what makes a
single-operator on-call rotation possible at all — and why a standalone Guardian process (sharing
no code, no DB client and no deploy cadence with the trading worker) is a $24/mo line item that
does more for survivability than the entire monitoring stack.
