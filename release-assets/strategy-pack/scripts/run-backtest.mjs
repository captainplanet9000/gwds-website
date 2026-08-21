import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { checkStrategyExit, executeStrategy } from '../src/strategy-engine.ts';

const STRATEGIES = [
  ['darvas_box', 'Darvas Box'],
  ['williams_fractal', 'Williams Fractal'],
  ['multi_strategy', 'Multi-Strategy Consensus'],
  ['elliott_wave', 'Elliott Wave'],
  ['williams_alligator', 'Williams Alligator'],
  ['heikin_ashi', 'Heikin Ashi'],
  ['renko_breakout', 'Renko Breakout'],
];

const INTERVAL_MS = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
  '4h': 14_400_000,
  '1d': 86_400_000,
};

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const options = {
  coins: argument('coins', 'BTC,ETH').split(',').map((coin) => coin.trim()).filter(Boolean),
  interval: argument('interval', '1h'),
  days: Number(argument('days', '30')),
  confidence: Number(argument('confidence', '60')),
  feeBps: Number(argument('fee-bps', '4.5')),
  slippageBps: Number(argument('slippage-bps', '2.5')),
  end: new Date(argument('end', new Date().toISOString())).getTime(),
  offline: process.argv.includes('--offline'),
  strategies: argument('strategies', '').split(',').map((value) => value.trim()).filter(Boolean),
};

if (!INTERVAL_MS[options.interval]) throw new Error(`Unsupported interval: ${options.interval}`);
if (!Number.isFinite(options.end)) throw new Error('Invalid --end timestamp');
if (!Number.isFinite(options.days) || options.days < 10 || options.days > 365) throw new Error('--days must be between 10 and 365');

const evidenceDirectory = path.resolve('evidence');
const dataDirectory = path.join(evidenceDirectory, 'data');
const generatedDirectory = path.join(evidenceDirectory, 'generated');
await mkdir(dataDirectory, { recursive: true });
await mkdir(generatedDirectory, { recursive: true });

function normalizeCandles(payload) {
  return payload
    .map((candle) => ({
      timestamp: Number(candle.t ?? candle.timestamp),
      open: Number(candle.o ?? candle.open),
      high: Number(candle.h ?? candle.high),
      low: Number(candle.l ?? candle.low),
      close: Number(candle.c ?? candle.close),
      price: Number(candle.c ?? candle.close),
      volume: Number(candle.v ?? candle.volume),
    }))
    .filter((candle) => Object.values(candle).every(Number.isFinite))
    .sort((a, b) => a.timestamp - b.timestamp);
}

async function loadCandles(coin) {
  const snapshotPath = path.join(dataDirectory, `${coin}-${options.interval}.json`);
  if (options.offline) {
    return normalizeCandles(JSON.parse(await readFile(snapshotPath, 'utf8')));
  }

  const startTime = options.end - options.days * INTERVAL_MS['1d'];
  const response = await fetch('https://api.hyperliquid.xyz/info', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'candleSnapshot',
      req: { coin, interval: options.interval, startTime, endTime: options.end },
    }),
  });
  if (!response.ok) throw new Error(`Hyperliquid candle request failed for ${coin}: ${response.status}`);
  const candles = normalizeCandles(await response.json());
  if (candles.length < 260) throw new Error(`Only ${candles.length} valid ${coin} candles returned; at least 260 are required`);
  await writeFile(snapshotPath, `${JSON.stringify(candles, null, 2)}\n`);
  return candles;
}

function currentReturn(position, price) {
  return position.side === 'long' ? price / position.entryPrice - 1 : position.entryPrice / price - 1;
}

function runStrategy(strategyId, candles) {
  const executionCost = (options.feeBps + options.slippageBps) / 10_000;
  const roundTripCost = executionCost * 2;
  let position = null;
  let equity = 1;
  let equityPeak = 1;
  let maxDrawdown = 0;
  let errors = 0;
  const trades = [];

  const closePosition = (exitPrice, exitTimestamp, reason) => {
    const grossReturn = currentReturn(position, exitPrice);
    const netReturn = grossReturn - roundTripCost;
    equity *= Math.max(0, 1 + netReturn);
    equityPeak = Math.max(equityPeak, equity);
    maxDrawdown = Math.max(maxDrawdown, (equityPeak - equity) / equityPeak);
    trades.push({
      side: position.side,
      entryTimestamp: position.entryTimestamp,
      exitTimestamp,
      entryPrice: position.entryPrice,
      exitPrice,
      grossReturn,
      netReturn,
      reason,
    });
    position = null;
  };

  for (let index = 220; index < candles.length - 1; index += 1) {
    // A bounded window matches the live dispatcher inputs and prevents the
    // pattern routines from growing work with the full historical sample.
    const window = candles.slice(Math.max(0, index - 219), index + 1);
    const next = candles[index + 1];
    let result;
    try {
      result = executeStrategy(strategyId, window);
    } catch {
      errors += 1;
      continue;
    }

    if (position) {
      const pnlPercent = currentReturn(position, window.at(-1).close) * 100;
      let exit;
      try {
        exit = checkStrategyExit(strategyId, window, {
          side: position.side,
          entryPrice: position.entryPrice,
          currentPnlPercent: pnlPercent,
        });
      } catch {
        errors += 1;
      }
      const oppositeSignal =
        result.confidence >= options.confidence &&
        ((position.side === 'long' && result.signal === 'sell') ||
          (position.side === 'short' && result.signal === 'buy'));
      if (exit?.shouldExit || oppositeSignal) {
        closePosition(next.open, next.timestamp, exit?.shouldExit ? exit.exitType : 'opposite_signal');
      }
    }

    if (!position && result.confidence >= options.confidence && result.signal !== 'hold') {
      position = {
        side: result.signal === 'buy' ? 'long' : 'short',
        entryPrice: next.open,
        entryTimestamp: next.timestamp,
      };
    }
  }

  if (position) {
    const last = candles.at(-1);
    closePosition(last.close, last.timestamp, 'end_of_sample');
  }

  const wins = trades.filter((trade) => trade.netReturn > 0);
  const losses = trades.filter((trade) => trade.netReturn <= 0);
  const grossProfit = wins.reduce((sum, trade) => sum + trade.netReturn, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.netReturn, 0));
  return {
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: trades.length ? wins.length / trades.length : null,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? null : 0,
    netReturn: equity - 1,
    maxDrawdown,
    evaluationErrors: errors,
    tradeLog: trades,
  };
}

const datasets = {};
for (const coin of options.coins) datasets[coin] = await loadCandles(coin);

const results = [];
for (const [strategyId, strategyName] of STRATEGIES.filter(([strategyId]) => !options.strategies.length || options.strategies.includes(strategyId))) {
  console.log(`Evaluating ${strategyName}...`);
  for (const [coin, candles] of Object.entries(datasets)) {
    const metrics = runStrategy(strategyId, candles);
    const serialized = JSON.stringify(candles);
    results.push({
      strategyId,
      strategyName,
      coin,
      interval: options.interval,
      candleCount: candles.length,
      sampleStart: new Date(candles[0].timestamp).toISOString(),
      sampleEnd: new Date(candles.at(-1).timestamp).toISOString(),
      candleSha256: createHash('sha256').update(serialized).digest('hex'),
      ...metrics,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source: 'Hyperliquid public candleSnapshot API or the included immutable snapshots',
  methodology: {
    signalTiming: 'Signal evaluated at candle close; fill modeled at the next candle open.',
    positionModel: 'One full-notional long or short position per strategy and market; no leverage.',
    entryThreshold: options.confidence,
    feeBpsPerSide: options.feeBps,
    slippageBpsPerSide: options.slippageBps,
    exits: 'Strategy invalidation or opposite qualifying signal; remaining position closes at sample end.',
    caveats: [
      'No funding, latency, spread variation, market impact, liquidation, tax, or infrastructure failure is modeled.',
      'Partial-exit and tighten-stop suggestions are not modeled.',
      'Historical simulation does not predict live results.',
    ],
  },
  results,
};

await writeFile(path.join(generatedDirectory, 'results.json'), `${JSON.stringify(report, null, 2)}\n`);

const csvHeader = ['strategy_id', 'strategy_name', 'coin', 'interval', 'candles', 'trades', 'wins', 'losses', 'win_rate', 'profit_factor', 'net_return', 'max_drawdown', 'errors'];
const csvRows = results.map((result) => [
  result.strategyId,
  result.strategyName,
  result.coin,
  result.interval,
  result.candleCount,
  result.trades,
  result.wins,
  result.losses,
  result.winRate ?? '',
  result.profitFactor ?? '',
  result.netReturn,
  result.maxDrawdown,
  result.evaluationErrors,
].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','));
await writeFile(path.join(generatedDirectory, 'results.csv'), `${[csvHeader.join(','), ...csvRows].join('\n')}\n`);

const percent = (value) => value === null ? 'n/a' : `${(value * 100).toFixed(2)}%`;
const decimal = (value) => value === null ? 'n/a' : value.toFixed(2);
const markdown = [
  '# Seven-Strategy Evidence Dossier',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '> These are historical simulations with explicit simplifications. They are not forecasts, guarantees, financial advice, or evidence that live trading will be profitable.',
  '',
  `Signals are evaluated at candle close and filled at the next open. Costs are ${options.feeBps} bps fee plus ${options.slippageBps} bps slippage per side. No leverage is modeled.`,
  '',
  '| Strategy | Market | Trades | Win rate | Profit factor | Net return | Max drawdown | Errors |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...results.map((result) => `| ${result.strategyName} | ${result.coin} ${result.interval} | ${result.trades} | ${percent(result.winRate)} | ${decimal(result.profitFactor)} | ${percent(result.netReturn)} | ${percent(result.maxDrawdown)} | ${result.evaluationErrors} |`),
  '',
  'See `results.json` for assumptions, dataset hashes, and every modeled trade. Reproduce this exact dossier with `npm run verify:evidence` or fetch a fresh sample with `npm run backtest:fresh`.',
  '',
];
await writeFile(path.join(generatedDirectory, 'DOSSIER.md'), markdown.join('\n'));

console.log(`Wrote ${results.length} strategy-market evaluations to ${generatedDirectory}`);
