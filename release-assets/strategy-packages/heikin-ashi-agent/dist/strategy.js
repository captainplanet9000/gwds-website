"use strict";
/**
 * Heikin Ashi Trend Following Strategy
 *
 * Heikin Ashi is a Japanese candlestick technique that filters noise and reveals
 * trends more clearly than standard candles. It smooths price action by averaging
 * open, high, low, close values across periods.
 *
 * Core Calculations:
 * - HA Close = (O + H + L + C) / 4
 * - HA Open = (previous HA Open + previous HA Close) / 2
 * - HA High = max(H, HA Open, HA Close)
 * - HA Low = min(L, HA Open, HA Close)
 *
 * Signals:
 * - Consecutive green HA candles = strong uptrend
 * - Consecutive red HA candles = strong downtrend
 * - HA candles with no lower wick = very bullish
 * - HA candles with no upper wick = very bearish
 * - First green after red series = trend reversal (buy)
 * - First red after green series = trend reversal (sell)
 *
 * @author GWDS
 * @version 2.1.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = void 0;
/**
 * Transform regular candles to Heikin Ashi
 */
function transformToHeikinAshi(candles, dojiThreshold) {
    const haCandles = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        // HA Close = (O + H + L + C) / 4
        const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
        // HA Open = (previous HA Open + previous HA Close) / 2
        let haOpen;
        if (i === 0) {
            haOpen = (candle.open + candle.close) / 2;
        }
        else {
            haOpen = (haCandles[i - 1].open + haCandles[i - 1].close) / 2;
        }
        // HA High = max(H, HA Open, HA Close)
        const haHigh = Math.max(candle.high, haOpen, haClose);
        // HA Low = min(L, HA Open, HA Close)
        const haLow = Math.min(candle.low, haOpen, haClose);
        // Determine color and characteristics
        const bodySize = Math.abs(haClose - haOpen);
        const bodyPercent = (bodySize / haOpen) * 100;
        let color;
        if (bodyPercent < dojiThreshold) {
            color = 'doji';
        }
        else if (haClose > haOpen) {
            color = 'green';
        }
        else {
            color = 'red';
        }
        const hasLowerWick = haLow < Math.min(haOpen, haClose);
        const hasUpperWick = haHigh > Math.max(haOpen, haClose);
        haCandles.push({
            open: haOpen,
            high: haHigh,
            low: haLow,
            close: haClose,
            color,
            hasLowerWick,
            hasUpperWick,
            bodySize,
            bodyPercent,
            timestamp: candle.timestamp
        });
    }
    return haCandles;
}
/**
 * Apply HA transformation multiple times for extra smoothing
 */
function smoothHeikinAshi(candles, iterations, dojiThreshold) {
    let haCandles = transformToHeikinAshi(candles, dojiThreshold);
    // Convert HA candles back to regular format and reapply transformation
    for (let iter = 1; iter < iterations; iter++) {
        const tempCandles = haCandles.map(ha => ({
            open: ha.open,
            high: ha.high,
            low: ha.low,
            close: ha.close,
            volume: 0, // Volume not used in HA calculation
            timestamp: ha.timestamp
        }));
        haCandles = transformToHeikinAshi(tempCandles, dojiThreshold);
    }
    return haCandles;
}
/**
 * Count consecutive candles of same color
 */
function countConsecutiveCandles(haCandles) {
    if (haCandles.length === 0)
        return { color: 'green', count: 0 };
    const currentColor = haCandles[haCandles.length - 1].color;
    if (currentColor === 'doji')
        return { color: 'green', count: 0 };
    let count = 0;
    for (let i = haCandles.length - 1; i >= 0; i--) {
        if (haCandles[i].color === currentColor) {
            count++;
        }
        else {
            break;
        }
    }
    return { color: currentColor, count };
}
/**
 * Calculate EMA
 */
function calculateEMA(values, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    // Start with SMA
    let sum = 0;
    for (let i = 0; i < period && i < values.length; i++) {
        sum += values[i];
    }
    ema[period - 1] = sum / period;
    // Calculate EMA
    for (let i = period; i < values.length; i++) {
        ema[i] = (values[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
}
/**
 * Calculate ATR (Average True Range)
 */
function calculateATR(candles, period) {
    if (candles.length < period + 1)
        return 0;
    const trueRanges = [];
    for (let i = 1; i < candles.length; i++) {
        const high = candles[i].high;
        const low = candles[i].low;
        const prevClose = candles[i - 1].close;
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trueRanges.push(tr);
    }
    // Simple average of recent TRs
    const recentTRs = trueRanges.slice(-period);
    return recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
}
/**
 * Detect strong trend (wickless candles)
 */
function detectStrongTrend(haCandles, minConsecutive) {
    const consecutive = countConsecutiveCandles(haCandles);
    if (consecutive.count < minConsecutive)
        return false;
    // Check for wickless candles
    const recentCandles = haCandles.slice(-consecutive.count);
    if (consecutive.color === 'green') {
        // Bullish strong trend: no lower wicks
        return recentCandles.every(c => !c.hasLowerWick);
    }
    else {
        // Bearish strong trend: no upper wicks
        return recentCandles.every(c => !c.hasUpperWick);
    }
}
exports.strategy = {
    name: 'Heikin Ashi Trend Following',
    version: '2.1.1',
    description: 'Heikin Ashi candlestick strategy with smoothing, trend strength analysis, and EMA confirmation. Identifies trend reversals and rides strong trends using wickless HA candles as confirmation.',
    author: 'GWDS',
    timeframes: ['15m', '1h', '4h', '1d'],
    defaultConfig: {
        smoothingPeriod: 1,
        minConsecutiveCandles: 3,
        wickFilter: true,
        emaConfirmation: true,
        emaPeriod: 20,
        trendStrengthThreshold: 5,
        dojiThreshold: 0.5,
        minBodySize: 0.3,
        stopLossATR: 2.0,
        takeProfitRatio: 2.5
    },
    execute(candles, config) {
        const cfg = { ...this.defaultConfig, ...config };
        if (candles.length < 50) {
            return {
                direction: 'neutral',
                confidence: 0,
                reasoning: 'Insufficient data for Heikin Ashi analysis (need 50+ candles)',
                indicators: { dataPoints: candles.length }
            };
        }
        const currentCandle = candles[candles.length - 1];
        // Transform to Heikin Ashi
        const haCandles = smoothHeikinAshi(candles, cfg.smoothingPeriod, cfg.dojiThreshold);
        const currentHA = haCandles[haCandles.length - 1];
        const previousHA = haCandles[haCandles.length - 2];
        // Count consecutive candles
        const consecutive = countConsecutiveCandles(haCandles);
        // EMA confirmation
        let emaConfirmed = true;
        let currentEMA = 0;
        if (cfg.emaConfirmation) {
            const closes = candles.map(c => c.close);
            const emaValues = calculateEMA(closes, cfg.emaPeriod);
            currentEMA = emaValues[emaValues.length - 1] || 0;
            if (consecutive.color === 'green') {
                emaConfirmed = currentCandle.close > currentEMA;
            }
            else if (consecutive.color === 'red') {
                emaConfirmed = currentCandle.close < currentEMA;
            }
        }
        // ATR for stop loss
        const atr = calculateATR(candles, 14);
        // Detect strong trend
        const strongTrend = cfg.wickFilter ? detectStrongTrend(haCandles, cfg.minConsecutiveCandles) : false;
        // SIGNAL 1: Bullish reversal (first green after red series)
        if (currentHA.color === 'green' &&
            previousHA.color === 'red' &&
            currentHA.bodyPercent >= cfg.minBodySize) {
            const entry = currentCandle.close;
            const stopLoss = entry - (atr * cfg.stopLossATR);
            const risk = entry - stopLoss;
            const takeProfit = entry + (risk * cfg.takeProfitRatio);
            let confidence = 60;
            if (emaConfirmed)
                confidence += 15;
            if (!currentHA.hasLowerWick)
                confidence += 10; // Strong bullish candle
            if (currentHA.bodyPercent > 1.5)
                confidence += 5; // Large body
            return {
                direction: 'long',
                confidence: Math.min(90, confidence),
                reasoning: `Heikin Ashi bullish reversal. First green HA candle after red series. Body: ${currentHA.bodyPercent.toFixed(2)}%. ${emaConfirmed ? 'EMA confirmed' : 'No EMA confirmation'}. ${!currentHA.hasLowerWick ? 'No lower wick (strong bullish)' : 'Has lower wick'}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    haColor: currentHA.color,
                    haBodyPercent: currentHA.bodyPercent.toFixed(2) + '%',
                    hasLowerWick: currentHA.hasLowerWick,
                    hasUpperWick: currentHA.hasUpperWick,
                    consecutiveCount: 1,
                    emaConfirmed,
                    ema: currentEMA,
                    atr,
                    previousColor: previousHA.color
                }
            };
        }
        // SIGNAL 2: Bearish reversal (first red after green series)
        if (currentHA.color === 'red' &&
            previousHA.color === 'green' &&
            currentHA.bodyPercent >= cfg.minBodySize) {
            const entry = currentCandle.close;
            const stopLoss = entry + (atr * cfg.stopLossATR);
            const risk = stopLoss - entry;
            const takeProfit = entry - (risk * cfg.takeProfitRatio);
            let confidence = 60;
            if (emaConfirmed)
                confidence += 15;
            if (!currentHA.hasUpperWick)
                confidence += 10; // Strong bearish candle
            if (currentHA.bodyPercent > 1.5)
                confidence += 5;
            return {
                direction: 'short',
                confidence: Math.min(90, confidence),
                reasoning: `Heikin Ashi bearish reversal. First red HA candle after green series. Body: ${currentHA.bodyPercent.toFixed(2)}%. ${emaConfirmed ? 'EMA confirmed' : 'No EMA confirmation'}. ${!currentHA.hasUpperWick ? 'No upper wick (strong bearish)' : 'Has upper wick'}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    haColor: currentHA.color,
                    haBodyPercent: currentHA.bodyPercent.toFixed(2) + '%',
                    hasLowerWick: currentHA.hasLowerWick,
                    hasUpperWick: currentHA.hasUpperWick,
                    consecutiveCount: 1,
                    emaConfirmed,
                    ema: currentEMA,
                    atr,
                    previousColor: previousHA.color
                }
            };
        }
        // SIGNAL 3: Continuation in strong trend
        if (consecutive.count >= cfg.trendStrengthThreshold && strongTrend) {
            if (consecutive.color === 'green') {
                const entry = currentCandle.close;
                const stopLoss = entry - (atr * cfg.stopLossATR);
                const risk = entry - stopLoss;
                const takeProfit = entry + (risk * cfg.takeProfitRatio);
                return {
                    direction: 'long',
                    confidence: 80,
                    reasoning: `Strong bullish trend: ${consecutive.count} consecutive green HA candles with no lower wicks. Trend continuation signal. Add to longs or hold positions.`,
                    entry,
                    stopLoss,
                    takeProfit,
                    indicators: {
                        trendType: 'Strong Bullish',
                        consecutiveCount: consecutive.count,
                        wickless: true,
                        haColor: currentHA.color,
                        emaConfirmed,
                        ema: currentEMA
                    }
                };
            }
            else {
                const entry = currentCandle.close;
                const stopLoss = entry + (atr * cfg.stopLossATR);
                const risk = stopLoss - entry;
                const takeProfit = entry - (risk * cfg.takeProfitRatio);
                return {
                    direction: 'short',
                    confidence: 80,
                    reasoning: `Strong bearish trend: ${consecutive.count} consecutive red HA candles with no upper wicks. Trend continuation signal. Add to shorts or hold positions.`,
                    entry,
                    stopLoss,
                    takeProfit,
                    indicators: {
                        trendType: 'Strong Bearish',
                        consecutiveCount: consecutive.count,
                        wickless: true,
                        haColor: currentHA.color,
                        emaConfirmed,
                        ema: currentEMA
                    }
                };
            }
        }
        // MONITORING: Trend in progress
        if (consecutive.count >= cfg.minConsecutiveCandles) {
            const trendDirection = consecutive.color === 'green' ? 'bullish' : 'bearish';
            return {
                direction: 'neutral',
                confidence: 50,
                reasoning: `${trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} trend in progress: ${consecutive.count} consecutive ${consecutive.color} HA candles. ${strongTrend ? 'Strong trend (wickless)' : 'Moderate trend'}. ${emaConfirmed ? 'EMA aligned' : 'EMA not aligned'}. Hold positions, watch for reversal.`,
                indicators: {
                    trend: trendDirection,
                    consecutiveCount: consecutive.count,
                    haColor: currentHA.color,
                    strongTrend,
                    hasLowerWick: currentHA.hasLowerWick,
                    hasUpperWick: currentHA.hasUpperWick,
                    bodyPercent: currentHA.bodyPercent.toFixed(2) + '%',
                    emaConfirmed,
                    ema: currentEMA
                }
            };
        }
        // MONITORING: Doji or indecision
        if (currentHA.color === 'doji') {
            return {
                direction: 'neutral',
                confidence: 20,
                reasoning: `Heikin Ashi doji detected (body: ${currentHA.bodyPercent.toFixed(2)}%). Market indecision. Previous trend: ${previousHA.color}. Wait for clear directional candle.`,
                indicators: {
                    haColor: 'doji',
                    bodyPercent: currentHA.bodyPercent.toFixed(2) + '%',
                    previousColor: previousHA.color,
                    consecutiveCount: consecutive.count
                }
            };
        }
        // NO CLEAR SIGNAL
        return {
            direction: 'neutral',
            confidence: 30,
            reasoning: `No clear Heikin Ashi signal. Current: ${consecutive.count} consecutive ${consecutive.color} candles (need ${cfg.minConsecutiveCandles}+ for signal). Body: ${currentHA.bodyPercent.toFixed(2)}%. Wait for reversal or stronger trend.`,
            indicators: {
                haColor: currentHA.color,
                consecutiveCount: consecutive.count,
                minRequired: cfg.minConsecutiveCandles,
                bodyPercent: currentHA.bodyPercent.toFixed(2) + '%',
                hasLowerWick: currentHA.hasLowerWick,
                hasUpperWick: currentHA.hasUpperWick,
                emaConfirmed,
                ema: currentEMA
            }
        };
    }
};
