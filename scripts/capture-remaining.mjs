// This script crops focused shots from already-saved full screenshots
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const OUT = 'public/images/products/focused';
mkdirSync(OUT, { recursive: true });

async function crop(src, out, top, left, width, height) {
  const meta = await sharp(src).metadata();
  const t = Math.min(Math.max(0, top), meta.height - 1);
  const l = Math.min(Math.max(0, left), meta.width - 1);
  const w = Math.min(width, meta.width - l);
  const h = Math.min(height, meta.height - t);
  await sharp(src).extract({ top: t, left: l, width: w, height: h }).jpeg({ quality: 92 }).toFile(out);
  console.log(`✓ ${out} (${w}x${h})`);
}

async function main() {
  // ===== PERFORMANCE PAGE =====
  const PERF = 'C:/Users/Anthony/.openclaw/media/browser/975ee967-b612-48bd-b753-2aa734dc0eda.jpg';
  let meta = await sharp(PERF).metadata();
  console.log(`\nPerformance: ${meta.width}x${meta.height}`);
  // Stats bar + cumulative P&L chart
  await crop(PERF, `${OUT}/perf-stats-pnl.jpg`, 0, 0, meta.width, 500);
  // Agent leaderboard
  await crop(PERF, `${OUT}/agent-leaderboard.jpg`, 500, 0, meta.width, 500);

  // ===== ANALYTICS PAGE =====
  const ANALYTICS = 'C:/Users/Anthony/.openclaw/media/browser/850d716b-4a77-410b-b5ae-17151697ac0b.jpg';
  meta = await sharp(ANALYTICS).metadata();
  console.log(`\nAnalytics: ${meta.width}x${meta.height}`);
  // Return + strategies + uptime stats
  await crop(ANALYTICS, `${OUT}/analytics-stats.jpg`, 0, 0, meta.width, 200);
  // Correlation matrix
  await crop(ANALYTICS, `${OUT}/correlation-matrix.jpg`, 290, 0, meta.width, 320);
  // Best/worst strategy + P&L comparison
  await crop(ANALYTICS, `${OUT}/strategy-comparison.jpg`, 590, 0, meta.width, 250);
  // Strategy rankings table
  await crop(ANALYTICS, `${OUT}/strategy-rankings.jpg`, 830, 0, meta.width, 250);

  // ===== STRATEGY PERFORMANCE PAGE =====
  const STRAT = 'C:/Users/Anthony/.openclaw/media/browser/d955233e-3140-489c-884e-56c9d3e2ed2e.jpg';
  meta = await sharp(STRAT).metadata();
  console.log(`\nStrategy Perf: ${meta.width}x${meta.height}`);
  // Top stats (trades, P&L, health, issues)
  await crop(STRAT, `${OUT}/strategy-perf-header.jpg`, 0, 0, meta.width, 160);
  // Darvas Box strategy detail
  await crop(STRAT, `${OUT}/darvas-strategy-detail.jpg`, 140, 0, meta.width, 200);
  // Elliott Wave strategy detail
  await crop(STRAT, `${OUT}/elliott-strategy-detail.jpg`, 310, 0, meta.width, 190);
  // VWAP strategy detail
  await crop(STRAT, `${OUT}/vwap-strategy-detail.jpg`, 480, 0, meta.width, 180);

  // ===== POSITION MONITOR =====
  const POS = 'C:/Users/Anthony/.openclaw/media/browser/ac078197-dc5c-4b0c-a712-defa10c0044e.jpg';
  meta = await sharp(POS).metadata();
  console.log(`\nPosition Monitor: ${meta.width}x${meta.height}`);
  // Risk stats header
  await crop(POS, `${OUT}/risk-stats-header.jpg`, 0, 0, meta.width, 200);
  // Position risk table
  await crop(POS, `${OUT}/position-risk-table.jpg`, 240, 0, meta.width, 400);

  // ===== PLUGINS PAGE =====
  const PLUGINS = 'C:/Users/Anthony/.openclaw/media/browser/8b5a0a2a-0b95-4782-bd94-ebc2df04c5d3.jpg';
  meta = await sharp(PLUGINS).metadata();
  console.log(`\nPlugins: ${meta.width}x${meta.height}`);
  // Plugin marketplace grid
  await crop(PLUGINS, `${OUT}/plugin-marketplace.jpg`, 0, 0, meta.width, 600);
  // Meme Trading plugin card
  await crop(PLUGINS, `${OUT}/meme-plugin-card.jpg`, 140, 0, Math.floor(meta.width/3)+10, 260);
  // Elliott Wave plugin card  
  await crop(PLUGINS, `${OUT}/elliott-plugin-card.jpg`, 140, Math.floor(meta.width/3)-10, Math.floor(meta.width/3)+20, 260);
  // Flash Loan plugin card
  await crop(PLUGINS, `${OUT}/flash-loan-plugin-card.jpg`, 140, Math.floor(meta.width*2/3)-10, Math.floor(meta.width/3)+10, 260);

  // ===== ORDER FLOW PAGE =====
  const FLOW = 'C:/Users/Anthony/.openclaw/media/browser/41055df2-9db2-4f99-b3d9-205d30fe3a2a.jpg';
  meta = await sharp(FLOW).metadata();
  console.log(`\nOrder Flow: ${meta.width}x${meta.height}`);
  // Whale activity + price header
  await crop(FLOW, `${OUT}/whale-activity-header.jpg`, 0, 0, meta.width, 200);
  // Whale trades table
  await crop(FLOW, `${OUT}/whale-trades.jpg`, 180, 0, meta.width, 250);
  // Volume profile + trade clusters
  await crop(FLOW, `${OUT}/volume-profile.jpg`, 410, 0, meta.width, 350);

  // ===== SYSTEM STATUS =====
  const STATUS = 'C:/Users/Anthony/.openclaw/media/browser/5709bd9e-7135-4781-a6b6-999a506f7e8f.jpg';
  meta = await sharp(STATUS).metadata();
  console.log(`\nSystem Status: ${meta.width}x${meta.height}`);
  // Health checks + colored cards
  await crop(STATUS, `${OUT}/system-health.jpg`, 0, 0, meta.width, 400);

  // ===== CORRELATION =====
  const CORR = 'C:/Users/Anthony/.openclaw/media/browser/ecd3379d-3cdc-40e8-9cc7-392f25c4d4e8.jpg';
  meta = await sharp(CORR).metadata();
  console.log(`\nCorrelation: ${meta.width}x${meta.height}`);
  // Correlation matrix heatmap
  await crop(CORR, `${OUT}/correlation-heatmap.jpg`, 130, 0, meta.width, 350);
  // Most correlated pairs
  await crop(CORR, `${OUT}/correlated-pairs.jpg`, 470, 0, meta.width, 250);

  console.log('\n✅ All focused crops complete!');
}

main().catch(console.error);
