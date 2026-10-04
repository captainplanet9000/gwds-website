# Sentiment Proxy Research Agent — practice tutorial

Release: 2.1.1-source.20260928

This is downloadable source software. Hosting, trading funds and external services are separate. Build and signal checks are not certification for unattended real-money execution. Complete venue and recovery validation for your installation. Some packaged agent INSTALL/manifest files retain the older word “candidate”. This guide is tied to the registered September 28 archive by checksum; publication does not certify venue performance.

## 1. Verify the installed module

Follow the install steps above, then run the export check from the dashboard root. Expected result: strategy export present. This checks loading only; it does not submit an order.

## 2. Prepare comparable inputs

Select 1h, 4h, 1d as supported by the manifest. Supply one completed candle series for one symbol, retaining timestamps, OHLCV, source and network. Multiple listed intervals do not mean automatic multi-timeframe fetching.

## 3. Run the strategy-specific exercise

Use completed 1h candles and defaults. Record the derived fear/greed score and its relationship to extremeFear=20 and extremeGreed=80. Compare a quieter sample with a large price/volume move. Label every saved result as proxy research.

## 4. Interpret the result

Inspect reasoning and the complete indicator object. Do not cite a fundingRate or openInterest field as an exchange-reported observation. If replacing a proxy with a real feed, define units, timestamps, failure behavior and tests before using it.

## 5. Validate the runtime separately

Confirm ownership, sizing, fees, entry fill, stop/target, modifications, exit and realized P&L on testnet. Include restart, partial fill, rejected cancellation and lost-response reconciliation. A signal test is not an execution test.
