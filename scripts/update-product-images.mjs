import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\GWDS\\gwds-website\\src\\lib\\products.ts';
let content = readFileSync(path, 'utf8');

// Simple string replacements for main hero images
const imageSwaps = [
  // Dashboard hero (appears as main image for dashboard, full-stack, everything)
  ['image: "/images/products/shot-dashboard-stats.jpg"', 'image: "/images/products/store/dashboard-command-center.png"'],
  // Meme Trading hero
  ['image: "/images/products/shot-plugin-marketplace.png"', 'image: "/images/products/store/meme-token-scanner.png"'],
  // Flash Loan hero
  ['image: "/images/products/shot-flash-opportunities.png"', 'image: "/images/products/store/flash-loan-flow.png"'],
  // Darvas hero
  ['image: "/images/products/shot-strat-darvas.jpg"', 'image: "/images/products/store/darvas-agent-signals.png"'],
  // Elliott hero
  ['image: "/images/products/shot-strat-elliott.jpg"', 'image: "/images/products/store/elliott-wave-signals.png"'],
  // VWAP hero
  ['image: "/images/products/shot-strat-vwap.jpg"', 'image: "/images/products/store/vwap-agent-signals.png"'],
  // Heikin Ashi hero
  ['image: "/images/products/shot-strat-heikin.jpg"', 'image: "/images/products/store/heikin-ashi-signals.png"'],
  // Mean Reversion hero
  ['image: "/images/products/shot-strat-mean-rev.jpg"', 'image: "/images/products/store/mean-reversion-signals.png"'],
  // Macro Sentiment hero
  ['image: "/images/products/shot-strat-macro.jpg"', 'image: "/images/products/store/macro-sentiment-signals.png"'],
  // Multi-Strategy Bundle hero
  ['image: "/images/products/shot-farms-overview.jpg"', 'image: "/images/products/store/multi-strat-value.png"'],
];

for (const [old, newStr] of imageSwaps) {
  content = content.replaceAll(old, newStr);
}

writeFileSync(path, content);
console.log('✅ Updated all main product images in products.ts');

// Count replacements
const storeCount = (content.match(/\/store\//g) || []).length;
console.log(`  Found ${storeCount} references to /store/ images`);
