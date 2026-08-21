# Cival Seven-Strategy Research Pack 1.0.0

This package contains the seven strategy paths that are actually wired into the compatible Cival dispatcher:

- Darvas Box
- Williams Fractal
- Multi-Strategy Consensus
- Elliott Wave
- Williams Alligator
- Heikin Ashi
- Renko Breakout

It includes the strategy and technical-analysis TypeScript source, an offline-reproducible backtest harness, immutable market-data snapshots, machine-readable results, and a plain-language evidence dossier.

## Run the included evidence

Node.js 22 or newer is required. No install is necessary.

```bash
npm run verify:evidence
```

To request a fresh public Hyperliquid sample:

```bash
npm run backtest:fresh
```

Fresh results change with the selected market window. Use the included snapshots when you need to reproduce the shipped dossier exactly.

## Integrate with Core

Copy `src/strategy-engine.ts` and `src/technical-analysis.ts` into the compatible Cival `src/lib/agents/` directory, then use `executeStrategy(strategyId, candles)` through the existing farm dispatcher. Back up customized files first and review the release manifest before replacing anything.

## Important limitation

The compatible Core release contains related dispatcher code. The value of this pack is the isolated, versioned strategy source and its reproducible research/evidence workflow—not exclusive access to a hidden profit system.

Historical simulations are not forecasts. Live trading adds funding, latency, spreads, market impact, liquidation, infrastructure failure, and other risks that this harness does not model. This software is not financial advice.
