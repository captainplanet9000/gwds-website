import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\GWDS\\gwds-website\\src\\lib\\products.ts';
let content = readFileSync(path, 'utf8');

// Map of product ID regex pattern → new images array content
const galleryUpdates = [
  // AI Trading Dashboard — show the dashboard itself, themes, positions, analytics
  {
    id: 'trading-dashboard-template',
    // Old category field to narrow match: category: "trading" appears in many, use unique context
    images: [
      '/images/products/store/dashboard-command-center.png',
      '/images/products/store/dashboard-themes-grid.png',
      '/images/products/shot-farms-overview.jpg',
      '/images/products/shot-correlation-matrix.jpg',
    ]
  },
  // Meme Trading Suite — scanner, its own dashboard
  {
    id: 'meme-trading-suite',
    images: [
      '/images/products/store/meme-token-scanner.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Flash Loan Arbitrage — flow diagram, stats, executions
  {
    id: 'flash-loan-arbitrage',
    images: [
      '/images/products/store/flash-loan-flow.png',
      '/images/products/shot-flash-stats.png',
      '/images/products/shot-flash-executions.png',
    ]
  },
  // Darvas Box — its own signal feed
  {
    id: 'darvas-box-agent',
    idPattern: 'darvas-indicator',
    images: [
      '/images/products/store/darvas-agent-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Elliott Wave — its own signal feed
  {
    id: 'elliott-wave-agent',
    images: [
      '/images/products/store/elliott-wave-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // VWAP — its own signal feed
  {
    id: 'vwap-agent',
    idPattern: 'vwap-momentum-agent',
    images: [
      '/images/products/store/vwap-agent-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Heikin Ashi — its own signal feed
  {
    id: 'heikin-ashi-agent',
    images: [
      '/images/products/store/heikin-ashi-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Mean Reversion — its own signal feed
  {
    id: 'mean-reversion-agent',
    images: [
      '/images/products/store/mean-reversion-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Macro Sentiment — its own signal feed
  {
    id: 'macro-sentiment-agent',
    images: [
      '/images/products/store/macro-sentiment-signals.png',
      '/images/products/store/dashboard-command-center.png',
    ]
  },
  // Multi-Strategy Bundle — value comparison + individual agents
  {
    id: 'multi-strategy-bundle',
    idPattern: 'multi-strat-bundle',
    images: [
      '/images/products/store/multi-strat-value.png',
      '/images/products/store/darvas-agent-signals.png',
      '/images/products/store/elliott-wave-signals.png',
      '/images/products/store/vwap-agent-signals.png',
    ]
  },
  // Full Stack Trader — value comparison + included products
  {
    id: 'full-stack-trader-bundle',
    images: [
      '/images/products/store/full-stack-value.png',
      '/images/products/store/dashboard-command-center.png',
      '/images/products/store/darvas-agent-signals.png',
      '/images/products/store/elliott-wave-signals.png',
    ]
  },
  // Everything Bundle — value comparison + highlights
  {
    id: 'everything-bundle',
    images: [
      '/images/products/store/everything-value.png',
      '/images/products/store/dashboard-command-center.png',
      '/images/products/store/meme-token-scanner.png',
      '/images/products/store/flash-loan-flow.png',
      '/images/products/store/darvas-agent-signals.png',
    ]
  },
];

for (const update of galleryUpdates) {
  const searchId = update.idPattern || update.id;
  
  // Find the images: [...] block for this product
  // Strategy: find the id string, then find the next images: [...] block
  const idIdx = content.indexOf(`id: "${searchId}"`);
  if (idIdx === -1) {
    console.log(`⚠️  Could not find id: "${searchId}"`);
    continue;
  }
  
  // Find "images: [" after this id
  const imagesStart = content.indexOf('images: [', idIdx);
  if (imagesStart === -1 || imagesStart - idIdx > 3000) {
    console.log(`⚠️  Could not find images array for "${searchId}"`);
    continue;
  }
  
  // Find the closing ]
  const imagesEnd = content.indexOf(']', imagesStart + 9);
  if (imagesEnd === -1) {
    console.log(`⚠️  Could not find closing ] for "${searchId}"`);
    continue;
  }
  
  // Build new images string
  const newImagesContent = update.images.map(img => `\n      "${img}",`).join('');
  const newImages = `images: [${newImagesContent}\n    ]`;
  
  // Replace
  const oldImages = content.substring(imagesStart, imagesEnd + 1);
  content = content.substring(0, imagesStart) + newImages + content.substring(imagesEnd + 1);
  
  console.log(`✅ ${searchId} — ${update.images.length} images`);
}

writeFileSync(path, content);
console.log('\n✅ All product gallery images updated!');
