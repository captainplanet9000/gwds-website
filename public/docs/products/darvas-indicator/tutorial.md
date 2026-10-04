# Darvas Box Breakout Agent — practice tutorial

Release: 2.1.1-source.20260928

This is downloadable source software. Hosting, trading funds and external services are separate. Build and signal checks are not certification for unattended real-money execution. Complete venue and recovery validation for your installation. Some packaged agent INSTALL/manifest files retain the older word “candidate”. This guide is tied to the registered September 28 archive by checksum; publication does not certify venue performance.

## 1. Verify the installed module

Follow the install steps above, then run the export check from the dashboard root. Expected result: strategy export present. This checks loading only; it does not submit an order.

## 2. Prepare comparable inputs

Select 4h, 1d, 1h as supported by the manifest. Supply one completed candle series for one symbol, retaining timestamps, OHLCV, source and network. Multiple listed intervals do not mean automatic multi-timeframe fetching.

## 3. Run the strategy-specific exercise

Use the shipped defaults on completed 4h candles. Save the reported box top, bottom, age and volume ratio. Compare a neutral consolidation decision with a later breakout decision, without submitting an order. A period is a candle: 28 four-hour candles span 112 hours, not four weeks.

## 4. Interpret the result

Inspect boxes, currentBox or activeBox, and volumeRatio when present. Confirm stop < entry < target for a long and target < entry < stop for a short. Treat absent boxes and weak confirmation as information, not a reason to force an entry.

## 5. Validate the runtime separately

Confirm ownership, sizing, fees, entry fill, stop/target, modifications, exit and realized P&L on testnet. Include restart, partial fill, rejected cancellation and lost-response reconciliation. A signal test is not an execution test.
