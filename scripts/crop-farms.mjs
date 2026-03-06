import sharp from 'sharp';
import { mkdirSync } from 'fs';

const OUT = 'public/images/products/focused';
mkdirSync(OUT, { recursive: true });

const SRC = 'C:/Users/Anthony/.openclaw/media/browser/fbcb5a2e-54da-4ecc-b54b-bacf8dbbd65e.jpg';

async function crop(src, out, top, left, width, height) {
  const meta = await sharp(src).metadata();
  const t = Math.min(top, meta.height - 1);
  const l = Math.min(left, meta.width - 1);
  const w = Math.min(width, meta.width - l);
  const h = Math.min(height, meta.height - t);
  await sharp(src).extract({ top: t, left: l, width: w, height: h }).jpeg({ quality: 92 }).toFile(out);
  console.log(`✓ ${out} (${w}x${h})`);
}

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`Farms page: ${meta.width}x${meta.height}`);
  const W = meta.width;
  const third = Math.floor(W / 3);

  // 1. Farm Orchestration header ($529K capital, $187K P&L)
  await crop(SRC, `${OUT}/farm-orchestration-header.jpg`, 0, 0, W, 50);

  // 2. Top 3 farms row (HYPE VWAP, Renko, Heikin Ashi)
  await crop(SRC, `${OUT}/farm-cards-row.jpg`, 50, 0, W, 180);

  // 3. All 7 farms grid
  await crop(SRC, `${OUT}/all-farms-grid.jpg`, 50, 0, W, 460);

  // 4. HYPE VWAP farm card (hero farm — active, $184K, $104K P&L)
  await crop(SRC, `${OUT}/hype-vwap-farm.jpg`, 55, 0, third + 10, 170);

  // 5. Elliott Wave farm card
  await crop(SRC, `${OUT}/elliott-wave-farm.jpg`, 235, 0, third + 10, 170);

  // 6. Multi-Strategy farm card
  await crop(SRC, `${OUT}/multi-strategy-farm.jpg`, 235, third - 10, third + 20, 170);

  // 7. Farm P&L chart
  await crop(SRC, `${OUT}/farm-pnl-chart.jpg`, 510, W/2 - 10, W/2 + 10, 180);

  console.log('\nFarm crops done!');
}

main().catch(console.error);
