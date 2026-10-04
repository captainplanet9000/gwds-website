# Heikin Ashi Trend Agent — documentation and tutorials

Guide updated: 2026-10-03
Archive release: 2.1.1-source.20260928
SHA-256: 048da4c4d79aeb57cb45d083cb312cc8de93bb9e41fe0a8858c63865f6ba9692

Recognize smoothed trends and distinguish transformed candles from tradable prices.

## Scope
This is downloadable source software. Hosting, trading funds and external services are separate. Build and signal checks are not certification for unattended real-money execution. Complete venue and recovery validation for your installation. Some packaged agent INSTALL/manifest files retain the older word “candidate”. This guide is tied to the registered September 28 archive by checksum; publication does not certify venue performance.

Smoothing may delay entries and reversals. A manifest riskProfile label is descriptive, not a tested loss limit. stopLossATR=2 is a distance multiplier, not a 2% portfolio loss cap.

## Requirements
- A working Core/Trader dashboard in the manifest range >=2.1.0 <2.2.0. The browser-only Core 2.0 template is incompatible.
- The module manifest declares Node >=20; the complete shipped dashboard requires Node 22.3 or newer.
- Completed, time-ordered OHLCV candles with millisecond timestamps, finite positive prices and valid volume, supplied by your runtime.
- A backup and an isolated paper/research environment. The strategy computes signals; the dashboard supplies market data, order handling and risk controls.

## Purchase and access
1. Sign in to the account used at checkout. Open Account and locate the confirmed order. If payment is processing, wait for fulfillment rather than buying again.
2. Generate a fresh product Download link. Save the ZIP, receipt, release version and checksum. Expired links can be regenerated from the account.
3. Compare the archive SHA-256 with the release recorded below. Extract into a new directory; retain the original archive for rollback.
4. Open README.md, RUNBOOK.md or INSTALL.md, manifest.json where included, and LICENSE.md before changing an installation.

## Install
1. Check whether you already own the strategy: all six are included in Trader; Darvas is also included in Core.
2. Back up the database, settings and plugins. Pause new entries and reconcile positions before changing the installation.
3. Extract the module so manifest.json sits directly at plugins/heikin-ashi-agent/manifest.json. Check plugins/heikin-ashi-agent/dist/strategy.js exists; do not nest the product directory twice.
4. Restart the dashboard and inspect loader errors. Select strategy ID heikin-ashi, a supported interval and the intended market. Start paused with no funds allocated.
5. Use the manifest defaults for the first comparison. Inspect decisions and then independently validate the runtime trade lifecycle before any unattended execution.

### Commands (dashboard root)
```sh
node -e "const p=require('./plugins/heikin-ashi-agent/dist/strategy.js'); if(!p.strategy) throw Error('strategy export missing'); console.log('strategy export present')"
```

## How it works
The module transforms OHLC candles into Heikin Ashi values, checks consecutive direction and wick/body characteristics, and can require EMA confirmation. Proposed stops use ATR multiples. No ADX filter is shipped.

## Default configuration
```json
{
  "smoothingPeriod": 1,
  "minConsecutiveCandles": 3,
  "wickFilter": true,
  "emaConfirmation": true,
  "emaPeriod": 20,
  "trendStrengthThreshold": 5,
  "dojiThreshold": 0.5,
  "minBodySize": 0.3,
  "stopLossATR": 2,
  "takeProfitRatio": 2.5
}
```

| Setting | Default | Meaning |
| --- | --- | --- |
| smoothingPeriod | 1 | Apply HA transformation N times |
| minConsecutiveCandles | 3 | Min consecutive same-color candles for trend |
| wickFilter | true | Require wickless candles for strong trend |
| emaConfirmation | true | Confirm with EMA crossover |
| emaPeriod | 20 | EMA period for confirmation |
| trendStrengthThreshold | 5 | Min consecutive candles for high confidence |
| dojiThreshold | 0.5 | Max body size % to be doji |
| minBodySize | 0.3 | Min body size % for valid signal |
| stopLossATR | 2 | Stop loss in ATR multiples |
| takeProfitRatio | 2.5 | R:R ratio |

## Step-by-step tutorial

### Verify the installed module
Follow the install steps above, then run the export check from the dashboard root. Expected result: strategy export present. This checks loading only; it does not submit an order.

### Prepare comparable inputs
Select 15m, 1h, 4h, 1d as supported by the manifest. Supply one completed candle series for one symbol, retaining timestamps, OHLCV, source and network. Multiple listed intervals do not mean automatic multi-timeframe fetching.

### Run the strategy-specific exercise
Use completed 1h candles with smoothingPeriod=1, minConsecutiveCandles=3 and emaConfirmation=true. Review a sustained sequence and then a mixed or doji sequence. Record direction, reasoning and indicators without placing an order.

### Interpret the result
Compare transformed candles with the raw close; Heikin Ashi prices are analytical values, not executable quotes. Review the EMA context and proposed stop/target. Change only smoothingPeriod in a separate test and compare the resulting lag.

### Validate the runtime separately
Confirm ownership, sizing, fees, entry fill, stop/target, modifications, exit and realized P&L on testnet. Include restart, partial fill, rejected cancellation and lost-response reconciliation. A signal test is not an execution test.

## Acceptance checklist
- [ ] Archive checksum and version match the guide.
- [ ] Install completes without suppressing errors; the module loads from its declared path.
- [ ] Correct owner, market, network and candle interval are recorded.
- [ ] Decision timestamp, direction, reasoning and parameters are captured; neutral is accepted.
- [ ] Settings and ownership persist after restart; backup restore is tested in isolation.
- [ ] Before live execution: entry, fill, protection, modification, exit, fees and P&L reconcile; partial fills, cancellation failure and lost responses are tested.

## Maintain and customize
- Keep a copy of the immutable ZIP, lockfile, private configuration and a database backup before an update. Store encrypted backups separately and prove a restore in an isolated compatible instance.
- Pause new entries and reconcile existing venue orders and positions before maintenance. Pausing entries is not the same as closing positions. Removing a plugin does not close exchange positions.
- Monitor the last successful cycle, data age, rejected orders, protection status, reconciliation gaps, database backups and disk space. Missing telemetry is an unknown state.
- For rollback, stop the new runtime, reconcile the venue, restore a compatible application/schema pair in isolation and verify ownership and protection before resuming. A database restore cannot reverse a trade or transfer.
- Customize readable source in a separate branch. Preserve the original defaults, rebuild any changed compiled module, and test the same inputs before and after. Follow LICENSE.md; source ownership does not imply unrestricted redistribution.

## Troubleshooting

### Payment confirmed but download missing
Check order status in Account and contact support with the order reference if fulfillment is delayed. Do not make another purchase to repair access.

### Download link expired
Generate a fresh link from the purchasing account. The documentation downloads are public; the paid software archive remains entitlement-protected.

### Strategy absent from the selector
Confirm manifest.json is directly inside the manifest installPath, the entryPoint exists, compatibility matches and the loader has no errors. Restart after installation; do not add another nesting level.

### No trade despite available capital
Inspect the latest decision, candle history and freshness, symbol, interval, network, existing positions and risk rejection. Neutral is a valid result.

### Build or database initialization fails
Keep the exact failed command and redacted diagnostic. Check Node, psql, Supabase settings and owner verification. Do not bypass types, authentication or schema integrity checks.

### Balances disagree or an order outcome is unknown
Compare the same account and network at the venue, including fills, fees, margin and open orders. Reconcile before retrying; a lost response does not mean the order failed.

## Support
Use https://www.civalsystems.com/contact with your order reference, product/version, OS, Node version, failed step and redacted error. Do not send secrets or environment files. For refund requests use https://www.civalsystems.com/refund-request and read the current refund policy.

## Online guide and supporting lessons
https://www.civalsystems.com/docs/products/heikin-ashi-agent
Video lessons show the broader demo interface; the version-specific written tutorial above is authoritative for the shipped source package.

## Source references
- heikin-ashi-agent/INSTALL.md
- heikin-ashi-agent/LICENSE.md
- heikin-ashi-agent/README.md
- heikin-ashi-agent/dist/strategy.js
- heikin-ashi-agent/manifest.json
- heikin-ashi-agent/src/strategy.ts
