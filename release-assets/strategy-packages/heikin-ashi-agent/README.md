# Heikin Ashi Trend Following

Version 2.1.1 — unpublished release candidate.

Inspect the source assumptions and validate on your intended instruments; synthetic tests do not establish performance.

## What is included

Readable src/strategy.ts, compiled CommonJS dist/strategy.js, manifest.json, installation instructions and the commercial source licence. This is a signal module, not an exchange connector or a standalone dashboard.

## Inputs and outputs

Provide time-ordered OHLCV candles with a millisecond timestamp and finite positive prices. Use completed candles at the configured interval. The module returns long, short or neutral, confidence, reasoning and indicator values; actionable signals include proposed entry/stop/target prices. The dashboard must validate and reconcile every order independently.

Declared intervals: 15m, 1h, 4h, 1d. The caller supplies one candle series; this does not imply automatic multi-timeframe data fetching.

## Exact default configuration

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

Changing parameters changes behavior. Candle counts are not wall-clock durations. Neutral is a valid decision even when capital is available.

## Acceptance status

Offline strict compilation and synthetic signal contract checks are recorded in the parent validation.json. Runtime loading, clean customer installation and a complete managed exchange lifecycle remain required. Not approved for distribution or unattended trading.
