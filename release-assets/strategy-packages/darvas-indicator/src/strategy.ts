/**
 * Darvas Box Breakout Strategy
 * 
 * Implementation of Nicolas Darvas's Box Theory - the legendary strategy
 * used by the dancer-turned-trader to turn $36,000 into $2.25 million in 1958.
 * 
 * Core Concept:
 * - Price forms "boxes" when it establishes a new high then consolidates
 * - Box top = highest price over formation period
 * - Box bottom = lowest price after top is established
 * - Buy breakout above box top with volume confirmation
 * - Sell breakdown below box bottom
 * 
 * Adapted for crypto's 24/7 market with rolling windows instead of weekly periods.
 * 
 * @author GWDS
 * @version 2.1.1
 */

export interface StrategyConfig {
  boxFormationPeriod: number;      // Periods to confirm box top/bottom (default: 28 = ~4 weeks in 4h)
  volumeMultiplier: number;         // Breakout volume vs average (default: 1.5)
  minBoxHeight: number;             // Minimum box height as % (default: 2%)
  maxBoxAge: number;                // Max periods box can exist (default: 140 = ~20 weeks)
  stopLossPercent: number;          // Stop below box bottom (default: 5%)
  takeProfitRatio: number;          // R:R ratio (default: 3.0)
  lookbackPeriod: number;           // Periods to check for new highs (default: 28)
  boxConfirmationPeriod: number;    // Periods price must stay in range (default: 5)
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

interface DarvasBox {
  top: number;
  bottom: number;
  topIndex: number;
  bottomIndex: number;
  confirmedAt: number;
  age: number;
  height: number;
  avgVolume: number;
}

/**
 * Calculate Simple Moving Average
 */
function sma(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] || 0;
  const slice = values.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Find pivot highs (local peaks)
 */
function findPivotHighs(candles: Candle[], lookback: number): Array<{index: number, price: number}> {
  const pivots: Array<{index: number, price: number}> = [];
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    const high = candles[i].high;
    let isPivot = true;
    
    // Check if this high is greater than surrounding highs
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && candles[j].high >= high) {
        isPivot = false;
        break;
      }
    }
    
    if (isPivot) {
      pivots.push({ index: i, price: high });
    }
  }
  
  return pivots;
}

/**
 * Find pivot lows (local troughs)
 */
function findPivotLows(candles: Candle[], lookback: number): Array<{index: number, price: number}> {
  const pivots: Array<{index: number, price: number}> = [];
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    const low = candles[i].low;
    let isPivot = true;
    
    // Check if this low is less than surrounding lows
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j !== i && candles[j].low <= low) {
        isPivot = false;
        break;
      }
    }
    
    if (isPivot) {
      pivots.push({ index: i, price: low });
    }
  }
  
  return pivots;
}

/**
 * Identify Darvas boxes from price action
 */
function identifyBoxes(candles: Candle[], config: StrategyConfig): DarvasBox[] {
  const boxes: DarvasBox[] = [];
  const pivotHighs = findPivotHighs(candles, Math.floor(config.lookbackPeriod / 4));
  
  // Process each pivot high as potential box top
  for (const pivot of pivotHighs) {
    // Find subsequent lows after this high
    const subsequentCandles = candles.slice(pivot.index + 1);
    if (subsequentCandles.length < config.boxConfirmationPeriod) continue;
    
    // Find the lowest low in the confirmation period
    let boxBottom = Number.MAX_VALUE;
    let bottomIndex = pivot.index + 1;
    
    for (let i = 0; i < Math.min(config.boxFormationPeriod, subsequentCandles.length); i++) {
      if (subsequentCandles[i].low < boxBottom) {
        boxBottom = subsequentCandles[i].low;
        bottomIndex = pivot.index + 1 + i;
      }
    }
    
    const boxTop = pivot.price;
    const boxHeight = ((boxTop - boxBottom) / boxBottom) * 100;
    
    // Validate box height
    if (boxHeight < config.minBoxHeight) continue;
    
    // Check if price stayed within box for confirmation period
    let confirmed = true;
    let confirmedAt = bottomIndex + config.boxConfirmationPeriod;
    
    for (let i = bottomIndex; i < Math.min(confirmedAt, candles.length); i++) {
      if (candles[i].high > boxTop || candles[i].low < boxBottom) {
        confirmed = false;
        break;
      }
    }
    
    if (!confirmed || confirmedAt >= candles.length) continue;
    
    // Calculate average volume during box formation
    const boxPeriodCandles = candles.slice(pivot.index, confirmedAt);
    const avgVolume = boxPeriodCandles.reduce((sum, c) => sum + c.volume, 0) / boxPeriodCandles.length;
    
    boxes.push({
      top: boxTop,
      bottom: boxBottom,
      topIndex: pivot.index,
      bottomIndex,
      confirmedAt,
      age: candles.length - confirmedAt,
      height: boxHeight,
      avgVolume
    });
  }
  
  // Return most recent valid boxes
  return boxes
    .filter(box => box.age <= config.maxBoxAge)
    .sort((a, b) => b.confirmedAt - a.confirmedAt)
    .slice(0, 10);
}

/**
 * Check if current price is breaking out of a box
 */
function checkBreakout(
  currentCandle: Candle,
  boxes: DarvasBox[],
  config: StrategyConfig,
  recentCandles: Candle[]
): { isBreakout: boolean; box?: DarvasBox; volumeConfirmed: boolean } {
  
  if (boxes.length === 0) {
    return { isBreakout: false, volumeConfirmed: false };
  }
  
  // Check the most recent valid box
  const activeBox = boxes[0];
  
  // Volume confirmation
  const recentVolumes = recentCandles.slice(-20).map(c => c.volume);
  const avgVolume = sma(recentVolumes, 20);
  const volumeConfirmed = currentCandle.volume >= (avgVolume * config.volumeMultiplier);
  
  // Check for breakout above box top
  if (currentCandle.close > activeBox.top && currentCandle.high > activeBox.top) {
    return { isBreakout: true, box: activeBox, volumeConfirmed };
  }
  
  return { isBreakout: false, volumeConfirmed: false };
}

/**
 * Check if price broke down below box bottom
 */
function checkBreakdown(currentCandle: Candle, boxes: DarvasBox[]): boolean {
  if (boxes.length === 0) return false;
  
  const activeBox = boxes[0];
  return currentCandle.close < activeBox.bottom && currentCandle.low < activeBox.bottom;
}

export const strategy = {
  name: 'Darvas Box Breakout',
  version: '2.1.1',
  description: 'Nicolas Darvas Box Theory implementation with volume confirmation and multi-box tracking. Identifies consolidation boxes and trades breakouts with strict risk management.',
  author: 'GWDS',
  timeframes: ['4h', '1d', '1h'],
  
  defaultConfig: {
    boxFormationPeriod: 28,
    volumeMultiplier: 1.5,
    minBoxHeight: 2.0,
    maxBoxAge: 140,
    stopLossPercent: 5.0,
    takeProfitRatio: 3.0,
    lookbackPeriod: 28,
    boxConfirmationPeriod: 5
  } as StrategyConfig,
  
  execute(candles: Candle[], config?: Partial<StrategyConfig>): StrategySignal {
    const cfg: StrategyConfig = { ...this.defaultConfig, ...config };
    
    // Need sufficient data
    if (candles.length < cfg.boxFormationPeriod * 2) {
      return {
        direction: 'neutral',
        confidence: 0,
        reasoning: 'Insufficient data for box formation analysis',
        indicators: { boxes: [], dataPoints: candles.length }
      };
    }
    
    const currentCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2];
    
    // Identify all valid boxes
    const boxes = identifyBoxes(candles, cfg);
    
    // Check for breakout
    const breakoutCheck = checkBreakout(currentCandle, boxes, cfg, candles);
    
    // Check for breakdown (exit signal)
    const breakdown = checkBreakdown(currentCandle, boxes);
    
    // Calculate position metrics if breakout detected
    if (breakoutCheck.isBreakout && breakoutCheck.box) {
      const box = breakoutCheck.box;
      const entry = currentCandle.close;
      const stopLoss = box.bottom * (1 - cfg.stopLossPercent / 100);
      const risk = entry - stopLoss;
      const takeProfit = entry + (risk * cfg.takeProfitRatio);
      
      // Confidence scoring
      let confidence = 50;
      
      // Volume confirmation adds confidence
      if (breakoutCheck.volumeConfirmed) confidence += 25;
      
      // Box height adds confidence (bigger boxes = stronger breakouts)
      if (box.height > 5) confidence += 10;
      if (box.height > 10) confidence += 10;
      
      // Fresh box adds confidence
      if (box.age < cfg.maxBoxAge / 2) confidence += 5;
      
      // Multiple boxes stacking up (strong trend)
      if (boxes.length >= 3) {
        const boxesAscending = boxes.every((b, i) => i === 0 || b.top < boxes[i-1].top);
        if (boxesAscending) confidence += 10;
      }
      
      confidence = Math.min(95, confidence);
      
      const reasoning = [
        `Darvas Box breakout detected above $${box.top.toFixed(2)}`,
        `Box formed between $${box.bottom.toFixed(2)} - $${box.top.toFixed(2)} (${box.height.toFixed(1)}% height)`,
        `Volume ${breakoutCheck.volumeConfirmed ? 'CONFIRMED' : 'WEAK'} at ${(currentCandle.volume / box.avgVolume).toFixed(2)}x average`,
        `Box age: ${box.age} periods`,
        `Total active boxes: ${boxes.length}`,
        `R:R ratio: 1:${cfg.takeProfitRatio}`
      ].join('. ');
      
      return {
        direction: 'long',
        confidence,
        reasoning,
        entry,
        stopLoss,
        takeProfit,
        indicators: {
          boxes: boxes.map(b => ({
            top: b.top,
            bottom: b.bottom,
            height: b.height,
            age: b.age
          })),
          currentBox: {
            top: box.top,
            bottom: box.bottom,
            height: box.height
          },
          breakoutVolume: currentCandle.volume,
          avgVolume: box.avgVolume,
          volumeRatio: currentCandle.volume / box.avgVolume
        }
      };
    }
    
    // Breakdown signal (exit/short)
    if (breakdown && boxes.length > 0) {
      const box = boxes[0];
      
      return {
        direction: 'short',
        confidence: 75,
        reasoning: `Box breakdown below $${box.bottom.toFixed(2)}. Price broke support level - exit longs or consider short entry. Box invalidated.`,
        entry: currentCandle.close,
        stopLoss: box.top,
        takeProfit: box.bottom * (1 - box.height / 100),
        indicators: {
          boxes: boxes.map(b => ({ top: b.top, bottom: b.bottom, height: b.height, age: b.age })),
          brokenBox: { top: box.top, bottom: box.bottom },
          breakdownPrice: currentCandle.close
        }
      };
    }
    
    // No signal - monitoring boxes
    if (boxes.length > 0) {
      const activeBox = boxes[0];
      const pricePosition = ((currentCandle.close - activeBox.bottom) / (activeBox.top - activeBox.bottom)) * 100;
      
      return {
        direction: 'neutral',
        confidence: 30,
        reasoning: `Monitoring active box $${activeBox.bottom.toFixed(2)} - $${activeBox.top.toFixed(2)}. Price at ${pricePosition.toFixed(0)}% of box range. Waiting for breakout with volume confirmation.`,
        indicators: {
          boxes: boxes.map(b => ({ top: b.top, bottom: b.bottom, height: b.height, age: b.age })),
          activeBox: {
            top: activeBox.top,
            bottom: activeBox.bottom,
            height: activeBox.height,
            age: activeBox.age
          },
          pricePosition: pricePosition.toFixed(1) + '%',
          currentVolume: currentCandle.volume,
          avgVolume: activeBox.avgVolume
        }
      };
    }
    
    // No boxes identified
    return {
      direction: 'neutral',
      confidence: 0,
      reasoning: 'No valid Darvas boxes identified. Market needs clear consolidation pattern with defined highs and lows.',
      indicators: {
        boxes: [],
        pivotHighs: findPivotHighs(candles, Math.floor(cfg.lookbackPeriod / 4)).length,
        currentPrice: currentCandle.close
      }
    };
  }
};
