# Sentiment Proxy Research

Version 2.1.1 — unpublished release candidate.

Funding, open interest, dominance and stablecoin-flow variables are proxies or simulations derived from candles. They are not measured external data. This strategy can emit trade signals and is not an automatic farm-wide coordinator.

## What is included

Readable src/strategy.ts, compiled CommonJS dist/strategy.js, manifest.json, installation instructions and the commercial source licence. This is a signal module, not an exchange connector or a standalone dashboard.

## Inputs and outputs

Provide time-ordered OHLCV candles with a millisecond timestamp and finite positive prices. Use completed candles at the configured interval. The module returns long, short or neutral, confidence, reasoning and indicator values; actionable signals include proposed entry/stop/target prices. The dashboard must validate and reconcile every order independently.

Declared intervals: 1h, 4h, 1d. The caller supplies one candle series; this does not imply automatic multi-timeframe data fetching.

## Exact default configuration

```json
{
  "fundingThreshold": 0.01,
  "oiChangePeriod": 24,
  "oiChangeThreshold": 20,
  "sentimentSmoothing": 7,
  "extremeFear": 20,
  "extremeGreed": 80,
  "volumeSpikeMultiplier": 3,
  "priceChangeThreshold": 5,
  "correlationPeriod": 30,
  "dominanceChangeThreshold": 2
}
```

Changing parameters changes behavior. Candle counts are not wall-clock durations. Neutral is a valid decision even when capital is available.

## Acceptance status

Offline strict compilation and synthetic signal contract checks are recorded in the parent validation.json. Runtime loading, clean customer installation and a complete managed exchange lifecycle remain required. Not approved for distribution or unattended trading.
