# Cival Core 2.1 candidate runbook

This describes preparation and acceptance, not a validated production release. Resolve the blockers in README.md before customer distribution or unattended operation.

## Installation and database

Use an empty dedicated Supabase project. This application calls Supabase Auth and REST endpoints in addition to SQL; plain PostgreSQL is not a substitute. Review `schema/001_core.sql` and the referenced-but-undefined table list. Complete migrations against actual call sites and verify row ownership before applying them. Never apply experimental migrations to the live customer database.

PowerShell, after a complete schema has been accepted:

```powershell
Copy-Item .env.example .env.local
npm ci
npx tsc --noEmit
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f schema/001_core.sql
npm run build
npm start
```

Linux/macOS use `cp` instead of `Copy-Item` and `psql "$DATABASE_URL" ...`. Configure `.env.local` before building. Missing Supabase settings can fail route evaluation during build. Keep the database connection string in the environment and protect shell history.

The candidate defaults to localhost:9005. `PORT` and `BIND_ADDRESS` configure its listener. Do not set a public listener until authentication, owner restrictions, HTTPS and the firewall are verified.

## Required acceptance matrix

Record evidence for each item; an API returning 200 is insufficient.

| Area | Required evidence |
| --- | --- |
| Build | Clean lockfile installation and strict TypeScript/build on supported systems |
| Authentication | Anonymous reads/writes rejected; wrong owner rejected; scheduler uses authenticated internal requests |
| Persistence | Agent/settings/trade changes survive restart; failures are visible rather than empty-success responses |
| Data | Symbol, network, account, candle interval and freshness match the configured source |
| Paper mode | Every alternate signer/connector refuses live execution; paper fills are labelled simulated |
| Testnet | Entry, fill, protection, adjustment, exit and realized P&L reconcile with the exchange |
| Recovery | Restart, partial fills, order rejection, stale data, lost connectivity and retry avoid duplicate orders |
| Controls | Pause only stops intended new entries; cancellation/closing scope is explicit; failed emergency actions are reported |
| Plugins | Manifest defaults match source; loader accepts exact artifact; per-agent parameters and ownership work |
| Backup | Encrypted backup restores to an isolated compatible runtime |

An exchange API trading key is different from the account's master key. Never request or store a customer's seed phrase to install a software product. Do not enable mainnet as a workaround for testnet failures.

## Add a strategy

Read the module's INSTALL.md and manifest. Place its manifest directly in the specified `plugins/<module>` directory and ensure the compiled entryPoint exists. Back up first, pause new entries and reconcile existing positions before changes. Restart, inspect loader errors, select the strategy and validate decisions on the intended candle data. Available funds alone are not a trade signal.

Do not run two independent engines against the same positions during upgrades. Removing a plugin does not close its exchange positions.

## Maintain and recover

Monitor health, last successful cycle, data age, rejected orders, reconciliation gaps, database backups and disk usage. Treat missing telemetry as an unknown condition, not proof of a healthy system. Keep the prior immutable ZIP, lockfile, configuration and database backup before upgrading.

For rollback: stop the new runtime, reconcile exchange orders and positions, select a compatible application/schema pair, restore in isolation and verify ownership and protection before resuming. Database restore cannot reverse an exchange fill or on-chain transfer.

## Troubleshooting

- Build fails: retain the complete diagnostics and release version. Do not use ignoreBuildErrors.
- Supabase URL missing: configure the exact Supabase URL/key pair before build and restart. Do not expose the service-role key through NEXT_PUBLIC variables.
- Agent missing: inspect plugin directory nesting, manifest entryPoint, loader errors and compatibility.
- No trades: inspect the latest strategy decision, data age, network, balance, existing position and risk rejection. Do not force entries merely to prove activity.
- Wrong balances/positions: compare the same account and network with the exchange; investigate reconciliation before placing another order.
- Emergency stop partly fails: retain the error details and inspect remaining exchange orders/positions. A successful HTTP request does not mean all exchange actions succeeded.

Use https://www.civalsystems.com/contact for support with redacted errors and product/version information.
