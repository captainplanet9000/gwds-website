"use strict";
/**
 * VWAP Volume Breakout Strategy
 *
 * Professional institutional VWAP strategy using volume-weighted price analysis.
 * VWAP is the average price weighted by volume - critical for institutional execution.
 *
 * Core Concepts:
 * - VWAP = sum(price * volume) / sum(volume) over session
 * - Standard deviation bands show overbought/oversold zones
 * - Price above VWAP = bullish, below = bearish
 * - Volume surges at VWAP crossovers = institutional accumulation/distribution
 * - POC (Point of Control) = price with highest volume
 * - Anchored VWAP from key swing points for dynamic S/R
 *
 * @author GWDS
 * @version 2.1.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = void 0;
/**
 * Calculate VWAP and standard deviation bands
 */
function calculateVWAP(candles, sessionLength, bandMultipliers) {
    const sessionCandles = candles.slice(-sessionLength);
    let sumPV = 0; // Sum of (price * volume)
    let sumV = 0; // Sum of volume
    // Calculate VWAP
    for (const candle of sessionCandles) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3;
        sumPV += typicalPrice * candle.volume;
        sumV += candle.volume;
    }
    const vwap = sumV > 0 ? sumPV / sumV : sessionCandles[sessionCandles.length - 1].close;
    // Calculate standard deviation
    let sumSquaredDiff = 0;
    for (const candle of sessionCandles) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3;
        const diff = typicalPrice - vwap;
        sumSquaredDiff += diff * diff * candle.volume;
    }
    const variance = sumV > 0 ? sumSquaredDiff / sumV : 0;
    const stdDev = Math.sqrt(variance);
    // Calculate bands
    const upperBands = bandMultipliers.map(mult => vwap + (stdDev * mult));
    const lowerBands = bandMultipliers.map(mult => vwap - (stdDev * mult));
    return {
        vwap,
        upperBands,
        lowerBands,
        stdDev,
        totalVolume: sumV,
        avgPrice: vwap
    };
}
/**
 * Calculate anchored VWAP from swing low/high
 */
function calculateAnchoredVWAP(candles, anchorIndex) {
    const anchoredCandles = candles.slice(anchorIndex);
    let sumPV = 0;
    let sumV = 0;
    for (const candle of anchoredCandles) {
        const typicalPrice = (candle.high + candle.low + candle.close) / 3;
        sumPV += typicalPrice * candle.volume;
        sumV += candle.volume;
    }
    return sumV > 0 ? sumPV / sumV : candles[candles.length - 1].close;
}
/**
 * Find swing low for anchored VWAP
 */
function findRecentSwingLow(candles, lookback) {
    if (candles.length < lookback)
        return 0;
    let lowestIndex = candles.length - lookback;
    let lowestPrice = candles[lowestIndex].low;
    for (let i = candles.length - lookback; i < candles.length - 5; i++) {
        if (candles[i].low < lowestPrice) {
            lowestPrice = candles[i].low;
            lowestIndex = i;
        }
    }
    return lowestIndex;
}
/**
 * Calculate cumulative delta (buying vs selling pressure)
 */
function calculateCumulativeDelta(candles, period) {
    const recentCandles = candles.slice(-period);
    let delta = 0;
    for (const candle of recentCandles) {
        // Simplified: if close > open, volume is buying, else selling
        const isBuying = candle.close > candle.open;
        delta += isBuying ? candle.volume : -candle.volume;
    }
    return delta;
}
/**
 * Build volume profile and find POC
 */
function calculateVolumeProfile(candles, sessionLength, binSizePercent) {
    const sessionCandles = candles.slice(-sessionLength);
    // Find price range
    const prices = sessionCandles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binSize = (maxPrice - minPrice) * (binSizePercent / 100);
    // Build volume bins
    const bins = new Map();
    for (const candle of sessionCandles) {
        // Distribute volume across price range of candle
        const candleRange = candle.high - candle.low;
        const numBins = Math.max(1, Math.ceil(candleRange / binSize));
        const volumePerBin = candle.volume / numBins;
        for (let price = candle.low; price <= candle.high; price += binSize) {
            const binKey = Math.floor(price / binSize) * binSize;
            bins.set(binKey, (bins.get(binKey) || 0) + volumePerBin);
        }
    }
    // Find POC (highest volume bin)
    let poc = minPrice;
    let maxVolume = 0;
    bins.forEach((volume, price) => {
        if (volume > maxVolume) {
            maxVolume = volume;
            poc = price;
        }
    });
    // Calculate value area (70% of volume)
    const totalVolume = Array.from(bins.values()).reduce((sum, v) => sum + v, 0);
    const targetVolume = totalVolume * 0.7;
    // Expand from POC until we capture 70% volume
    const sortedBins = Array.from(bins.entries()).sort((a, b) => b[1] - a[1]);
    let cumulativeVolume = 0;
    let valueAreaHigh = poc;
    let valueAreaLow = poc;
    for (const [price, volume] of sortedBins) {
        cumulativeVolume += volume;
        if (price > valueAreaHigh)
            valueAreaHigh = price;
        if (price < valueAreaLow)
            valueAreaLow = price;
        if (cumulativeVolume >= targetVolume)
            break;
    }
    return { poc, valueAreaHigh, valueAreaLow, bins };
}
/**
 * Check for volume surge
 */
function hasVolumeSurge(currentVolume, recentCandles, threshold) {
    const avgVolume = recentCandles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    return currentVolume >= avgVolume * threshold;
}
exports.strategy = {
    name: 'VWAP Volume Breakout',
    version: '2.1.1',
    description: 'Professional VWAP strategy with volume profile, cumulative delta, and anchored VWAP. Trades breakouts with institutional volume confirmation and mean reversion at extreme bands.',
    author: 'GWDS',
    timeframes: ['15m', '1h', '4h'],
    defaultConfig: {
        sessionLength: 24,
        bandMultiplier: [1, 2, 3],
        volumeThreshold: 2.0,
        cumulativeDeltaPeriod: 20,
        pocBinSize: 0.5,
        anchoredPeriod: 50,
        meanReversionBand: 2,
        minSessionVolume: 100000,
        priceMovementThreshold: 0.5
    },
    execute(candles, config) {
        const cfg = { ...this.defaultConfig, ...config };
        if (!Number.isInteger(cfg.sessionLength) || cfg.sessionLength < 2 ||
            !Number.isInteger(cfg.meanReversionBand) || cfg.meanReversionBand < 1 ||
            !Array.isArray(cfg.bandMultiplier) || cfg.bandMultiplier.length <= cfg.meanReversionBand || cfg.bandMultiplier.length < 2 ||
            cfg.bandMultiplier.some((n, i, bands) => !Number.isFinite(n) || n <= 0 || (i > 0 && n <= bands[i - 1])) ||
            [cfg.volumeThreshold, cfg.cumulativeDeltaPeriod, cfg.pocBinSize, cfg.anchoredPeriod].some(n => !Number.isFinite(n) || n <= 0) ||
            !Number.isFinite(cfg.minSessionVolume) || cfg.minSessionVolume < 0) {
            return { direction: 'neutral', confidence: 0, reasoning: 'Invalid VWAP configuration', indicators: {} };
        }
        if (candles.some((c, i) => ![c.open, c.high, c.low, c.close, c.volume, c.timestamp].every(Number.isFinite) ||
            c.low <= 0 || c.high < Math.max(c.open, c.close) || c.low > Math.min(c.open, c.close) || c.volume < 0 ||
            (i > 0 && c.timestamp <= candles[i - 1].timestamp))) {
            return { direction: 'neutral', confidence: 0, reasoning: 'Invalid or out-of-order candle data', indicators: {} };
        }
        if (candles.length < cfg.sessionLength) {
            return {
                direction: 'neutral',
                confidence: 0,
                reasoning: 'Insufficient data for VWAP calculation',
                indicators: { dataPoints: candles.length, required: cfg.sessionLength }
            };
        }
        const currentCandle = candles[candles.length - 1];
        const previousCandle = candles[candles.length - 2];
        const currentPrice = currentCandle.close;
        // Calculate VWAP and bands
        const vwapData = calculateVWAP(candles, cfg.sessionLength, cfg.bandMultiplier);
        // Collapsed bands have no distinct entry/stop/target and are not a setup.
        if (vwapData.stdDev <= Number.EPSILON * currentPrice * 16) {
            return { direction: 'neutral', confidence: 0, reasoning: 'VWAP bands have no usable price range', indicators: { vwap: vwapData.vwap } };
        }
        // Check minimum volume requirement
        const avgSessionVolume = vwapData.totalVolume / cfg.sessionLength;
        if (avgSessionVolume < cfg.minSessionVolume) {
            return {
                direction: 'neutral',
                confidence: 0,
                reasoning: 'Insufficient session volume for reliable VWAP signals',
                indicators: { avgVolume: avgSessionVolume, required: cfg.minSessionVolume }
            };
        }
        // Calculate anchored VWAP from recent swing low
        const swingLowIndex = findRecentSwingLow(candles, cfg.anchoredPeriod);
        const anchoredVWAP = calculateAnchoredVWAP(candles, swingLowIndex);
        // Volume analysis
        const volumeSurge = hasVolumeSurge(currentCandle.volume, candles.slice(-20), cfg.volumeThreshold);
        const cumulativeDelta = calculateCumulativeDelta(candles, cfg.cumulativeDeltaPeriod);
        const deltaBias = cumulativeDelta > 0 ? 'bullish' : 'bearish';
        // Volume profile
        const volumeProfile = calculateVolumeProfile(candles, cfg.sessionLength, cfg.pocBinSize);
        // Position relative to VWAP
        const vwapDistance = ((currentPrice - vwapData.vwap) / vwapData.vwap) * 100;
        const previousAboveVWAP = previousCandle.close > vwapData.vwap;
        const currentAboveVWAP = currentPrice > vwapData.vwap;
        // SIGNAL 1: Bullish VWAP breakout with volume
        if (!previousAboveVWAP && currentAboveVWAP && volumeSurge && deltaBias === 'bullish' && vwapData.upperBands[1] > currentPrice) {
            const entry = currentPrice;
            const stopLoss = vwapData.vwap * 0.995; // Tight stop below VWAP
            const targetBand = vwapData.upperBands[1]; // 2nd std dev band
            const takeProfit = targetBand;
            let confidence = 70;
            if (currentPrice > anchoredVWAP)
                confidence += 10; // Aligned with anchored VWAP
            if (currentPrice > volumeProfile.poc)
                confidence += 5; // Above POC
            if (cumulativeDelta > vwapData.totalVolume * 0.1)
                confidence += 10; // Strong buying
            return {
                direction: 'long',
                confidence: Math.min(95, confidence),
                reasoning: `Bullish VWAP breakout at $${vwapData.vwap.toFixed(2)} with ${(currentCandle.volume / (vwapData.totalVolume / cfg.sessionLength)).toFixed(1)}x volume surge. Cumulative delta: ${deltaBias}. Target: 2σ band at $${targetBand.toFixed(2)}. POC at $${volumeProfile.poc.toFixed(2)}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    vwap: vwapData.vwap,
                    anchoredVWAP,
                    currentPrice,
                    vwapDistance: vwapDistance.toFixed(2) + '%',
                    volumeSurge: volumeSurge,
                    volumeRatio: (currentCandle.volume / (vwapData.totalVolume / cfg.sessionLength)).toFixed(2),
                    cumulativeDelta,
                    deltaBias,
                    poc: volumeProfile.poc,
                    upperBands: vwapData.upperBands,
                    lowerBands: vwapData.lowerBands
                }
            };
        }
        // SIGNAL 2: Bearish VWAP breakdown with volume
        if (previousAboveVWAP && !currentAboveVWAP && volumeSurge && deltaBias === 'bearish' && vwapData.lowerBands[1] > 0 && vwapData.lowerBands[1] < currentPrice) {
            const entry = currentPrice;
            const stopLoss = vwapData.vwap * 1.005; // Tight stop above VWAP
            const targetBand = vwapData.lowerBands[1]; // 2nd std dev band
            const takeProfit = targetBand;
            let confidence = 70;
            if (currentPrice < anchoredVWAP)
                confidence += 10;
            if (currentPrice < volumeProfile.poc)
                confidence += 5;
            if (cumulativeDelta < -(vwapData.totalVolume * 0.1))
                confidence += 10;
            return {
                direction: 'short',
                confidence: Math.min(95, confidence),
                reasoning: `Bearish VWAP breakdown below $${vwapData.vwap.toFixed(2)} with ${(currentCandle.volume / (vwapData.totalVolume / cfg.sessionLength)).toFixed(1)}x volume surge. Cumulative delta: ${deltaBias}. Target: -2σ band at $${targetBand.toFixed(2)}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    vwap: vwapData.vwap,
                    anchoredVWAP,
                    currentPrice,
                    vwapDistance: vwapDistance.toFixed(2) + '%',
                    volumeSurge,
                    volumeRatio: (currentCandle.volume / (vwapData.totalVolume / cfg.sessionLength)).toFixed(2),
                    cumulativeDelta,
                    deltaBias,
                    poc: volumeProfile.poc,
                    upperBands: vwapData.upperBands,
                    lowerBands: vwapData.lowerBands
                }
            };
        }
        // SIGNAL 3: Mean reversion at extreme bands
        const atUpperBand = currentPrice >= vwapData.upperBands[cfg.meanReversionBand - 1];
        const atLowerBand = currentPrice <= vwapData.lowerBands[cfg.meanReversionBand - 1];
        if (atLowerBand && deltaBias === 'bullish' && vwapData.lowerBands[cfg.meanReversionBand] > 0 && vwapData.lowerBands[cfg.meanReversionBand] < currentPrice && vwapData.vwap > currentPrice) {
            // Oversold bounce
            const entry = currentPrice;
            const stopLoss = vwapData.lowerBands[cfg.meanReversionBand]; // Below 3rd band
            const takeProfit = vwapData.vwap; // Mean reversion to VWAP
            return {
                direction: 'long',
                confidence: 65,
                reasoning: `Mean reversion setup at -${cfg.meanReversionBand}σ band ($${vwapData.lowerBands[cfg.meanReversionBand - 1].toFixed(2)}). Oversold with ${deltaBias} delta. Target: VWAP at $${vwapData.vwap.toFixed(2)}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    strategy: 'Mean Reversion',
                    vwap: vwapData.vwap,
                    currentBand: `-${cfg.meanReversionBand}σ`,
                    vwapDistance: vwapDistance.toFixed(2) + '%',
                    cumulativeDelta,
                    deltaBias
                }
            };
        }
        if (atUpperBand && deltaBias === 'bearish' && vwapData.upperBands[cfg.meanReversionBand] > currentPrice && vwapData.vwap < currentPrice) {
            // Overbought fade
            const entry = currentPrice;
            const stopLoss = vwapData.upperBands[cfg.meanReversionBand]; // Above 3rd band
            const takeProfit = vwapData.vwap; // Mean reversion to VWAP
            return {
                direction: 'short',
                confidence: 65,
                reasoning: `Mean reversion setup at +${cfg.meanReversionBand}σ band ($${vwapData.upperBands[cfg.meanReversionBand - 1].toFixed(2)}). Overbought with ${deltaBias} delta. Target: VWAP at $${vwapData.vwap.toFixed(2)}.`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    strategy: 'Mean Reversion',
                    vwap: vwapData.vwap,
                    currentBand: `+${cfg.meanReversionBand}σ`,
                    vwapDistance: vwapDistance.toFixed(2) + '%',
                    cumulativeDelta,
                    deltaBias
                }
            };
        }
        // MONITORING: Position relative to VWAP
        const position = currentAboveVWAP ? 'above' : 'below';
        const vwapTrend = vwapDistance > 0 ? 'bullish' : 'bearish';
        return {
            direction: 'neutral',
            confidence: 30,
            reasoning: `Price ${position} VWAP (${vwapDistance > 0 ? '+' : ''}${vwapDistance.toFixed(2)}%). ${vwapTrend} bias. POC at $${volumeProfile.poc.toFixed(2)}. Delta: ${deltaBias}. Waiting for VWAP cross with volume or extreme band touch.`,
            indicators: {
                vwap: vwapData.vwap,
                anchoredVWAP,
                currentPrice,
                position,
                vwapDistance: vwapDistance.toFixed(2) + '%',
                poc: volumeProfile.poc,
                valueAreaHigh: volumeProfile.valueAreaHigh,
                valueAreaLow: volumeProfile.valueAreaLow,
                cumulativeDelta,
                deltaBias,
                currentVolume: currentCandle.volume,
                avgVolume: vwapData.totalVolume / cfg.sessionLength,
                upperBands: vwapData.upperBands.map(b => b.toFixed(2)),
                lowerBands: vwapData.lowerBands.map(b => b.toFixed(2))
            }
        };
    }
};
