# Generation Notes

## Workflow

Creative raster masters were generated with OpenAI's built-in GPT image-generation tool. Exact Twitch dimensions, approved brand marks, typography, labels, safe areas, and exports were then composed deterministically with SVG and Sharp.

The generated masters were copied into `masters/`; the original generated files remain in the Codex image-generation directory.

## Broadcast background prompt

Use case: stylized-concept. Asset type: premium 4K Twitch broadcast background master for Cival Systems. Create a cinematic abstract AI trading infrastructure control-room backdrop suggesting coordinated software agents, market-depth structure, and flowing system telemetry. Use a deep near-black Cival Black `#06110e` field fading into Deep System Green `#0b1f19`, with a subtle perspective grid, sparse circuit traces, orderly translucent depth bars, small data particles, and a restrained luminous system-core form in the far-right background. The style should feel like sophisticated enterprise fintech broadcast graphics: polished 3D plus fine vector-like circuitry, calm and inspectable, not flashy or casino-like. Use a 16:9 landscape composition with generous low-detail negative space through the center and left. Use restrained Hyperliquid Green `#4ade9f` and Signal Mint `#7fffc8` glow. No words, letters, logos, people, coin symbols, candlestick charts, profit arrows, watermarks, or borders.

## Agent-core prompt

Use case: visual-asset. Asset type: transparent-background broadcast icon and emote master. Create a single compact Cival Systems agent-core object: a precise dark glass cube with beveled corners, a small luminous mint central node, and three subtle circuit paths that imply coordinated AI software agents. Use a premium clean 3D product-icon style that remains legible at tiny sizes. Center the object on a genuine transparent-alpha background with generous padding. Use near-black glass, dark-green metal, Hyperliquid Green `#4ade9f`, and Signal Mint `#7fffc8`. No environment, text, letters, logo, coin, currency symbol, chart, or watermark.

## Human-reviewed decisions

- Removed the stream brand lockup from the top-left product overlay because it competed with the product's own navigation.
- Retained a small paper-mode status in the upper-right and a bottom disclosure rail.
- Kept the background’s highest visual energy on the far right so scene copy remains legible.
- Made alert usernames a dynamic safe area instead of baking fictional names into the artwork.
- Used deterministic vector subscriber badges because highly detailed raster artwork does not remain legible at 18 px.

