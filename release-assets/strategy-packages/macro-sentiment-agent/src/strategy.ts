/**
 * Macro & On-Chain Sentiment Strategy
 * 
 * Analyzes macro market conditions and on-chain metrics to identify sentiment extremes
 * and structural market changes. This strategy looks beyond price action to understand
 * the underlying forces driving markets.
 * 
 * Key Metrics:
 * - Funding rates: Perpetual swap funding (positive = longs pay shorts, negative = shorts pay longs)
 * - Open Interest: Total outstanding derivative positions
 * - Long/Short ratio: Retail sentiment from exchange data
 * - Fear & Greed Index: Market sentiment composite (0-100)
 * - Bitcoin dominance: BTC market cap / total crypto market cap
 * - Liquidation cascades: Large forced position closures
 * - Stablecoin flows: Money moving to/from exchanges
 * 
 * Since we don't have real on-chain data feeds in this implementation,
 * we'll use price-derived proxies and demonstrate the analytical framework.
 * 
 * @author GWDS
 * @version 2.1.1
 */

export interface StrategyConfig {
  fundingThreshold: number;         // Extreme funding rate % (default: 0.01 = 1% daily)
  oiChangePeriod: number;           // Periods to measure OI change (default: 24)
  oiChangeThreshold: number;        // Significant OI change % (default: 20%)
  sentimentSmoothing: number;       // Periods for sentiment MA (default: 7)
  extremeFear: number;              // Fear & Greed extreme fear threshold (default: 20)
  extremeGreed: number;             // Fear & Greed extreme greed threshold (default: 80)
  volumeSpikeMultiplier: number;    // Volume spike threshold (default: 3.0)
  priceChangeThreshold: number;     // Significant price move % (default: 5%)
  correlationPeriod: number;        // Periods for correlation calc (default: 30)
  dominanceChangeThreshold: number; // BTC dominance change % (default: 2%)
}

export interface StrategySignal {
  direction: 'long' | 'short' | 'neutral';
  confidence: number;
  reasoning: string;
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  indicators: Record<string, any>;
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface SentimentData {
  fundingRate: number;              // Estimated from price momentum
  openInterest: number;             // Estimated from volume
  oiChange: number;                 // % change in OI
  longShortRatio: number;           // Estimated from candle bodies
  fearGreedIndex: number;           // Derived sentiment score
  btcDominance: number;             // Simulated (would be real data)
  liquidationRisk: number;          // Estimated from volatility
  stablecoinFlow: number;           // Estimated from volume trends
}

/**
 * Estimate funding rate from price momentum
 * Real implementation would fetch from exchange API
 */
function estimateFundingRate(candles: Candle[], period: number): number {
  const recentCandles = candles.slice(-period);
  
  // Proxy: sustained upward momentum = positive funding (longs paying shorts)
  let momentum = 0;
  for (const candle of recentCandles) {
    const change = (candle.close - candle.open) / candle.open;
    momentum += change;
  }
  
  // Normalize to daily rate estimate
  const avgMomentum = momentum / period;
  return avgMomentum * 10; // Amplify to simulate funding rate scale
}

/**
 * Estimate open interest from volume trends
 * Real implementation would fetch from exchange API
 */
function estimateOpenInterest(candles: Candle[], period: number): number {
  const recentCandles = candles.slice(-period);
  const totalVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0);
  
  // Proxy: cumulative volume as OI estimate
  return totalVolume;
}

/**
 * Calculate OI change percentage
 */
function calculateOIChange(candles: Candle[], period: number): number {
  const currentOI = estimateOpenInterest(candles, period);
  const previousOI = estimateOpenInterest(candles.slice(0, -period), period);
  
  if (previousOI === 0) return 0;
  return ((currentOI - previousOI) / previousOI) * 100;
}

/**
 * Estimate long/short ratio from candle body directions
 * Real implementation would fetch from exchange API
 */
function estimateLongShortRatio(candles: Candle[], period: number): number {
  const recentCandles = candles.slice(-period);
  
  let bullishVolume = 0;
  let bearishVolume = 0;
  
  for (const candle of recentCandles) {
    if (candle.close > candle.open) {
      bullishVolume += candle.volume;
    } else {
      bearishVolume += candle.volume;
    }
  }
  
  if (bearishVolume === 0) return 10; // Max ratio
  return bullishVolume / bearishVolume;
}

/**
 * Calculate Fear & Greed Index proxy
 * Real implementation would fetch from Alternative.me API
 * 
 * Our proxy uses:
 * - Price momentum (30%)
 * - Volatility (20%)
 * - Volume (20%)
 * - Long/short ratio (30%)
 */
function calculateFearGreedIndex(candles: Candle[], period: number): number {
  const recentCandles = candles.slice(-period);
  
  // 1. Price momentum component
  const priceChange = (recentCandles[recentCandles.length - 1].close - recentCandles[0].close) / recentCandles[0].close;
  const momentumScore = Math.min(100, Math.max(0, 50 + (priceChange * 500)));
  
  // 2. Volatility component (inverse: high vol = fear)
  const prices = recentCandles.map(c => c.close);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance) / avgPrice;
  const volatilityScore = Math.min(100, Math.max(0, 100 - (volatility * 1000)));
  
  // 3. Volume component (high volume can indicate greed)
  const avgVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0) / recentCandles.length;
  const currentVolume = recentCandles[recentCandles.length - 1].volume;
  const volumeRatio = currentVolume / avgVolume;
  const volumeScore = Math.min(100, Math.max(0, 50 + ((volumeRatio - 1) * 50)));
  
  // 4. Long/short ratio component
  const lsRatio = estimateLongShortRatio(candles, period);
  const lsScore = Math.min(100, Math.max(0, 50 + ((lsRatio - 1) * 25)));
  
  // Weighted average
  const fearGreed = (momentumScore * 0.3) + (volatilityScore * 0.2) + (volumeScore * 0.2) + (lsScore * 0.3);
  
  return fearGreed;
}

/**
 * Detect liquidation cascade from rapid price moves with volume spikes
 */
function detectLiquidationCascade(candles: Candle[], volumeMultiplier: number, priceThreshold: number): boolean {
  if (candles.length < 5) return false;
  
  const currentCandle = candles[candles.length - 1];
  const recentCandles = candles.slice(-20);
  const avgVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0) / 20;
  
  // Volume spike
  const volumeSpike = currentCandle.volume >= avgVolume * volumeMultiplier;
  
  // Large price move
  const priceMove = Math.abs((currentCandle.close - currentCandle.open) / currentCandle.open) * 100;
  const bigMove = priceMove >= priceThreshold;
  
  // Long wick (liquidations get hunted)
  const bodySize = Math.abs(currentCandle.close - currentCandle.open);
  const totalRange = currentCandle.high - currentCandle.low;
  const hasLongWick = bodySize < totalRange * 0.5;
  
  return volumeSpike && bigMove && hasLongWick;
}

/**
 * Estimate stablecoin flow from volume trends
 * Real implementation would track on-chain stablecoin transfers
 */
function estimateStablecoinFlow(candles: Candle[], period: number): number {
  const recentVolume = candles.slice(-period).reduce((sum, c) => sum + c.volume, 0) / period;
  const olderVolume = candles.slice(-period * 2, -period).reduce((sum, c) => sum + c.volume, 0) / period;
  
  if (olderVolume === 0) return 0;
  
  // Increasing volume = inflows, decreasing = outflows
  return ((recentVolume - olderVolume) / olderVolume) * 100;
}

/**
 * Simulate BTC dominance
 * Real implementation would fetch from CoinGecko/CMC
 */
function simulateBTCDominance(candles: Candle[]): number {
  // Proxy: use price trend to simulate dominance changes
  // Stable/rising price = rising dominance, falling = alt season
  const recentCandles = candles.slice(-30);
  const priceChange = (recentCandles[recentCandles.length - 1].close - recentCandles[0].close) / recentCandles[0].close;
  
  // Base dominance around 50%, adjust with price momentum
  return Math.min(70, Math.max(30, 50 + (priceChange * 100)));
}

/**
 * Gather all sentiment data
 */
function gatherSentimentData(candles: Candle[], config: StrategyConfig): SentimentData {
  return {
    fundingRate: estimateFundingRate(candles, config.sentimentSmoothing),
    openInterest: estimateOpenInterest(candles, config.oiChangePeriod),
    oiChange: calculateOIChange(candles, config.oiChangePeriod),
    longShortRatio: estimateLongShortRatio(candles, config.sentimentSmoothing),
    fearGreedIndex: calculateFearGreedIndex(candles, config.sentimentSmoothing),
    btcDominance: simulateBTCDominance(candles),
    liquidationRisk: detectLiquidationCascade(candles, config.volumeSpikeMultiplier, config.priceChangeThreshold) ? 1 : 0,
    stablecoinFlow: estimateStablecoinFlow(candles, config.oiChangePeriod)
  };
}

export const strategy = {
  name: 'Macro & On-Chain Sentiment',
  version: '2.1.1',
  description: 'Macro sentiment analysis using funding rates, open interest, long/short ratios, Fear & Greed Index, BTC dominance, liquidation detection, and stablecoin flows. Identifies sentiment extremes and structural shifts for contrarian entries.',
  author: 'GWDS',
  timeframes: ['1h', '4h', '1d'],
  
  defaultConfig: {
    fundingThreshold: 0.01,
    oiChangePeriod: 24,
    oiChangeThreshold: 20,
    sentimentSmoothing: 7,
    extremeFear: 20,
    extremeGreed: 80,
    volumeSpikeMultiplier: 3.0,
    priceChangeThreshold: 5.0,
    correlationPeriod: 30,
    dominanceChangeThreshold: 2.0
  } as StrategyConfig,
  
  execute(candles: Candle[], config?: Partial<StrategyConfig>): StrategySignal {
    const cfg: StrategyConfig = { ...this.defaultConfig, ...config };
    
    if (candles.length < cfg.oiChangePeriod * 2) {
      return {
        direction: 'neutral',
        confidence: 0,
        reasoning: 'Insufficient data for sentiment analysis',
        indicators: { dataPoints: candles.length }
      };
    }
    
    const currentCandle = candles[candles.length - 1];
    const currentPrice = currentCandle.close;
    
    // Gather sentiment data
    const sentiment = gatherSentimentData(candles, cfg);
    
    // SIGNAL 1: Extreme fear + negative funding = contrarian buy
    if (
      sentiment.fearGreedIndex < cfg.extremeFear &&
      sentiment.fundingRate < -cfg.fundingThreshold &&
      sentiment.stablecoinFlow > 0
    ) {
      const entry = currentPrice;
      const stopLoss = currentPrice * 0.95; // 5% stop
      const takeProfit = currentPrice * 1.15; // 15% target
      
      let confidence = 70;
      if (sentiment.fearGreedIndex < 10) confidence += 10; // Extreme panic
      if (sentiment.liquidationRisk > 0) confidence += 10; // Liquidation flush
      if (sentiment.stablecoinFlow > 10) confidence += 5; // Strong inflows
      
      return {
        direction: 'long',
        confidence: Math.min(95, confidence),
        reasoning: `EXTREME FEAR detected (${sentiment.fearGreedIndex.toFixed(0)}/100). Negative funding (${(sentiment.fundingRate * 100).toFixed(2)}% - shorts paying longs). Stablecoin inflows: ${sentiment.stablecoinFlow.toFixed(1)}%. ${sentiment.liquidationRisk ? 'Liquidation cascade detected.' : ''} Contrarian buy signal.`,
        entry,
        stopLoss,
        takeProfit,
        indicators: {
          fearGreedIndex: sentiment.fearGreedIndex.toFixed(0),
          fundingRate: (sentiment.fundingRate * 100).toFixed(3) + '%',
          longShortRatio: sentiment.longShortRatio.toFixed(2),
          oiChange: sentiment.oiChange.toFixed(1) + '%',
          stablecoinFlow: sentiment.stablecoinFlow.toFixed(1) + '%',
          btcDominance: sentiment.btcDominance.toFixed(1) + '%',
          liquidationEvent: sentiment.liquidationRisk > 0,
          signal: 'Contrarian Buy - Extreme Fear'
        }
      };
    }
    
    // SIGNAL 2: Extreme greed + positive funding = contrarian sell
    if (
      sentiment.fearGreedIndex > cfg.extremeGreed &&
      sentiment.fundingRate > cfg.fundingThreshold &&
      sentiment.stablecoinFlow < 0
    ) {
      const entry = currentPrice;
      const stopLoss = currentPrice * 1.05;
      const takeProfit = currentPrice * 0.85;
      
      let confidence = 70;
      if (sentiment.fearGreedIndex > 90) confidence += 10; // Extreme euphoria
      if (sentiment.longShortRatio > 3) confidence += 10; // Overleveraged longs
      if (sentiment.stablecoinFlow < -10) confidence += 5; // Outflows
      
      return {
        direction: 'short',
        confidence: Math.min(95, confidence),
        reasoning: `EXTREME GREED detected (${sentiment.fearGreedIndex.toFixed(0)}/100). High positive funding (${(sentiment.fundingRate * 100).toFixed(2)}% - longs paying shorts). Stablecoin outflows: ${sentiment.stablecoinFlow.toFixed(1)}%. Long/short ratio: ${sentiment.longShortRatio.toFixed(2)}. Overleveraged market - contrarian short.`,
        entry,
        stopLoss,
        takeProfit,
        indicators: {
          fearGreedIndex: sentiment.fearGreedIndex.toFixed(0),
          fundingRate: (sentiment.fundingRate * 100).toFixed(3) + '%',
          longShortRatio: sentiment.longShortRatio.toFixed(2),
          oiChange: sentiment.oiChange.toFixed(1) + '%',
          stablecoinFlow: sentiment.stablecoinFlow.toFixed(1) + '%',
          btcDominance: sentiment.btcDominance.toFixed(1) + '%',
          signal: 'Contrarian Short - Extreme Greed'
        }
      };
    }
    
    // SIGNAL 3: Rising OI + rising price = strong trend continuation
    if (
      sentiment.oiChange > cfg.oiChangeThreshold &&
      candles[candles.length - 1].close > candles[candles.length - cfg.oiChangePeriod].close
    ) {
      const entry = currentPrice;
      const priceChange = ((currentPrice - candles[candles.length - cfg.oiChangePeriod].close) / candles[candles.length - cfg.oiChangePeriod].close) * 100;
      
      return {
        direction: 'long',
        confidence: 75,
        reasoning: `Rising OI (${sentiment.oiChange.toFixed(1)}%) + rising price (${priceChange.toFixed(1)}%) = STRONG BULLISH TREND. New money entering longs. Trend continuation likely. Fear/Greed: ${sentiment.fearGreedIndex.toFixed(0)}.`,
        entry,
        stopLoss: currentPrice * 0.97,
        takeProfit: currentPrice * 1.10,
        indicators: {
          oiChange: sentiment.oiChange.toFixed(1) + '%',
          priceChange: priceChange.toFixed(1) + '%',
          fearGreedIndex: sentiment.fearGreedIndex.toFixed(0),
          fundingRate: (sentiment.fundingRate * 100).toFixed(3) + '%',
          signal: 'Trend Continuation - Rising OI + Price'
        }
      };
    }
    
    // SIGNAL 4: Rising OI + falling price = distribution, short signal
    if (
      sentiment.oiChange > cfg.oiChangeThreshold &&
      candles[candles.length - 1].close < candles[candles.length - cfg.oiChangePeriod].close
    ) {
      const entry = currentPrice;
      const priceChange = ((currentPrice - candles[candles.length - cfg.oiChangePeriod].close) / candles[candles.length - cfg.oiChangePeriod].close) * 100;
      
      return {
        direction: 'short',
        confidence: 75,
        reasoning: `Rising OI (${sentiment.oiChange.toFixed(1)}%) + falling price (${priceChange.toFixed(1)}%) = BEARISH DISTRIBUTION. New shorts opening or longs getting trapped. Downtrend likely to continue.`,
        entry,
        stopLoss: currentPrice * 1.03,
        takeProfit: currentPrice * 0.90,
        indicators: {
          oiChange: sentiment.oiChange.toFixed(1) + '%',
          priceChange: priceChange.toFixed(1) + '%',
          fearGreedIndex: sentiment.fearGreedIndex.toFixed(0),
          fundingRate: (sentiment.fundingRate * 100).toFixed(3) + '%',
          signal: 'Bearish Distribution - Rising OI + Falling Price'
        }
      };
    }
    
    // SIGNAL 5: Liquidation cascade detected (reversal opportunity)
    if (sentiment.liquidationRisk > 0) {
      const direction = currentCandle.close < currentCandle.open ? 'long' : 'short';
      
      return {
        direction: direction === 'long' ? 'long' : 'short',
        confidence: 65,
        reasoning: `LIQUIDATION CASCADE detected. Large forced ${direction === 'long' ? 'long' : 'short'} closures likely. Price extremes often reverse after liquidation hunts. ${direction === 'long' ? 'Buy the flush' : 'Short the spike'}.`,
        entry: currentPrice,
        stopLoss: direction === 'long' ? currentPrice * 0.96 : currentPrice * 1.04,
        takeProfit: direction === 'long' ? currentPrice * 1.08 : currentPrice * 0.92,
        indicators: {
          liquidationEvent: true,
          direction: direction === 'long' ? 'Long liquidations' : 'Short liquidations',
          volumeSpike: (currentCandle.volume / (candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20)).toFixed(2) + 'x',
          fearGreedIndex: sentiment.fearGreedIndex.toFixed(0)
        }
      };
    }
    
    // MONITORING: Normal sentiment conditions
    let sentimentZone = 'neutral';
    if (sentiment.fearGreedIndex < 40) sentimentZone = 'fear';
    else if (sentiment.fearGreedIndex > 60) sentimentZone = 'greed';
    
    let fundingBias = 'balanced';
    if (sentiment.fundingRate > cfg.fundingThreshold) fundingBias = 'long-heavy';
    else if (sentiment.fundingRate < -cfg.fundingThreshold) fundingBias = 'short-heavy';
    
    return {
      direction: 'neutral',
      confidence: 30,
      reasoning: `Sentiment: ${sentimentZone} (${sentiment.fearGreedIndex.toFixed(0)}/100). Funding: ${fundingBias} (${(sentiment.fundingRate * 100).toFixed(3)}%). OI change: ${sentiment.oiChange.toFixed(1)}%. L/S ratio: ${sentiment.longShortRatio.toFixed(2)}. BTC dominance: ${sentiment.btcDominance.toFixed(1)}%. Watching for extremes.`,
      indicators: {
        fearGreedIndex: sentiment.fearGreedIndex.toFixed(0),
        sentimentZone,
        fundingRate: (sentiment.fundingRate * 100).toFixed(3) + '%',
        fundingBias,
        longShortRatio: sentiment.longShortRatio.toFixed(2),
        oiChange: sentiment.oiChange.toFixed(1) + '%',
        btcDominance: sentiment.btcDominance.toFixed(1) + '%',
        stablecoinFlow: sentiment.stablecoinFlow.toFixed(1) + '%',
        liquidationRisk: sentiment.liquidationRisk
      }
    };
  }
};
