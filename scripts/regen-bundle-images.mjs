// Regenerate bundle value images with correct pricing
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'images', 'products', 'store');

const W = 1200, H = 800;
const COLORS = {
  bg: '#050508', bgLight: '#0c0c12', card: '#0f0f18', border: '#1a1a2e',
  purple: '#8B5CF6', cyan: '#06B6D4', green: '#10B981',
  red: '#EF4444', amber: '#F59E0B', white: '#F5F5F7',
  gray: '#B0B8C4', muted: '#8B95A5', dim: '#4B5563',
  pink: '#EC4899', blue: '#3B82F6', indigo: '#6366F1', orange: '#F97316',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(139,92,246,0.04)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}
function drawGlow(ctx, x, y, r, color) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, color + '25'); grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function drawBG(ctx, color) {
  ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H); drawGlow(ctx, W * 0.3, H * 0.4, 400, color);
}
function drawBottomBar(ctx, color) {
  const g = ctx.createLinearGradient(0, H - 4, W, H - 4);
  g.addColorStop(0, color); g.addColorStop(0.5, COLORS.cyan); g.addColorStop(1, color);
  ctx.fillStyle = g; ctx.fillRect(0, H - 4, W, 4);
}

function bundleImage(name, products, totalValue, bundlePrice, savings, accent, fileName) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, accent);
  
  ctx.font = 'bold 44px Arial'; ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center'; ctx.fillText(name, W / 2, 70);
  
  const colW = 350, startY = 120;
  products.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 60 + col * (colW + 30), y = startY + row * 90;
    ctx.fillStyle = COLORS.card;
    roundRect(ctx, x, y, colW, 78, 10); ctx.fill();
    ctx.strokeStyle = p.color + '30'; ctx.lineWidth = 1;
    roundRect(ctx, x, y, colW, 78, 10); ctx.stroke();
    ctx.fillStyle = p.color; ctx.fillRect(x, y, 4, 78);
    ctx.textAlign = 'left'; ctx.font = 'bold 16px Arial'; ctx.fillStyle = COLORS.white;
    ctx.fillText(p.name, x + 20, y + 32);
    ctx.font = '13px Arial'; ctx.fillStyle = COLORS.muted;
    ctx.fillText(p.desc, x + 20, y + 54);
    ctx.textAlign = 'right'; ctx.font = 'bold 18px Arial'; ctx.fillStyle = COLORS.dim;
    ctx.fillText(`$${p.price}`, x + colW - 20, y + 44);
    const tw = ctx.measureText(`$${p.price}`).width;
    ctx.strokeStyle = COLORS.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + colW - 20 - tw - 4, y + 40); ctx.lineTo(x + colW - 16, y + 40); ctx.stroke();
    ctx.textAlign = 'left';
  });
  
  const vy = products.length <= 3 ? 350 : products.length <= 6 ? 440 : 530;
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 200, vy, 800, 220, 16); ctx.fill();
  ctx.strokeStyle = accent + '40'; ctx.lineWidth = 2;
  roundRect(ctx, 200, vy, 800, 220, 16); ctx.stroke();
  ctx.textAlign = 'center';
  
  ctx.font = '24px Arial'; ctx.fillStyle = COLORS.dim;
  ctx.fillText('Total Value', W / 2 - 200, vy + 50);
  ctx.font = 'bold 48px Arial'; ctx.fillStyle = COLORS.dim;
  ctx.fillText(`$${totalValue}`, W / 2 - 200, vy + 100);
  ctx.strokeStyle = COLORS.red; ctx.lineWidth = 3;
  const tvw = ctx.measureText(`$${totalValue}`).width;
  ctx.beginPath(); ctx.moveTo(W / 2 - 200 - tvw / 2 - 10, vy + 92); ctx.lineTo(W / 2 - 200 + tvw / 2 + 10, vy + 92); ctx.stroke();
  
  ctx.font = '48px Arial'; ctx.fillStyle = COLORS.dim; ctx.fillText('→', W / 2, vy + 95);
  ctx.font = '24px Arial'; ctx.fillStyle = accent; ctx.fillText('Bundle Price', W / 2 + 200, vy + 50);
  ctx.font = 'bold 64px Arial'; ctx.fillStyle = accent; ctx.fillText(`$${bundlePrice}`, W / 2 + 200, vy + 110);
  
  ctx.fillStyle = COLORS.green + '20';
  roundRect(ctx, W / 2 - 100, vy + 150, 200, 48, 24); ctx.fill();
  ctx.font = 'bold 20px Arial'; ctx.fillStyle = COLORS.green;
  ctx.fillText(`Save $${savings}`, W / 2, vy + 181);
  
  drawBottomBar(ctx, accent);
  writeFileSync(join(OUT, fileName), c.toBuffer('image/png'));
  console.log(`  ✓ ${fileName}`);
}

console.log('Regenerating bundle images with updated pricing...\n');

// Multi-Strategy: 6 agents × $199 = $1,194 → $399 (save $795)
bundleImage('Multi-Strategy Bundle', [
  { name: 'Darvas Box Agent', desc: 'Automated breakout detection', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'AI wave counting', price: '199', color: COLORS.indigo },
  { name: 'VWAP Breakout Agent', desc: 'Volume analysis', price: '199', color: COLORS.green },
  { name: 'Heikin Ashi Agent', desc: 'Trend following', price: '199', color: COLORS.amber },
  { name: 'Mean Reversion Agent', desc: 'Bollinger + RSI', price: '199', color: COLORS.purple },
  { name: 'Macro Sentiment Agent', desc: 'Fed + on-chain', price: '199', color: COLORS.pink },
], '1,194', '399', '795', COLORS.green, 'multi-strat-value.png');

// Full Stack: Dashboard $149 + Darvas $199 + Elliott $199 = $547 → $299 (save $248)
bundleImage('The Full Stack Trader', [
  { name: 'AI Trading Dashboard', desc: 'Complete dashboard platform', price: '149', color: COLORS.purple },
  { name: 'Darvas Box Agent', desc: 'Breakout detection strategy', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'Wave pattern analysis', price: '199', color: COLORS.indigo },
], '547', '299', '248', COLORS.cyan, 'full-stack-value.png');

// Everything: $149 + $99 + $99 + 6×$199 = $1,541 → $699 (save $842)
bundleImage('GWDS Everything Bundle', [
  { name: 'AI Trading Dashboard', desc: 'Full dashboard platform', price: '149', color: COLORS.purple },
  { name: 'Meme Trading Suite', desc: 'Token scanner + strategies', price: '99', color: COLORS.orange },
  { name: 'Flash Loan Engine', desc: 'Cross-DEX arbitrage', price: '99', color: COLORS.cyan },
  { name: 'Darvas Box Agent', desc: 'Breakout detection', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'Wave counting', price: '199', color: COLORS.indigo },
  { name: 'VWAP Breakout Agent', desc: 'Volume analysis', price: '199', color: COLORS.green },
  { name: 'Heikin Ashi Agent', desc: 'Trend following', price: '199', color: COLORS.amber },
  { name: 'Mean Reversion Agent', desc: 'Bollinger + RSI', price: '199', color: COLORS.purple },
  { name: 'Macro Sentiment Agent', desc: 'Fed + on-chain', price: '199', color: COLORS.pink },
], '1,541', '699', '842', COLORS.amber, 'everything-value.png');

console.log('\n✅ Bundle images regenerated!');
