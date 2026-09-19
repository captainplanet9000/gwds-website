"use strict";
/**
 * Elliott Wave Pattern Strategy
 *
 * Implementation of Ralph Nelson Elliott's Wave Theory - identifying fractal wave patterns
 * in price movements based on market psychology and Fibonacci ratios.
 *
 * Core Principles:
 * - Markets move in 5-wave impulse patterns (1,2,3,4,5) followed by 3-wave corrections (A,B,C)
 * - Wave 2 never retraces more than 100% of wave 1
 * - Wave 3 is never the shortest impulse wave
 * - Wave 4 never overlaps wave 1 price territory
 * - Fibonacci ratios govern wave relationships
 *
 * This implementation uses swing highs/lows and Fibonacci analysis to identify wave counts
 * and generate high-probability entry signals at wave 2 and wave 4 completions.
 *
 * @author GWDS
 * @version 2.1.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = void 0;
/**
 * Find swing highs and lows (pivot points)
 */
function findSwingPoints(candles, lookback) {
    const swings = [];
    for (let i = lookback; i < candles.length - lookback; i++) {
        const candle = candles[i];
        // Check for swing high
        let isSwingHigh = true;
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && candles[j].high >= candle.high) {
                isSwingHigh = false;
                break;
            }
        }
        if (isSwingHigh) {
            swings.push({
                index: i,
                price: candle.high,
                type: 'high',
                timestamp: candle.timestamp
            });
            continue;
        }
        // Check for swing low
        let isSwingLow = true;
        for (let j = i - lookback; j <= i + lookback; j++) {
            if (j !== i && candles[j].low <= candle.low) {
                isSwingLow = false;
                break;
            }
        }
        if (isSwingLow) {
            swings.push({
                index: i,
                price: candle.low,
                type: 'low',
                timestamp: candle.timestamp
            });
        }
    }
    return swings;
}
/**
 * Calculate Fibonacci retracement level
 */
function fibRetrace(start, end, level) {
    return end - ((end - start) * level);
}
/**
 * Check if a retracement is within acceptable Fibonacci range
 */
function isValidFibRetrace(retrace, start, end, targetLevel, tolerance) {
    const actualRetrace = (end - retrace) / (end - start);
    const deviation = Math.abs(actualRetrace - targetLevel);
    return deviation <= tolerance;
}
/**
 * Validate Elliott Wave rules for an impulse pattern
 */
function validateImpulseWaves(w1, w2, w3, w4, w5, config) {
    const violations = [];
    let confidence = 100;
    // Rule 1: Wave 2 never retraces more than 100% of wave 1
    if (w2.end.price <= w1.start.price) {
        violations.push('Wave 2 retraced >100% of wave 1');
        return { valid: false, confidence: 0, violations };
    }
    // Rule 2: Wave 3 is never the shortest impulse wave
    const wave3Size = Math.abs(w3.size);
    const wave1Size = Math.abs(w1.size);
    const wave5Size = Math.abs(w5.size);
    if (wave3Size < wave1Size || wave3Size < wave5Size) {
        violations.push('Wave 3 is the shortest');
        return { valid: false, confidence: 0, violations };
    }
    // Rule 3: Wave 4 never enters territory of wave 1
    if (w4.end.price <= w1.end.price) {
        violations.push('Wave 4 overlaps wave 1');
        return { valid: false, confidence: 0, violations };
    }
    // Guideline checks (reduce confidence, don't invalidate)
    // Wave 2 typically retraces 50-61.8% of wave 1
    const w2Retrace = (w1.end.price - w2.end.price) / (w1.end.price - w1.start.price);
    if (w2Retrace < 0.5 || w2Retrace > 0.618) {
        confidence -= 10;
    }
    else {
        confidence += 5; // Bonus for ideal retrace
    }
    // Wave 3 typically 1.618x wave 1
    const w3Ratio = wave3Size / wave1Size;
    const deviation = Math.abs(w3Ratio - config.wave3IdealMultiplier) / config.wave3IdealMultiplier;
    if (deviation > config.maxWaveDeviation / 100) {
        confidence -= 15;
    }
    else {
        confidence += 10; // Bonus for Fibonacci ratio
    }
    // Wave 4 typically retraces 38.2% of wave 3
    const w4Retrace = (w3.end.price - w4.end.price) / (w3.end.price - w3.start.price);
    if (w4Retrace < 0.3 || w4Retrace > 0.5) {
        confidence -= 10;
    }
    else {
        confidence += 5;
    }
    // Wave 5 typically equals wave 1
    const w5Ratio = wave5Size / wave1Size;
    const w5Deviation = Math.abs(w5Ratio - config.wave5IdealRatio) / config.wave5IdealRatio;
    if (w5Deviation > 0.3) {
        confidence -= 10;
    }
    else {
        confidence += 5;
    }
    return { valid: true, confidence: Math.max(0, Math.min(100, confidence)), violations };
}
/**
 * Attempt to identify 5-wave impulse pattern from swing points
 */
function identifyImpulsePattern(swings, config, currentPrice) {
    if (swings.length < 6)
        return null;
    // Look for most recent 5-wave structure
    // Pattern: low -> high -> low -> high -> low -> high (bullish impulse)
    for (let i = swings.length - 1; i >= 5; i--) {
        // Start from most recent swing and work backwards
        if (swings[i].type !== 'high')
            continue; // Wave 5 end
        if (swings[i - 1].type !== 'low')
            continue; // Wave 4 end
        if (swings[i - 2].type !== 'high')
            continue; // Wave 3 end
        if (swings[i - 3].type !== 'low')
            continue; // Wave 2 end
        if (swings[i - 4].type !== 'high')
            continue; // Wave 1 end
        if (swings[i - 5].type !== 'low')
            continue; // Wave 1 start
        const wave1 = {
            start: swings[i - 5],
            end: swings[i - 4],
            size: swings[i - 4].price - swings[i - 5].price,
            sizePercent: ((swings[i - 4].price - swings[i - 5].price) / swings[i - 5].price) * 100,
            label: '1'
        };
        const wave2 = {
            start: swings[i - 4],
            end: swings[i - 3],
            size: swings[i - 3].price - swings[i - 4].price,
            sizePercent: ((swings[i - 3].price - swings[i - 4].price) / swings[i - 4].price) * 100,
            label: '2'
        };
        const wave3 = {
            start: swings[i - 3],
            end: swings[i - 2],
            size: swings[i - 2].price - swings[i - 3].price,
            sizePercent: ((swings[i - 2].price - swings[i - 3].price) / swings[i - 3].price) * 100,
            label: '3',
            fibRatio: Math.abs((swings[i - 2].price - swings[i - 3].price) / (swings[i - 4].price - swings[i - 5].price))
        };
        const wave4 = {
            start: swings[i - 2],
            end: swings[i - 1],
            size: swings[i - 1].price - swings[i - 2].price,
            sizePercent: ((swings[i - 1].price - swings[i - 2].price) / swings[i - 2].price) * 100,
            label: '4'
        };
        const wave5 = {
            start: swings[i - 1],
            end: swings[i],
            size: swings[i].price - swings[i - 1].price,
            sizePercent: ((swings[i].price - swings[i - 1].price) / swings[i - 1].price) * 100,
            label: '5',
            fibRatio: Math.abs((swings[i].price - swings[i - 1].price) / (swings[i - 4].price - swings[i - 5].price))
        };
        // Check minimum wave sizes
        if (Math.abs(wave1.sizePercent) < config.minWaveSize)
            continue;
        if (Math.abs(wave3.sizePercent) < config.minWaveSize)
            continue;
        // Validate Elliott Wave rules
        const validation = validateImpulseWaves(wave1, wave2, wave3, wave4, wave5, config);
        if (validation.valid && validation.confidence >= config.minConfidence) {
            return {
                wave1,
                wave2,
                wave3,
                wave4,
                wave5,
                confidence: validation.confidence,
                degree: 'Minute',
                complete: currentPrice < wave5.end.price * 0.98 // Wave 5 completed if price dropped
            };
        }
    }
    return null;
}
/**
 * Check if we're at wave 2 or wave 4 completion (buy zones)
 */
function checkWaveCompletion(swings, currentPrice, config) {
    if (swings.length < 4)
        return { atWave2: false, atWave4: false };
    // Check for wave 2 completion (after wave 1 up)
    for (let i = swings.length - 1; i >= 3; i--) {
        if (swings[i].type === 'low' && swings[i - 1].type === 'high' && swings[i - 2].type === 'low') {
            const wave1Size = swings[i - 1].price - swings[i - 2].price;
            const wave2Retrace = swings[i - 1].price - swings[i].price;
            const retraceRatio = wave2Retrace / wave1Size;
            // Valid wave 2: 50-61.8% retrace, price near swing low
            if (retraceRatio >= 0.45 && retraceRatio <= 0.7 && currentPrice <= swings[i].price * 1.02) {
                const wave2 = {
                    start: swings[i - 1],
                    end: swings[i],
                    size: swings[i].price - swings[i - 1].price,
                    sizePercent: ((swings[i].price - swings[i - 1].price) / swings[i - 1].price) * 100,
                    label: '2'
                };
                return { atWave2: true, atWave4: false, wave: wave2 };
            }
        }
    }
    // Check for wave 4 completion (in established impulse)
    const impulse = identifyImpulsePattern(swings, config, currentPrice);
    if (impulse && !impulse.complete) {
        // Price near wave 4 end, wave 5 hasn't completed
        if (currentPrice <= impulse.wave4.end.price * 1.03 && currentPrice >= impulse.wave4.end.price * 0.97) {
            return { atWave2: false, atWave4: true, wave: impulse.wave4, impulse };
        }
    }
    return { atWave2: false, atWave4: false };
}
exports.strategy = {
    name: 'Elliott Wave Pattern',
    version: '2.1.1',
    description: 'Elliott Wave Theory implementation using swing point analysis and Fibonacci ratios. Identifies 5-wave impulse patterns and 3-wave corrections with strict rule validation. Signals entries at wave 2 and wave 4 completions.',
    author: 'GWDS',
    timeframes: ['1h', '4h', '1d'],
    defaultConfig: {
        swingLookback: 5,
        minWaveSize: 1.5,
        maxWaveDeviation: 15,
        wave3MinMultiplier: 1.0,
        wave3IdealMultiplier: 1.618,
        wave5IdealRatio: 1.0,
        fibRetrace618: 0.618,
        fibRetrace50: 0.5,
        fibRetrace382: 0.382,
        minConfidence: 60,
        degreeLabels: ['Minute', 'Minor', 'Intermediate']
    },
    execute(candles, config) {
        const cfg = { ...this.defaultConfig, ...config };
        if (candles.length < 50) {
            return {
                direction: 'neutral',
                confidence: 0,
                reasoning: 'Insufficient data for Elliott Wave analysis (need 50+ candles)',
                indicators: { dataPoints: candles.length }
            };
        }
        const currentCandle = candles[candles.length - 1];
        const currentPrice = currentCandle.close;
        // Identify swing points
        const swings = findSwingPoints(candles, cfg.swingLookback);
        // Look for complete 5-wave impulse pattern
        const impulse = identifyImpulsePattern(swings, cfg, currentPrice);
        // Check if we're at a wave completion (entry point)
        const completion = checkWaveCompletion(swings, currentPrice, cfg);
        // SIGNAL: Wave 2 completion - anticipating wave 3
        if (completion.atWave2 && completion.wave) {
            const entry = currentPrice;
            const stopLoss = completion.wave.end.price * 0.98; // Below wave 2 low
            const wave1Start = swings[swings.length - 3].price;
            const wave1End = swings[swings.length - 2].price;
            const wave1Size = wave1End - wave1Start;
            const takeProfit = entry + (wave1Size * cfg.wave3IdealMultiplier); // Target wave 3 = 1.618x wave 1
            return {
                direction: 'long',
                confidence: 75,
                reasoning: `Wave 2 completion detected at ${(completion.wave.sizePercent).toFixed(1)}% retrace. Anticipating wave 3 rally. Entry at wave 2 low with stop below. Target: wave 3 = 1.618x wave 1 = $${takeProfit.toFixed(2)}`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    waveCount: '2',
                    wave2Retrace: completion.wave.sizePercent.toFixed(1) + '%',
                    expectedWave3Target: takeProfit,
                    swingPoints: swings.length,
                    currentWave: 'Entering Wave 3'
                }
            };
        }
        // SIGNAL: Wave 4 completion - anticipating wave 5
        if (completion.atWave4 && completion.wave && completion.impulse) {
            const entry = currentPrice;
            const stopLoss = completion.wave.end.price * 0.98; // Below wave 4 low
            const wave1Size = Math.abs(completion.impulse.wave1.size);
            const takeProfit = entry + (wave1Size * cfg.wave5IdealRatio); // Target wave 5 = wave 1
            return {
                direction: 'long',
                confidence: completion.impulse.confidence,
                reasoning: `Wave 4 completion in ${completion.impulse.confidence}% confidence impulse. Anticipating wave 5 (final rally). Wave 3 was ${completion.impulse.wave3.fibRatio?.toFixed(2)}x wave 1. Target wave 5 = wave 1 = $${takeProfit.toFixed(2)}`,
                entry,
                stopLoss,
                takeProfit,
                indicators: {
                    waveCount: '4',
                    impulseConfidence: completion.impulse.confidence,
                    wave3Ratio: completion.impulse.wave3.fibRatio,
                    wave4Retrace: completion.wave.sizePercent.toFixed(1) + '%',
                    expectedWave5Target: takeProfit,
                    currentWave: 'Entering Wave 5'
                }
            };
        }
        // SIGNAL: Wave 5 completion - correction expected
        if (impulse && impulse.complete) {
            return {
                direction: 'short',
                confidence: impulse.confidence * 0.8, // Slightly lower confidence for corrections
                reasoning: `Wave 5 completed at $${impulse.wave5.end.price.toFixed(2)}. 5-wave impulse finished with ${impulse.confidence}% confidence. Expecting ABC correction. Exit longs, consider short.`,
                entry: currentPrice,
                stopLoss: impulse.wave5.end.price * 1.02,
                takeProfit: impulse.wave4.end.price, // Target wave 4 level (typical A-wave)
                indicators: {
                    waveCount: '5 Complete',
                    impulseConfidence: impulse.confidence,
                    wave5End: impulse.wave5.end.price,
                    correctionTarget: impulse.wave4.end.price,
                    currentPhase: 'Correction Expected'
                }
            };
        }
        // MONITORING: Impulse in progress
        if (impulse && !impulse.complete) {
            return {
                direction: 'neutral',
                confidence: impulse.confidence * 0.6,
                reasoning: `${impulse.confidence}% confidence impulse pattern detected. Currently in wave 5 formation. Monitoring for completion. Wave 3 was ${impulse.wave3.fibRatio?.toFixed(2)}x wave 1.`,
                indicators: {
                    impulseActive: true,
                    confidence: impulse.confidence,
                    currentWave: 'Wave 5 in progress',
                    wave3Ratio: impulse.wave3.fibRatio,
                    wave5Ratio: impulse.wave5.fibRatio,
                    wave5Target: impulse.wave4.end.price + Math.abs(impulse.wave1.size)
                }
            };
        }
        // No clear pattern
        return {
            direction: 'neutral',
            confidence: 0,
            reasoning: `No valid Elliott Wave pattern identified. Found ${swings.length} swing points, but no impulse pattern meets confidence threshold (${cfg.minConfidence}%). Market structure unclear.`,
            indicators: {
                swingPoints: swings.length,
                minConfidence: cfg.minConfidence,
                recentSwings: swings.slice(-5).map(s => ({ price: s.price, type: s.type }))
            }
        };
    }
};
