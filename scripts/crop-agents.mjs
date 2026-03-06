import sharp from 'sharp';
import { mkdirSync } from 'fs';

const OUT = 'public/images/products/focused';
mkdirSync(OUT, { recursive: true });

const SRC = 'C:/Users/Anthony/.openclaw/media/browser/c3fce3e7-55ae-4416-9ff8-c974ed7eadfa.jpg';

async function crop(src, out, top, left, width, height) {
  const meta = await sharp(src).metadata();
  const t = Math.min(top, meta.height - 1);
  const l = Math.min(left, meta.width - 1);
  const w = Math.min(width, meta.width - l);
  const h = Math.min(height, meta.height - t);
  await sharp(src)
    .extract({ top: t, left: l, width: w, height: h })
    .jpeg({ quality: 92 })
    .toFile(out);
  console.log(`✓ ${out} (${w}x${h})`);
}

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`Agents page: ${meta.width}x${meta.height}`);
  const W = meta.width;
  const half = Math.floor(W / 2);

  // 1. Demo Portfolio header (account value, margin, P&L)
  await crop(SRC, `${OUT}/portfolio-header.jpg`, 0, 0, W, 100);

  // 2. Open positions list
  await crop(SRC, `${OUT}/agent-positions.jpg`, 55, 0, W, 160);

  // 3. Agent Command Center (all 6 cards)
  await crop(SRC, `${OUT}/agent-command-center.jpg`, 210, 0, W, 290);

  // 4. VWAP Momentum Alpha card (individual agent focus)
  await crop(SRC, `${OUT}/vwap-agent-card.jpg`, 260, 0, half + 20, 160);

  // 5. Elliott Wave Scanner card
  await crop(SRC, `${OUT}/elliott-wave-card.jpg`, 260, half - 30, half + 30, 160);

  // 6. Darvas Box Breakout card  
  await crop(SRC, `${OUT}/darvas-box-card.jpg`, 260, W - half - 10, half + 10, 160);

  // 7. Heikin Ashi card
  await crop(SRC, `${OUT}/heikin-ashi-card.jpg`, 410, 0, half + 20, 160);

  // 8. Mean Reversion + Macro Sentiment cards
  await crop(SRC, `${OUT}/mean-reversion-macro-cards.jpg`, 410, half - 30, half + 30, 160);

  // 9. Agent performance charts (Balances + P&L + Win Rate)
  await crop(SRC, `${OUT}/agent-performance-charts.jpg`, 560, 0, W, 170);

  // 10. Live Decision Stream
  await crop(SRC, `${OUT}/live-decision-stream.jpg`, 720, 0, half + 20, 170);

  // 11. Market Analysis (Signal Consensus)
  await crop(SRC, `${OUT}/market-analysis-signal.jpg`, 720, half - 20, half + 20, 170);

  // 12. Trade History table
  await crop(SRC, `${OUT}/trade-history.jpg`, 885, 0, W, 280);

  console.log('\nAgent-focused crops done!');
}

main().catch(console.error);
