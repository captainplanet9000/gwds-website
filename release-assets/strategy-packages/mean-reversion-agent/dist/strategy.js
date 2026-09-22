"use strict";
/**
 * Bollinger Band Mean Reversion Strategy
 *
 * Advanced mean reversion strategy using Bollinger Bands, Keltner Channels,
 * and RSI. Identifies ranging vs trending markets and trades accordingly.
 *
 * Core Concepts:
 * - Bollinger Bands: SMA ± (standard deviation * multiplier)
 * - Bandwidth: (upper - lower) / middle - measures volatility
 * - %B: (price - lower) / (upper - lower) - position within bands
 * - Squeeze: BB inside Keltner Channels = low volatility, expansion coming
 * - Walking the bands: Price persistently at upper/lower band = trending
 *
 * In ranging markets: fade extremes (buy lower band, sell upper band)
 * In trending markets: avoid fading, wait for squeeze or regime change
 *
 * @author GWDS
 * @version 2.1.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = void 0;
/**
 * Calculate SMA
 */
function sma(values, period) {
    if (values.length < period)
        return values[values.length - 1] || 0;
    const slice = values.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
}
/**
 * Calculate EMA
 */
function ema(values, period) {
    if (values.length < period)
        return values[values.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let emaValue = sma(values.slice(0, period), period);
    for (let i = period; i < values.length; i++) {
        emaValue = (values[i] - emaValue) * multiplier + emaValue;
    }
    return emaValue;
}
/**
 * Calculate standard deviation
 */
function stdDev(values, period) {
    if (values.length < period)
        return 0;
    const slice = values.slice(-period);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const squaredDiffs = slice.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
    return Math.sqrt(variance);
}
/**
 * Calculate ATR
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
    return sma(trueRanges, period);
}
/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(closes, period, stdDevMult, currentPrice) {
    const middle = sma(closes, period);
    const stdDevValue = stdDev(closes, period);
    const upper = middle + (stdDevValue * stdDevMult);
    const lower = middle - (stdDevValue * stdDevMult);
    const bandwidth = ((upper - lower) / middle) * 100;
    const percentB = (currentPrice - lower) / (upper - lower);
    return { upper, middle, lower, bandwidth, percentB };
}
/**
 * Calculate Keltner Channels
 */
function calculateKeltnerChannels(candles, period, multiplier) {
    const closes = candles.map(c => c.close);
    const middle = ema(closes, period);
    const atr = calculateATR(candles, period);
    const upper = middle + (atr * multiplier);
    const lower = middle - (atr * multiplier);
    return { upper, middle, lower };
}
/**
 * Calculate RSI
 */
function calculateRSI(candles, period) {
    if (candles.length < period + 1)
        return 50;
    const changes = [];
    for (let i = 1; i < candles.length; i++) {
        changes.push(candles[i].close - candles[i - 1].close);
    }
    const recentChanges = changes.slice(-period);
    let avgGain = 0;
    let avgLoss = 0;
    for (const change of recentChanges) {
        if (change > 0)
            avgGain += change;
        else
            avgLoss += Math.abs(change);
    }
    avgGain /= period;
    avgLoss /= period;
    if (avgLoss === 0)
        return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}
/**
 * Detect squeeze (BB inside KC)
 */
function detectSqueeze(bb, kc) {
    return bb.upper < kc.upper && bb.lower > kc.lower;
}
/**
 * Check if price is walking the bands (trending)
 */
function isWalkingBands(candles, bb, walkingThreshold) {
    const recentCandles = candles.slice(-walkingThreshold);
    // Check if walking upper band (bullish trend)
    const atUpperBand = recentCandles.filter(c => c.close >= bb.upper * 0.99).length;
    if (atUpperBand >= walkingThreshold - 1) {
        return { walking: true, direction: 'up' };
    }
    // Check if walking lower band (bearish trend)
    const atLowerBand = recentCandles.filter(c => c.close <= bb.lower * 1.01).length;
    if (atLowerBand >= walkingThreshold - 1) {
        return { walking: true, direction: 'down' };
    }
    return { walking: false };
}
/**
 * Detect double bottom at lower band
 */
function detectDoubleBottom(candles, bb, lookback) {
    const recentCandles = candles.slice(-lookback);
    // Find lows that touched lower band
    const bandTouches = [];
    for (let i = 0; i < recentCandles.length; i++) {
        if (recentCandles[i].low <= bb.lower * 1.01) {
            bandTouches.push(i);
        }
    }
    // Need at least 2 touches
    if (bandTouches.length < 2)
        return false;
    // Check if second touch held higher (failed to make new low)
    const firstTouch = bandTouches[0];
    const secondTouch = bandTouches[bandTouches.length - 1];
    return recentCandles[secondTouch].low >= recentCandles[firstTouch].low * 0.998;
}
/**
 * Detect double top at upper band
 */
function detectDoubleTop(candles, bb, lookback) {
    const recentCandles = candles.slice(-lookback);
    const bandTouches = [];
    for (let i = 0; i < recentCandles.length; i++) {
        if (recentCandles[i].high >= bb.upper * 0.99) {
            bandTouches.push(i);
        }
    }
    if (bandTouches.length < 2)
        return false;
    const firstTouch = bandTouches[0];
    const secondTouch = bandTouches[bandTouches.length - 1];
    return recentCandles[secondTouch].high <= recentCandles[firstTouch].high * 1.002;
}
exports.strategy = {
    name: 'Bollinger Band Mean Reversion',
    version: '2.1.1',
    description: 'Advanced mean reversion strategy with Bollinger Bands, Keltner Channels, and RSI. Detects ranging vs trending markets, identifies squeezes, and trades mean reversion with proper regime filtering.',
    author: 'GWDS',
    timeframes: ['15m', '1h', '4h'],
    defaultConfig: {
        bbPeriod: 20,
        bbStdDev: 2.0,
        kcPeriod: 20,
        kcMultiplier: 1.5,
        rsiPeriod: 14,
        rsiOversold: 30,
        rsiOverbought: 70,
        bandwidthThreshold: 5.0,
        walkingThreshold: 3,
        doubleBottomLookback: 20,
        minBodyPercent: 0.3,
        takeProfitTarget: 'middle'
    },
    execute(candles, config) {
        const cfg = { ...this.defaultConfig, ...config };
        if (candles.length < Math.max(cfg.bbPeriod, cfg.kcPeriod, cfg.rsiPeriod) + 10) {
            return {
                direction: 'neutral',
                confidence: 0,
                reasoning: 'Insufficient data for Bollinger Band analysis',
                indicators: { dataPoints: candles.length }
            };
        }
        const currentCandle = candles[candles.length - 1];
        const currentPrice = currentCandle.close;
        const closes = candles.map(c => c.close);
        // Calculate indicators
        const bb = calculateBollingerBands(closes, cfg.bbPeriod, cfg.bbStdDev, currentPrice);
        const kc = calculateKeltnerChannels(candles, cfg.kcPeriod, cfg.kcMultiplier);
        const rsi = calculateRSI(candles, cfg.rsiPeriod);
        // Market regime detection
        const squeeze = detectSqueeze(bb, kc);
        const walking = isWalkingBands(candles, bb, cfg.walkingThreshold);
        const doubleBottom = detectDoubleBottom(candles, bb, cfg.doubleBottomLookback);
        const doubleTop = detectDoubleTop(candles, bb, cfg.doubleBottomLookback);
        // Candle body size
        const bodyPercent = Math.abs((currentCandle.close - currentCandle.open) / currentCandle.open) * 100;
        // SIGNAL 1: Oversold bounce (lower band + oversold RSI)
        if (currentPrice <= bb.lower &&
            rsi < cfg.rsiOversold &&
            !walking.walking &&
            bodyPercent >= cfg.minBodyPercent) {
            const entry = currentPrice;
            const stopLoss = bb.lower * 0.98; // Below lower band
            const takeProfit = cfg.takeProfitTarget === 'middle' ? bb.middle : bb.upper;
            let confidence = 65;
            if (doubleBottom)
                confidence += 15; // Double bottom is strong
            if (rsi < 25)
                confidence += 10; // Extremely oversold
            if (bb.percentB < 0)
                confidence += 5; // Below lower band
            if (squeeze)
                confidence += 5; // Squeeze = potential expansion
            return {
                direction: 'long',
                confidence: Math.min(95, confidence),
                reasoning: `Oversold mean reversion at lower BB ($${bb.lower.toFixed(2)}). RSI: ${rsi.toFixed(0)} (oversold). %B: ${bb.percentB.toFixed(2)}. ${doubleBottom ? 'DOUBLE BOTTOM detected' : ''}. ${squeeze ? 'BB Squeeze active' : ''}. Target: ${cfg.takeProfitTarget} band.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    bbUpper: bb.upper,
                    bbMiddle: bb.middle,
                    bbLower: bb.lower,
                    bandwidth: bb.bandwidth.toFixed(2) + '%',
                    percentB: bb.percentB.toFixed(2),
                    rsi: rsi.toFixed(0),
                    squeeze,
                    doubleBottom,
                    regime: 'ranging'
                }
            };
        }
        // SIGNAL 2: Overbought fade (upper band + overbought RSI)
        if (currentPrice >= bb.upper &&
            rsi > cfg.rsiOverbought &&
            !walking.walking &&
            bodyPercent >= cfg.minBodyPercent) {
            const entry = currentPrice;
            const stopLoss = bb.upper * 1.02; // Above upper band
            const takeProfit = cfg.takeProfitTarget === 'middle' ? bb.middle : bb.lower;
            let confidence = 65;
            if (doubleTop)
                confidence += 15;
            if (rsi > 75)
                confidence += 10;
            if (bb.percentB > 1)
                confidence += 5;
            if (squeeze)
                confidence += 5;
            return {
                direction: 'short',
                confidence: Math.min(95, confidence),
                reasoning: `Overbought mean reversion at upper BB ($${bb.upper.toFixed(2)}). RSI: ${rsi.toFixed(0)} (overbought). %B: ${bb.percentB.toFixed(2)}. ${doubleTop ? 'DOUBLE TOP detected' : ''}. ${squeeze ? 'BB Squeeze active' : ''}. Target: ${cfg.takeProfitTarget} band.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    bbUpper: bb.upper,
                    bbMiddle: bb.middle,
                    bbLower: bb.lower,
                    bandwidth: bb.bandwidth.toFixed(2) + '%',
                    percentB: bb.percentB.toFixed(2),
                    rsi: rsi.toFixed(0),
                    squeeze,
                    doubleTop,
                    regime: 'ranging'
                }
            };
        }
        // SIGNAL 3: Squeeze detected (low volatility, expansion coming)
        if (squeeze && bb.bandwidth < cfg.bandwidthThreshold) {
            return {
                direction: 'neutral',
                confidence: 60,
                reasoning: `Bollinger Band SQUEEZE detected. Bandwidth: ${bb.bandwidth.toFixed(2)}% (threshold: ${cfg.bandwidthThreshold}%). Low volatility - expect expansion and trend soon. BB inside KC. Wait for breakout direction.`,
                indicators: {
                    squeeze: true,
                    bandwidth: bb.bandwidth.toFixed(2) + '%',
                    bandwidthThreshold: cfg.bandwidthThreshold + '%',
                    bbUpper: bb.upper,
                    bbLower: bb.lower,
                    kcUpper: kc.upper,
                    kcLower: kc.lower,
                    rsi: rsi.toFixed(0),
                    percentB: bb.percentB.toFixed(2),
                    message: 'Position for breakout - high probability move coming'
                }
            };
        }
        // WARNING: Walking the bands (trending, don't fade)
        if (walking.walking) {
            const direction = walking.direction === 'up' ? 'bullish' : 'bearish';
            return {
                direction: 'neutral',
                confidence: 40,
                reasoning: `Price WALKING the ${walking.direction === 'up' ? 'upper' : 'lower'} band - ${direction} TREND active. Do NOT fade this move. Mean reversion strategy disabled in trending regime. Consider trend-following strategies instead.`,
                indicators: {
                    walkingBands: true,
                    direction: walking.direction,
                    regime: 'trending',
                    bbUpper: bb.upper,
                    bbLower: bb.lower,
                    currentPrice,
                    rsi: rsi.toFixed(0),
                    percentB: bb.percentB.toFixed(2),
                    warning: 'Trending market - mean reversion not recommended'
                }
            };
        }
        // MONITORING: Position within bands
        let position = 'middle';
        if (bb.percentB > 0.8)
            position = 'upper zone';
        else if (bb.percentB < 0.2)
            position = 'lower zone';
        let rsiZone = 'neutral';
        if (rsi > cfg.rsiOverbought)
            rsiZone = 'overbought';
        else if (rsi < cfg.rsiOversold)
            rsiZone = 'oversold';
        else if (rsi > 60)
            rsiZone = 'bullish';
        else if (rsi < 40)
            rsiZone = 'bearish';
        return {
            direction: 'neutral',
            confidence: 30,
            reasoning: `Monitoring BB position. Price in ${position} (%B: ${bb.percentB.toFixed(2)}). RSI: ${rsi.toFixed(0)} (${rsiZone}). Bandwidth: ${bb.bandwidth.toFixed(2)}%. Waiting for touch of bands + RSI confirmation for mean reversion entry.`,
            indicators: {
                bbUpper: bb.upper.toFixed(2),
                bbMiddle: bb.middle.toFixed(2),
                bbLower: bb.lower.toFixed(2),
                bandwidth: bb.bandwidth.toFixed(2) + '%',
                percentB: bb.percentB.toFixed(2),
                position,
                rsi: rsi.toFixed(0),
                rsiZone,
                squeeze,
                regime: walking.walking ? 'trending' : 'ranging',
                kcUpper: kc.upper.toFixed(2),
                kcLower: kc.lower.toFixed(2)
            }
        };
    }
};
