// Generate product-specific store images for all 12 GWDS products
// Each product gets 3-4 unique images that visually sell its features
// Run: node scripts/generate-product-images.mjs

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'images', 'products', 'store');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const W = 1200, H = 800;

const COLORS = {
  bg: '#050508', bgLight: '#0c0c12', card: '#0f0f18', border: '#1a1a2e',
  purple: '#8B5CF6', purpleLight: '#A78BFA', purpleDark: '#6D28D9',
  cyan: '#06B6D4', green: '#10B981', greenLight: '#34D399',
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

function drawGrid(ctx, w, h, color = 'rgba(139,92,246,0.04)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawGlow(ctx, x, y, r, color) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, color + '25');
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawBG(ctx, accentColor = COLORS.purple) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H);
  drawGlow(ctx, W * 0.3, H * 0.4, 400, accentColor);
}

function drawStatCard(ctx, x, y, w, h, label, value, valueColor) {
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.font = '12px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = 'left';
  ctx.fillText(label.toUpperCase(), x + 16, y + 28);
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = valueColor;
  ctx.fillText(value, x + 16, y + 60);
}

function drawBottomBar(ctx, color) {
  const g = ctx.createLinearGradient(0, H - 4, W, H - 4);
  g.addColorStop(0, color); g.addColorStop(0.5, COLORS.cyan); g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, H - 4, W, 4);
}

function save(canvas, name) {
  writeFileSync(join(OUT, name), canvas.toBuffer('image/png'));
  console.log(`  ✓ ${name}`);
}

// ========== 1. AI TRADING DASHBOARD ==========
function dashboardHero() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, COLORS.purple);
  
  // Mock dashboard layout
  // Stats row
  const stats = [
    { label: 'Portfolio', value: '$184,239', color: COLORS.white },
    { label: "Today's P&L", value: '+$3,847', color: COLORS.green },
    { label: 'Win Rate', value: '68.4%', color: COLORS.amber },
    { label: 'Sharpe', value: '2.80', color: COLORS.cyan },
  ];
  stats.forEach((s, i) => drawStatCard(ctx, 40 + i * 285, 40, 265, 80, s.label, s.value, s.color));

  // Equity curve area
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 40, 140, 740, 320, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  roundRect(ctx, 40, 140, 740, 320, 12);
  ctx.stroke();
  ctx.font = '13px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = 'left';
  ctx.fillText('EQUITY CURVE — 30 DAY', 60, 170);
  
  // Draw fake curve
  ctx.beginPath();
  ctx.moveTo(60, 420);
  for (let i = 0; i < 700; i += 5) {
    const y = 420 - (50 + Math.sin(i * 0.015) * 30 + i * 0.25 + Math.random() * 10);
    ctx.lineTo(60 + i, y);
  }
  ctx.strokeStyle = COLORS.purple;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Fill under curve
  ctx.lineTo(760, 440);
  ctx.lineTo(60, 440);
  ctx.closePath();
  ctx.fillStyle = COLORS.purple + '15';
  ctx.fill();

  // Agent panel
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 800, 140, 360, 320, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  roundRect(ctx, 800, 140, 360, 320, 12);
  ctx.stroke();
  ctx.font = '13px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('ACTIVE AGENTS', 820, 170);
  
  const agents = [
    { name: 'Darvas Box', status: 'TRADING', pnl: '+$2,140', color: COLORS.green },
    { name: 'Elliott Wave', status: 'ANALYZING', pnl: '+$890', color: COLORS.cyan },
    { name: 'VWAP Breakout', status: 'TRADING', pnl: '+$1,205', color: COLORS.green },
    { name: 'Mean Reversion', status: 'WAITING', pnl: '+$412', color: COLORS.amber },
    { name: 'Heikin Ashi', status: 'TRADING', pnl: '-$200', color: COLORS.red },
    { name: 'Macro Sentiment', status: 'ANALYZING', pnl: '+$1,400', color: COLORS.green },
  ];
  agents.forEach((a, i) => {
    const ay = 185 + i * 42;
    ctx.fillStyle = i % 2 === 0 ? COLORS.bgLight : 'transparent';
    roundRect(ctx, 810, ay, 340, 38, 6);
    ctx.fill();
    // Status dot
    ctx.fillStyle = a.status === 'TRADING' ? COLORS.green : a.status === 'ANALYZING' ? COLORS.cyan : COLORS.amber;
    ctx.beginPath(); ctx.arc(830, ay + 19, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.white;
    ctx.fillText(a.name, 845, ay + 24);
    ctx.font = '11px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(a.status, 960, ay + 24);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = a.color;
    ctx.textAlign = 'right';
    ctx.fillText(a.pnl, 1140, ay + 24);
    ctx.textAlign = 'left';
  });

  // Open Positions table
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 40, 480, 1120, 280, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  roundRect(ctx, 40, 480, 1120, 280, 12);
  ctx.stroke();
  ctx.font = '13px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('OPEN POSITIONS', 60, 510);
  
  // Table header
  const cols = ['Pair', 'Side', 'Size', 'Entry', 'Current', 'P&L', 'Agent', 'Duration'];
  cols.forEach((c, i) => {
    ctx.font = '11px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(c, 60 + i * 140, 540);
  });
  
  const positions = [
    ['BTC/USDT', 'LONG', '0.15', '$67,240', '$68,420', '+$177', 'Darvas Box', '2h 14m'],
    ['ETH/USDT', 'LONG', '2.4', '$3,612', '$3,648', '+$86.4', 'Elliott Wave', '45m'],
    ['SOL/USDT', 'LONG', '12', '$142.80', '$145.20', '+$28.8', 'VWAP', '1h 32m'],
    ['BTC/USDT', 'SHORT', '0.08', '$68,900', '$68,420', '+$38.4', 'Mean Rev', '3h 05m'],
    ['DOGE/USDT', 'LONG', '5000', '$0.168', '$0.172', '+$20.0', 'Heikin Ashi', '5h 12m'],
  ];
  positions.forEach((row, ri) => {
    const ry = 558 + ri * 36;
    if (ri % 2 === 0) {
      ctx.fillStyle = COLORS.bgLight;
      roundRect(ctx, 50, ry - 4, 1100, 32, 4);
      ctx.fill();
    }
    row.forEach((cell, ci) => {
      ctx.font = ci === 5 ? 'bold 13px Arial' : '13px Arial';
      if (ci === 1) ctx.fillStyle = cell === 'LONG' ? COLORS.green : COLORS.red;
      else if (ci === 5) ctx.fillStyle = cell.startsWith('+') ? COLORS.green : COLORS.red;
      else ctx.fillStyle = COLORS.gray;
      ctx.fillText(cell, 60 + ci * 140, ry + 14);
    });
  });

  drawBottomBar(ctx, COLORS.purple);
  save(c, 'dashboard-command-center.png');
}

function dashboardThemes() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, COLORS.purple);
  
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center';
  ctx.fillText('43 Built-in Themes', W / 2, 70);
  ctx.font = '20px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('One click to completely transform your dashboard', W / 2, 105);
  
  // Theme cards grid (4x3)
  const themes = [
    { name: 'Cyberpunk', bg: '#0f0024', accent: '#FF00FF', text: '#E0E0FF' },
    { name: 'Emerald', bg: '#001a0d', accent: '#10B981', text: '#D1FAE5' },
    { name: 'Ocean', bg: '#001220', accent: '#06B6D4', text: '#CFFAFE' },
    { name: 'Sunset', bg: '#1a0800', accent: '#F97316', text: '#FFEDD5' },
    { name: 'Rose', bg: '#1a0010', accent: '#EC4899', text: '#FCE7F3' },
    { name: 'Midnight', bg: '#0a0a1a', accent: '#6366F1', text: '#E0E7FF' },
    { name: 'Terminal', bg: '#001400', accent: '#22C55E', text: '#00FF00' },
    { name: 'Gold Rush', bg: '#1a1400', accent: '#F59E0B', text: '#FEF3C7' },
    { name: 'Arctic', bg: '#0a1a2e', accent: '#38BDF8', text: '#E0F2FE' },
    { name: 'Blood Moon', bg: '#1a0000', accent: '#EF4444', text: '#FEE2E2' },
    { name: 'Lavender', bg: '#120018', accent: '#A78BFA', text: '#EDE9FE' },
    { name: 'Neon', bg: '#000a0a', accent: '#2DD4BF', text: '#CCFBF1' },
  ];
  
  themes.forEach((t, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 40 + col * 290, y = 140 + row * 210;
    
    // Card bg
    ctx.fillStyle = t.bg;
    roundRect(ctx, x, y, 270, 190, 12);
    ctx.fill();
    ctx.strokeStyle = t.accent + '40';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, 270, 190, 12);
    ctx.stroke();
    
    // Mini dashboard mock inside
    // Top bar
    ctx.fillStyle = t.accent + '20';
    roundRect(ctx, x + 10, y + 10, 250, 30, 6);
    ctx.fill();
    ctx.fillStyle = t.accent;
    ctx.beginPath(); ctx.arc(x + 25, y + 25, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px Arial';
    ctx.fillStyle = t.text;
    ctx.textAlign = 'left';
    ctx.fillText(t.name, x + 38, y + 29);
    
    // Stat boxes
    for (let s = 0; s < 3; s++) {
      ctx.fillStyle = t.accent + '10';
      roundRect(ctx, x + 10 + s * 83, y + 48, 77, 40, 6);
      ctx.fill();
      ctx.fillStyle = t.accent;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(['$184K', '+$3.8K', '68%'][s], x + 18 + s * 83, y + 73);
    }
    
    // Mini chart area
    ctx.fillStyle = t.accent + '08';
    roundRect(ctx, x + 10, y + 96, 250, 60, 6);
    ctx.fill();
    ctx.beginPath();
    for (let p = 0; p < 240; p += 4) {
      const py = y + 145 - (10 + Math.sin(p * 0.04 + i) * 8 + p * 0.08);
      if (p === 0) ctx.moveTo(x + 15 + p, py);
      else ctx.lineTo(x + 15 + p, py);
    }
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Theme name
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = t.text;
    ctx.textAlign = 'center';
    ctx.fillText(t.name, x + 135, y + 178);
    ctx.textAlign = 'left';
  });
  
  drawBottomBar(ctx, COLORS.purple);
  save(c, 'dashboard-themes-grid.png');
}

// ========== 2. MEME TRADING SUITE ==========
function memeScanner() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, COLORS.orange);
  
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'left';
  ctx.fillText('🔥 Token Scanner — Live Feed', 50, 60);
  ctx.font = '16px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('DexScreener integration · Real-time discovery · Multi-factor scoring', 50, 90);
  
  // Scanner table
  const headers = ['Token', 'Price', '5m %', '1h %', 'Volume', 'Liquidity', 'Score', 'Action'];
  const headerX = [50, 200, 340, 440, 540, 680, 820, 940];
  
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 30, 110, 1140, 50, 8);
  ctx.fill();
  headers.forEach((h, i) => {
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.textAlign = 'left';
    ctx.fillText(h.toUpperCase(), headerX[i], 142);
  });
  
  const tokens = [
    { name: 'PEPE', chain: 'ETH', price: '$0.00001847', m5: '+12.4%', h1: '+89.2%', vol: '$4.2M', liq: '$8.1M', score: '94', hot: true },
    { name: 'WIF', chain: 'SOL', price: '$2.34', m5: '+5.7%', h1: '+34.1%', vol: '$12.8M', liq: '$45M', score: '88', hot: true },
    { name: 'BONK', chain: 'SOL', price: '$0.0000284', m5: '+3.2%', h1: '+18.7%', vol: '$8.4M', liq: '$22M', score: '82', hot: false },
    { name: 'FLOKI', chain: 'ETH', price: '$0.000198', m5: '-1.8%', h1: '+42.3%', vol: '$6.1M', liq: '$15M', score: '79', hot: false },
    { name: 'DEGEN', chain: 'BASE', price: '$0.0134', m5: '+28.9%', h1: '+156%', vol: '$2.8M', liq: '$3.2M', score: '76', hot: true },
    { name: 'BRETT', chain: 'BASE', price: '$0.142', m5: '+8.1%', h1: '+23.4%', vol: '$5.3M', liq: '$18M', score: '73', hot: false },
    { name: 'MOG', chain: 'ETH', price: '$0.00000248', m5: '-2.4%', h1: '+67.8%', vol: '$3.1M', liq: '$7.4M', score: '71', hot: false },
    { name: 'POPCAT', chain: 'SOL', price: '$1.28', m5: '+15.6%', h1: '+45.2%', vol: '$9.7M', liq: '$28M', score: '85', hot: true },
  ];
  
  tokens.forEach((t, i) => {
    const y = 170 + i * 72;
    ctx.fillStyle = i % 2 === 0 ? COLORS.bgLight : 'transparent';
    roundRect(ctx, 30, y, 1140, 66, 6);
    ctx.fill();
    if (t.hot) {
      ctx.strokeStyle = COLORS.orange + '30';
      ctx.lineWidth = 1;
      roundRect(ctx, 30, y, 1140, 66, 6);
      ctx.stroke();
    }
    
    // Token name + chain
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'left';
    ctx.fillText(t.name, headerX[0], y + 30);
    ctx.font = '11px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(t.chain, headerX[0], y + 48);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.gray;
    ctx.fillText(t.price, headerX[1], y + 38);
    
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = t.m5.startsWith('+') ? COLORS.green : COLORS.red;
    ctx.fillText(t.m5, headerX[2], y + 38);
    
    ctx.fillStyle = t.h1.startsWith('+') ? COLORS.green : COLORS.red;
    ctx.fillText(t.h1, headerX[3], y + 38);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.gray;
    ctx.fillText(t.vol, headerX[4], y + 38);
    ctx.fillText(t.liq, headerX[5], y + 38);
    
    // Score badge
    const scoreColor = parseInt(t.score) >= 85 ? COLORS.green : parseInt(t.score) >= 75 ? COLORS.amber : COLORS.red;
    ctx.fillStyle = scoreColor + '20';
    roundRect(ctx, headerX[6] - 4, y + 20, 50, 28, 14);
    ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = scoreColor;
    ctx.textAlign = 'center';
    ctx.fillText(t.score, headerX[6] + 21, y + 40);
    ctx.textAlign = 'left';
    
    // Action button
    if (t.hot) {
      ctx.fillStyle = COLORS.orange;
      roundRect(ctx, headerX[7], y + 18, 80, 32, 6);
      ctx.fill();
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = COLORS.white;
      ctx.textAlign = 'center';
      ctx.fillText('TRADE', headerX[7] + 40, y + 40);
      ctx.textAlign = 'left';
    } else {
      ctx.strokeStyle = COLORS.dim;
      ctx.lineWidth = 1;
      roundRect(ctx, headerX[7], y + 18, 80, 32, 6);
      ctx.stroke();
      ctx.font = '12px Arial';
      ctx.fillStyle = COLORS.dim;
      ctx.textAlign = 'center';
      ctx.fillText('Watch', headerX[7] + 40, y + 40);
      ctx.textAlign = 'left';
    }
  });
  
  drawBottomBar(ctx, COLORS.orange);
  save(c, 'meme-token-scanner.png');
}

// ========== 3. FLASH LOAN ARB ==========
function flashLoanFlow() {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, COLORS.cyan);
  
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center';
  ctx.fillText('How Flash Loan Arbitrage Works', W / 2, 70);
  ctx.font = '18px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Zero capital required · One atomic transaction · Profit or revert', W / 2, 105);
  
  // Flow steps
  const steps = [
    { icon: '🏦', title: 'Borrow', desc: 'Flash loan from\nAave V3', color: COLORS.cyan },
    { icon: '🔍', title: 'Scan', desc: 'Find price gap\nacross DEXs', color: COLORS.purple },
    { icon: '🔄', title: 'Buy Low', desc: 'Buy on cheaper\nDEX', color: COLORS.green },
    { icon: '💰', title: 'Sell High', desc: 'Sell on expensive\nDEX', color: COLORS.amber },
    { icon: '✅', title: 'Repay + Profit', desc: 'Return loan\nkeep spread', color: COLORS.greenLight },
  ];
  
  steps.forEach((s, i) => {
    const x = 60 + i * 225;
    const y = 200;
    
    // Card
    ctx.fillStyle = COLORS.card;
    roundRect(ctx, x, y, 200, 200, 16);
    ctx.fill();
    ctx.strokeStyle = s.color + '40';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, 200, 200, 16);
    ctx.stroke();
    
    // Step number
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(x + 30, y + 30, 16, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = COLORS.bg;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), x + 30, y + 35);
    
    // Icon
    ctx.font = '44px Arial';
    ctx.fillText(s.icon, x + 100, y + 95);
    
    // Title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = s.color;
    ctx.fillText(s.title, x + 100, y + 140);
    
    // Desc
    ctx.font = '13px Arial';
    ctx.fillStyle = COLORS.gray;
    s.desc.split('\n').forEach((line, li) => {
      ctx.fillText(line, x + 100, y + 165 + li * 18);
    });
    ctx.textAlign = 'left';
    
    // Arrow between steps
    if (i < 4) {
      const arrowX = x + 210;
      ctx.strokeStyle = COLORS.dim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, y + 100);
      ctx.lineTo(arrowX + 15, y + 100);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX + 10, y + 95);
      ctx.lineTo(arrowX + 15, y + 100);
      ctx.lineTo(arrowX + 10, y + 105);
      ctx.stroke();
    }
  });
  
  // DEX comparison
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center';
  ctx.fillText('Supported DEXs', W / 2, 480);
  
  const dexes = [
    { name: 'Uniswap V3', spread: '0.05%', vol: '$2.1B', color: '#FF007A' },
    { name: 'PancakeSwap V3', spread: '0.08%', vol: '$890M', color: '#1FC7D4' },
    { name: 'Camelot V3', spread: '0.12%', vol: '$340M', color: '#F97316' },
    { name: 'Ramses V2', spread: '0.15%', vol: '$180M', color: '#8B5CF6' },
  ];
  
  dexes.forEach((d, i) => {
    const x = 60 + i * 285;
    ctx.fillStyle = COLORS.card;
    roundRect(ctx, x, 510, 265, 120, 12);
    ctx.fill();
    ctx.strokeStyle = d.color + '30';
    ctx.lineWidth = 1;
    roundRect(ctx, x, 510, 265, 120, 12);
    ctx.stroke();
    
    // Color bar top
    ctx.fillStyle = d.color;
    ctx.fillRect(x + 20, 520, 40, 3);
    
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = COLORS.white;
    ctx.fillText(d.name, x + 20, 548);
    
    ctx.font = '13px Arial';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('Avg Spread', x + 20, 575);
    ctx.fillText('Daily Volume', x + 20, 600);
    
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = COLORS.cyan;
    ctx.fillText(d.spread, x + 245, 575);
    ctx.fillStyle = COLORS.gray;
    ctx.fillText(d.vol, x + 245, 600);
    ctx.textAlign = 'left';
  });
  
  // "All in one atomic transaction" badge
  ctx.fillStyle = COLORS.cyan + '15';
  roundRect(ctx, W / 2 - 200, 660, 400, 50, 25);
  ctx.fill();
  ctx.strokeStyle = COLORS.cyan + '40';
  roundRect(ctx, W / 2 - 200, 660, 400, 50, 25);
  ctx.stroke();
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = COLORS.cyan;
  ctx.textAlign = 'center';
  ctx.fillText('⚡ All in one atomic transaction — profit or revert', W / 2, 692);
  
  drawBottomBar(ctx, COLORS.cyan);
  save(c, 'flash-loan-flow.png');
}

// ========== AGENT STRATEGY VISUAL (reusable for 6 agents) ==========
function agentStrategyImage(name, subtitle, accentColor, signalData, fileName) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, accentColor);
  
  // Header
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'left';
  ctx.fillText(name, 50, 65);
  ctx.font = '18px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(subtitle, 50, 100);
  
  // Agent status badge
  ctx.fillStyle = accentColor + '20';
  roundRect(ctx, 50, 120, 160, 36, 18);
  ctx.fill();
  ctx.fillStyle = accentColor;
  ctx.beginPath(); ctx.arc(70, 138, 5, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = accentColor;
  ctx.fillText('ACTIVE — TRADING', 84, 143);
  
  // Left: Signal feed
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 40, 180, 700, 580, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  roundRect(ctx, 40, 180, 700, 580, 12);
  ctx.stroke();
  ctx.font = '13px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('AGENT DECISION LOG', 60, 210);
  
  signalData.forEach((s, i) => {
    const sy = 230 + i * 70;
    ctx.fillStyle = i % 2 === 0 ? COLORS.bgLight : 'transparent';
    roundRect(ctx, 50, sy, 680, 64, 6);
    ctx.fill();
    if (s.type === 'entry') {
      ctx.strokeStyle = COLORS.green + '30';
      ctx.lineWidth = 1;
      roundRect(ctx, 50, sy, 680, 64, 6);
      ctx.stroke();
    }
    
    // Time
    ctx.font = '11px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(s.time, 65, sy + 20);
    
    // Type badge
    const typeColor = s.type === 'signal' ? accentColor : s.type === 'entry' ? COLORS.green : s.type === 'analysis' ? COLORS.cyan : COLORS.amber;
    ctx.fillStyle = typeColor + '20';
    roundRect(ctx, 65, sy + 28, 70, 22, 4);
    ctx.fill();
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = typeColor;
    ctx.fillText(s.type.toUpperCase(), 74, sy + 43);
    
    // Message
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.gray;
    ctx.fillText(s.message, 150, sy + 38);
  });
  
  // Right: Quick Stats
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 760, 180, 400, 280, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  roundRect(ctx, 760, 180, 400, 280, 12);
  ctx.stroke();
  ctx.font = '13px Arial';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('PERFORMANCE', 780, 210);
  
  const perfStats = [
    { label: 'Win Rate', value: '64.2%', color: COLORS.amber },
    { label: 'Total P&L', value: '+$12,480', color: COLORS.green },
    { label: 'Avg Hold', value: '4.2 hrs', color: COLORS.cyan },
    { label: 'Trades/Mo', value: '142', color: COLORS.purple },
    { label: 'Sharpe', value: '1.87', color: COLORS.white },
    { label: 'Max DD', value: '-3.2%', color: COLORS.red },
  ];
  perfStats.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const px = 780 + col * 190, py = 225 + row * 75;
    ctx.font = '12px Arial';
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(p.label, px, py + 14);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = p.color;
    ctx.fillText(p.value, px, py + 44);
  });
  
  drawBottomBar(ctx, accentColor);
  save(c, fileName);
}

// ========== BUNDLE VALUE IMAGE ==========
function bundleValueImage(name, products, totalValue, bundlePrice, savings, accentColor, fileName) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  drawBG(ctx, accentColor);
  
  ctx.font = 'bold 44px Arial';
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = 'center';
  ctx.fillText(name, W / 2, 70);
  
  // Products included
  const colW = 350;
  const startY = 120;
  products.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 60 + col * (colW + 30), y = startY + row * 90;
    
    ctx.fillStyle = COLORS.card;
    roundRect(ctx, x, y, colW, 78, 10);
    ctx.fill();
    ctx.strokeStyle = p.color + '30';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, colW, 78, 10);
    ctx.stroke();
    
    // Color bar
    ctx.fillStyle = p.color;
    ctx.fillRect(x, y, 4, 78);
    
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = COLORS.white;
    ctx.fillText(p.name, x + 20, y + 32);
    ctx.font = '13px Arial';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(p.desc, x + 20, y + 54);
    
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = COLORS.dim;
    // Strike through
    ctx.fillText(`$${p.price}`, x + colW - 20, y + 44);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 2;
    const tw = ctx.measureText(`$${p.price}`).width;
    ctx.beginPath();
    ctx.moveTo(x + colW - 20 - tw - 4, y + 40);
    ctx.lineTo(x + colW - 16, y + 40);
    ctx.stroke();
    ctx.textAlign = 'left';
  });
  
  // Value comparison at bottom
  const vy = products.length <= 3 ? 350 : products.length <= 6 ? 440 : 530;
  
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 200, vy, 800, 220, 16);
  ctx.fill();
  ctx.strokeStyle = accentColor + '40';
  ctx.lineWidth = 2;
  roundRect(ctx, 200, vy, 800, 220, 16);
  ctx.stroke();
  
  ctx.textAlign = 'center';
  
  // Original value crossed out
  ctx.font = '24px Arial';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('Total Value', W / 2 - 200, vy + 50);
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText(`$${totalValue}`, W / 2 - 200, vy + 100);
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 3;
  const tvw = ctx.measureText(`$${totalValue}`).width;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200 - tvw / 2 - 10, vy + 92);
  ctx.lineTo(W / 2 - 200 + tvw / 2 + 10, vy + 92);
  ctx.stroke();
  
  // Arrow
  ctx.font = '48px Arial';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('→', W / 2, vy + 95);
  
  // Bundle price
  ctx.font = '24px Arial';
  ctx.fillStyle = accentColor;
  ctx.fillText('Bundle Price', W / 2 + 200, vy + 50);
  ctx.font = 'bold 64px Arial';
  ctx.fillStyle = accentColor;
  ctx.fillText(`$${bundlePrice}`, W / 2 + 200, vy + 110);
  
  // Savings badge
  ctx.fillStyle = COLORS.green + '20';
  roundRect(ctx, W / 2 - 100, vy + 150, 200, 48, 24);
  ctx.fill();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = COLORS.green;
  ctx.fillText(`Save $${savings}`, W / 2, vy + 181);
  
  drawBottomBar(ctx, accentColor);
  save(c, fileName);
}

// ========== GENERATE ALL ==========
console.log('Generating product store images...\n');

console.log('AI Trading Dashboard:');
dashboardHero();
dashboardThemes();

console.log('\nMeme Trading Suite:');
memeScanner();

console.log('\nFlash Loan Arbitrage:');
flashLoanFlow();

console.log('\nDarvas Box Agent:');
agentStrategyImage('Darvas Box Breakout Agent', 'Automated box breakout detection · Multi-timeframe analysis', COLORS.blue, [
  { time: '14:23:07', type: 'analysis', message: 'BTC forming consolidation box at $67,200 — $68,400 (4H timeframe)' },
  { time: '14:23:12', type: 'signal', message: 'Box confirmed: 3 touches on support, 2 on resistance. Volume declining.' },
  { time: '14:23:18', type: 'signal', message: 'Volume spike detected: 2.3x average. Breakout conditions met.' },
  { time: '14:23:25', type: 'entry', message: 'ENTERING LONG BTC at $68,420 | Stop: $67,100 | Target: $71,200' },
  { time: '14:23:32', type: 'analysis', message: 'Trailing stop activated. Moving to $67,800 (+$600 from entry).' },
  { time: '14:24:01', type: 'signal', message: 'Next box forming on ETH: $3,580 — $3,640. Monitoring volume.' },
  { time: '14:24:15', type: 'analysis', message: '15m timeframe confirms 4H breakout. Multi-TF alignment: HIGH.' },
], 'darvas-agent-signals.png');

console.log('\nElliott Wave Agent:');
agentStrategyImage('Elliott Wave Pattern Agent', 'AI-powered wave counting · Fibonacci extension targets', COLORS.indigo, [
  { time: '14:23:07', type: 'analysis', message: 'ETH: Detected impulse Wave 3 in progress. Wave 1 peak: $3,420.' },
  { time: '14:23:12', type: 'signal', message: 'Fibonacci 1.618 extension target: $3,840. Confidence: 87%.' },
  { time: '14:23:18', type: 'analysis', message: 'Wave 2 retracement to 0.618 level ($3,285) — textbook correction.' },
  { time: '14:23:25', type: 'entry', message: 'ENTERING LONG ETH at $3,612 | Target: $3,840 (Wave 3 ext)' },
  { time: '14:23:32', type: 'signal', message: 'Volume profile confirms Wave 3 acceleration. RSI not yet overbought.' },
  { time: '14:24:01', type: 'analysis', message: 'Sub-wave count: i-ii-iii complete, expecting iv pullback to $3,590.' },
  { time: '14:24:15', type: 'signal', message: 'BTC showing potential Wave 5 completion. Watching for A-B-C correction.' },
], 'elliott-wave-signals.png');

console.log('\nVWAP Agent:');
agentStrategyImage('VWAP Volume Breakout Agent', 'Institutional-grade volume analysis · RSI divergence', COLORS.green, [
  { time: '14:23:07', type: 'analysis', message: 'SOL accumulating below VWAP at $142.80. Volume building in zone.' },
  { time: '14:23:12', type: 'signal', message: 'RSI divergence detected: price lower low, RSI higher low. Bullish.' },
  { time: '14:23:18', type: 'signal', message: 'Volume spike: 2.1x average. Price crossing above VWAP at $143.50.' },
  { time: '14:23:25', type: 'entry', message: 'ENTERING LONG SOL at $143.50 | VWAP break + RSI div confirmed' },
  { time: '14:23:32', type: 'analysis', message: 'Order flow: net buying pressure $2.4M in last 5 candles.' },
  { time: '14:24:01', type: 'signal', message: 'Target 1 hit: $145.20 (+1.2%). Trailing stop to $144.00.' },
  { time: '14:24:15', type: 'analysis', message: 'VWAP acting as support on retest. Holding position.' },
], 'vwap-agent-signals.png');

console.log('\nHeikin Ashi Agent:');
agentStrategyImage('Heikin Ashi Trend Agent', 'Smoothed candles · Noise filtering · Trend following', COLORS.amber, [
  { time: '14:23:07', type: 'analysis', message: 'BTC: 5 consecutive bullish HA candles. No lower wicks — strong trend.' },
  { time: '14:23:12', type: 'signal', message: 'ADX at 42 (strong trend). +DI > -DI. Trend quality: HIGH.' },
  { time: '14:23:18', type: 'entry', message: 'ENTERING LONG BTC at $67,800 | ADX trend confirmed' },
  { time: '14:23:25', type: 'analysis', message: 'Regular candles show chop. HA smoothing reveals clear uptrend.' },
  { time: '14:23:32', type: 'signal', message: 'Trailing stop set: $67,200. Will tighten on each new HA high.' },
  { time: '14:24:01', type: 'analysis', message: 'First bearish HA candle detected. Monitoring for reversal pattern.' },
  { time: '14:24:15', type: 'signal', message: 'False alarm: next candle bullish. Trend continues. Hold.' },
], 'heikin-ashi-signals.png');

console.log('\nMean Reversion Agent:');
agentStrategyImage('Mean Reversion Agent', 'Bollinger Bands · RSI extremes · Z-Score detection', COLORS.purple, [
  { time: '14:23:07', type: 'analysis', message: 'ETH touching lower Bollinger Band at $3,520. Z-Score: -2.1.' },
  { time: '14:23:12', type: 'signal', message: 'RSI at 28 (oversold). Mean reversion probability: 78%.' },
  { time: '14:23:18', type: 'signal', message: 'Scaled entry 1/3: buying at -2σ. Will add at -2.5σ and -3σ.' },
  { time: '14:23:25', type: 'entry', message: 'ENTERING LONG ETH at $3,520 | Bollinger touch + RSI 28' },
  { time: '14:23:32', type: 'analysis', message: 'Correlation check: BTC not oversold. ETH-specific dip. Good setup.' },
  { time: '14:24:01', type: 'signal', message: 'Price reverting to mean: $3,560 (+1.1%). Target: middle band $3,620.' },
  { time: '14:24:15', type: 'analysis', message: 'Z-Score normalizing to -0.8. Taking partial profit at -1σ.' },
], 'mean-reversion-signals.png');

console.log('\nMacro Sentiment Agent:');
agentStrategyImage('Macro Sentiment Agent', 'Fed policy · On-chain analytics · Social sentiment scoring', COLORS.pink, [
  { time: '14:23:07', type: 'analysis', message: 'Fed minutes released: dovish language detected. Rate cut probability: 72%.' },
  { time: '14:23:12', type: 'signal', message: '3 whale wallets accumulated 2,400 BTC in last 6 hours.' },
  { time: '14:23:18', type: 'analysis', message: 'Social sentiment: Twitter bullish 64%, Reddit bearish 58%. Mixed signals.' },
  { time: '14:23:25', type: 'signal', message: 'Composite macro score: 72/100 (Bullish). On-chain > Social weight.' },
  { time: '14:23:32', type: 'entry', message: 'Broadcasting BULLISH bias to farm. Agents adjusting long exposure.' },
  { time: '14:24:01', type: 'analysis', message: 'Exchange outflows: $340M net. Supply squeeze forming.' },
  { time: '14:24:15', type: 'signal', message: 'Fear & Greed index: 34 (Fear). Contrarian signal: bullish.' },
], 'macro-sentiment-signals.png');

console.log('\nMulti-Strategy Bundle:');
bundleValueImage('Multi-Strategy Bundle', [
  { name: 'Darvas Box Agent', desc: 'Automated breakout detection', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'AI wave counting', price: '199', color: COLORS.indigo },
  { name: 'VWAP Breakout Agent', desc: 'Volume analysis', price: '199', color: COLORS.green },
  { name: 'Heikin Ashi Agent', desc: 'Trend following', price: '199', color: COLORS.amber },
  { name: 'Mean Reversion Agent', desc: 'Bollinger + RSI', price: '199', color: COLORS.purple },
  { name: 'Macro Sentiment Agent', desc: 'Fed + on-chain', price: '199', color: COLORS.pink },
], '1,194', '399', '795', COLORS.green, 'multi-strat-value.png');

console.log('\nFull Stack Trader:');
bundleValueImage('The Full Stack Trader', [
  { name: 'AI Trading Dashboard', desc: 'Complete dashboard platform', price: '149', color: COLORS.purple },
  { name: 'Darvas Box Agent', desc: 'Breakout detection strategy', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'Wave pattern analysis', price: '199', color: COLORS.indigo },
], '547', '299', '248', COLORS.cyan, 'full-stack-value.png');

console.log('\nEverything Bundle:');
bundleValueImage('GWDS Everything Bundle', [
  { name: 'AI Trading Dashboard', desc: 'Full dashboard platform', price: '149', color: COLORS.purple },
  { name: 'Meme Trading Suite', desc: '9-tab meme trading', price: '499', color: COLORS.orange },
  { name: 'Flash Loan Engine', desc: 'Cross-DEX arbitrage', price: '99', color: COLORS.cyan },
  { name: 'Darvas Box Agent', desc: 'Breakout detection', price: '199', color: COLORS.blue },
  { name: 'Elliott Wave Agent', desc: 'Wave counting', price: '199', color: COLORS.indigo },
  { name: 'VWAP Breakout Agent', desc: 'Volume analysis', price: '199', color: COLORS.green },
  { name: 'Heikin Ashi Agent', desc: 'Trend following', price: '199', color: COLORS.amber },
  { name: 'Mean Reversion Agent', desc: 'Bollinger + RSI', price: '199', color: COLORS.purple },
  { name: 'Macro Sentiment Agent', desc: 'Fed + on-chain', price: '199', color: COLORS.pink },
], '1,941', '899', '1,042', COLORS.amber, 'everything-value.png');

console.log('\n✅ All product images generated!');
