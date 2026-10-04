# Bollinger Mean Reversion Agent — practice tutorial

Release: 2.1.1-source.20260928

This is downloadable source software. Hosting, trading funds and external services are separate. Build and signal checks are not certification for unattended real-money execution. Complete venue and recovery validation for your installation. Some packaged agent INSTALL/manifest files retain the older word “candidate”. This guide is tied to the registered September 28 archive by checksum; publication does not certify venue performance.

## 1. Verify the installed module

Follow the install steps above, then run the export check from the dashboard root. Expected result: strategy export present. This checks loading only; it does not submit an order.

## 2. Prepare comparable inputs

Select 15m, 1h, 4h as supported by the manifest. Supply one completed candle series for one symbol, retaining timestamps, OHLCV, source and network. Multiple listed intervals do not mean automatic multi-timeframe fetching.

## 3. Run the strategy-specific exercise

Use completed 1h candles, bbPeriod=20, bbStdDev=2 and takeProfitTarget="middle". Compare a ranging sample with a persistent move along a band. Record the RSI, band position and reason for the returned decision.

## 4. Interpret the result

A touch of the lower band is not automatically a buy. Read the regime and confirmation checks. bandwidthThreshold=5 is expressed in percentage points in the source calculation. Compare target choice only in a separate run.

## 5. Validate the runtime separately

Confirm ownership, sizing, fees, entry fill, stop/target, modifications, exit and realized P&L on testnet. Include restart, partial fill, rejected cancellation and lost-response reconciliation. A signal test is not an execution test.
