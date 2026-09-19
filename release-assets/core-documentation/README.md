# Cival Core 2.1 — self-hosted source edition

**Release candidate: not approved for customer distribution.** This source package is distinct from the managed Cival customer dashboard and the browser-only Core 2.0 template.

## Current acceptance status

The current repair candidate has 74 TypeScript diagnostics as of 19 September 2026. Its shipped schema explicitly lists 23 referenced tables without definitions, including order/position tables. Owner authorization, scheduler authentication, paper-mode enforcement and complete exchange order lifecycle acceptance remain unresolved. Do not bypass compilation or authentication checks to run it with funds.

The previous README described a larger v10 runtime and contained unverified performance figures. Those figures do not describe this archive and are not supported performance evidence.

## Included source

- Next.js/TypeScript dashboard application, API routes and Supabase integration.
- Agent, farm, trade, backtest, risk, analytics and settings surfaces.
- Darvas strategy plugin under `plugins/`.
- Database schema, environment example and commercial source licence.

Source presence is not proof that a feature is complete. Read RUNBOOK.md for required acceptance work. The optional strategy products are modules for a compatible runtime, not standalone applications.

## Requirements

- A Node environment compatible with `package.json`. Current source declares Node >=20; a supported release must pin and test its intended version.
- A dedicated Supabase project providing Auth, REST and PostgreSQL. Plain PostgreSQL alone is insufficient.
- A PostgreSQL command-line client for schema installation.
- A private application host for any remote deployment, authenticated access, HTTPS, monitoring and tested backups.
- Customer-owned service credentials configured privately. Hosting, exchange funds and external service charges are not included.

## Prepare an isolated installation

1. Extract into a new directory. Preserve the ZIP and checksum.
2. Copy `.env.example` to `.env.local`; keep that file private and out of source control.
3. Configure the Supabase URL and anon key, server-only service-role key and required security secrets. Configure `ACCOUNT_OWNER_EMAIL`, `REQUIRE_AUTH=1`, `ADMIN_TOKEN` and the intended network where supported by the candidate.
4. Keep `TRADING_MODE=paper`. Do not supply live trading credentials during installation validation. Every signing path still needs acceptance; the mode label alone is not proof of simulation.
5. Use `npm ci` with the included candidate lockfile, then `npx tsc --noEmit` and `npm run build`. Stop and retain errors if either fails.
6. Apply a completed, reviewed schema to an empty dedicated database only. The current schema is incomplete; do not use it as evidence of a successful installation.
7. Once all release checks pass, `npm start` runs the candidate on localhost port 9005 by default. Remote exposure requires an authenticated HTTPS proxy and reviewed network rules.

## Documentation and support

The online version guide is https://www.civalsystems.com/docs/setup. Include product/version, Node version, operating system, failed step and redacted errors in a support request. Never send environment files, passwords, session tokens, private keys or seed phrases.

No returns, holding times, win rates or daily income are promised. Follow LICENSE.md for use and redistribution terms.
