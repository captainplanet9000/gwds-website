import sharp from 'sharp';
import { mkdirSync } from 'fs';

const OUT = 'public/images/products/focused';
mkdirSync(OUT, { recursive: true });

// Source screenshots (full page, no sidebar)
const OVERVIEW = 'C:/Users/Anthony/.openclaw/media/browser/47d66d0b-ce43-4c90-bae1-eb2b1182f5fa.jpg';

async function crop(src, out, top, left, width, height) {
  const meta = await sharp(src).metadata();
  // Clamp
  const t = Math.min(top, meta.height - 1);
  const l = Math.min(left, meta.width - 1);
  const w = Math.min(width, meta.width - l);
  const h = Math.min(height, meta.height - t);
  await sharp(src)
    .extract({ top: t, left: l, width: w, height: h })
    .jpeg({ quality: 90 })
    .toFile(out);
  console.log(`✓ ${out} (${w}x${h})`);
}

async function main() {
  const meta = await sharp(OVERVIEW).metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);
  const W = meta.width;

  // 1. Portfolio stats bar (top ~120px)
  await crop(OVERVIEW, `${OUT}/stats-bar.jpg`, 20, 0, W, 140);

  // 2. Equity curve + allocation (next section ~120-340)  
  await crop(OVERVIEW, `${OUT}/equity-curve.jpg`, 145, 0, W, 230);

  // 3. Open positions table
  await crop(OVERVIEW, `${OUT}/open-positions.jpg`, 370, 0, W, 340);

  // 4. Agent scratchpad + Farm coordinator (inter-agent comms)
  await crop(OVERVIEW, `${OUT}/agent-comms.jpg`, 700, 0, W, 260);

  // 5. Active agents grid (6 agents)
  await crop(OVERVIEW, `${OUT}/active-agents-grid.jpg`, 950, 0, W, 170);

  // 6. CTA section
  await crop(OVERVIEW, `${OUT}/upsell-cta.jpg`, 1110, 0, W, 140);

  console.log('\nDone! Now need to capture focused shots from other pages...');
}

main().catch(console.error);
