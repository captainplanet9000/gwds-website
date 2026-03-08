// Generate OG images for GWDS using Node.js canvas
// Run: node scripts/generate-og.mjs

import { createCanvas, registerFont } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images');

function generateMainOG() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background - dark with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#07070D');
  bgGrad.addColorStop(0.5, '#0F0F1A');
  bgGrad.addColorStop(1, '#07070D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Accent glow top-left
  const glow1 = ctx.createRadialGradient(200, 100, 0, 200, 100, 300);
  glow1.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
  glow1.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 500, 400);

  // Accent glow bottom-right
  const glow2 = ctx.createRadialGradient(1000, 500, 0, 1000, 500, 300);
  glow2.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
  glow2.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(700, 300, 500, 330);

  // GWDS logo text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // "GWDS" large
  ctx.font = 'bold 96px Arial, Helvetica, sans-serif';
  const letters = [
    { char: 'G', color: '#8B5CF6' },
    { char: 'W', color: '#A78BFA' },
    { char: 'D', color: '#C4B5FD' },
    { char: 'S', color: '#F8FAFC' },
  ];
  let x = 80;
  const y = 120;
  for (const l of letters) {
    ctx.fillStyle = l.color;
    ctx.fillText(l.char, x, y);
    x += ctx.measureText(l.char).width + 2;
  }

  // Tagline
  ctx.font = 'bold 28px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('AI Trading Tools & Autonomous Agents', 84, 235);

  // Divider line
  const lineGrad = ctx.createLinearGradient(80, 285, 500, 285);
  lineGrad.addColorStop(0, '#8B5CF6');
  lineGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, 285); ctx.lineTo(500, 285); ctx.stroke();

  // Product highlights
  const products = [
    { emoji: '📊', name: 'AI Trading Dashboard', price: '$149' },
    { emoji: '🎯', name: '6 Autonomous Agents', price: 'from $199' },
    { emoji: '⚡', name: 'Flash Loan Arbitrage', price: '$99' },
    { emoji: '🔥', name: 'Everything Bundle', price: '$899' },
  ];

  let py = 310;
  for (const p of products) {
    // Product pill background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    roundRect(ctx, 80, py, 480, 44, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, 80, py, 480, 44, 8);
    ctx.stroke();

    ctx.font = '20px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'left';
    ctx.fillText(`${p.emoji}  ${p.name}`, 100, py + 14);
    
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.price, 540, py + 15);
    ctx.textAlign = 'left';
    
    py += 58;
  }

  // Right side - stats/social proof
  ctx.font = 'bold 72px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#8B5CF6';
  ctx.textAlign = 'center';
  ctx.fillText('12', 900, 160);
  ctx.font = '22px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Trading Tools', 900, 245);

  ctx.font = 'bold 72px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#06B6D4';
  ctx.fillText('2.4K+', 900, 340);
  ctx.font = '22px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Source Files', 900, 425);

  // URL at bottom
  ctx.font = 'bold 24px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#8B5CF6';
  ctx.textAlign = 'center';
  ctx.fillText('gwds.app', 600, 560);

  // Bottom border accent
  const bottomGrad = ctx.createLinearGradient(0, H - 4, W, H - 4);
  bottomGrad.addColorStop(0, '#8B5CF6');
  bottomGrad.addColorStop(0.5, '#06B6D4');
  bottomGrad.addColorStop(1, '#8B5CF6');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H - 4, W, 4);

  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(OUT_DIR, 'og-image.png'), buf);
  console.log('Generated: og-image.png (1200x630)');
}

function generateStoreOG() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#07070D');
  bgGrad.addColorStop(1, '#0F0F1A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)';
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Glow
  const glow = ctx.createRadialGradient(600, 200, 0, 600, 200, 400);
  glow.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
  glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(200, 0, 800, 500);

  // Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 64px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText('GWDS Store', 600, 160);

  ctx.font = '28px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('AI Trading Agents & Dashboard Templates', 600, 220);

  // Product grid - 4 columns
  const cols = [
    { name: 'Dashboard', price: '$149', color: '#8B5CF6' },
    { name: 'Meme Suite', price: '$499', color: '#F59E0B' },
    { name: 'Flash Loans', price: '$99', color: '#06B6D4' },
    { name: '6 Agents', price: '$199 ea', color: '#10B981' },
  ];
  
  const cardW = 230, cardH = 180, gap = 30;
  const startX = (W - (cardW * 4 + gap * 3)) / 2;
  
  cols.forEach((col, i) => {
    const cx = startX + i * (cardW + gap);
    const cy = 280;
    
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    roundRect(ctx, cx, cy, cardW, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = col.color + '40';
    ctx.lineWidth = 1;
    roundRect(ctx, cx, cy, cardW, cardH, 12);
    ctx.stroke();

    // Color accent top
    ctx.fillStyle = col.color;
    ctx.fillRect(cx + 20, cy + 20, 40, 4);

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(col.name, cx + 20, cy + 55);

    ctx.font = 'bold 32px Arial, Helvetica, sans-serif';
    ctx.fillStyle = col.color;
    ctx.fillText(col.price, cx + 20, cy + 105);
  });

  // URL
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#8B5CF6';
  ctx.fillText('gwds.app/store', 600, 540);

  // Bottom bar
  const bottomGrad = ctx.createLinearGradient(0, H - 4, W, H - 4);
  bottomGrad.addColorStop(0, '#8B5CF6');
  bottomGrad.addColorStop(0.5, '#06B6D4');
  bottomGrad.addColorStop(1, '#8B5CF6');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H - 4, W, 4);

  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(OUT_DIR, 'og-store.png'), buf);
  console.log('Generated: og-store.png (1200x630)');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

generateMainOG();
generateStoreOG();
