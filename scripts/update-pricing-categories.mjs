import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\GWDS\\gwds-website\\src\\lib\\products.ts';
let content = readFileSync(path, 'utf8');

// 1. Add productType to the interface
content = content.replace(
  'isBundle?: boolean;\n}',
  'isBundle?: boolean;\n  productType?: "flagship" | "extension" | "agent" | "bundle";\n}'
);

// 2. Fix Meme Trading price: $499 → $99
content = content.replace(
  /id: "meme-trading-suite",[\s\S]*?price: 499,/,
  (match) => match.replace('price: 499,', 'price: 99,')
);

// 3. Update Meme Trading badge from PREMIUM to EXTENSION
content = content.replace(
  /id: "meme-trading-suite",[\s\S]*?badge: "PREMIUM",/,
  (match) => match.replace('badge: "PREMIUM",', 'badge: "EXTENSION",')
);

// 4. Update Flash Loan badge from UPGRADED to EXTENSION
content = content.replace(
  /id: "flash-loan-arbitrage",[\s\S]*?badge: "UPGRADED",/,
  (match) => match.replace('badge: "UPGRADED",', 'badge: "EXTENSION",')
);

// 5. Add productType to each product
const productTypes = {
  'trading-dashboard-template': 'flagship',
  'meme-trading-suite': 'extension',
  'flash-loan-arbitrage': 'extension',
  'darvas-indicator': 'agent',
  'elliott-wave-agent': 'agent',
  'vwap-momentum-agent': 'agent',
  'heikin-ashi-agent': 'agent',
  'mean-reversion-agent': 'agent',
  'macro-sentiment-agent': 'agent',
  'multi-strat-bundle': 'bundle',
  'full-stack-trader-bundle': 'bundle',
  'everything-bundle': 'bundle',
};

for (const [id, type] of Object.entries(productTypes)) {
  const idStr = `id: "${id}",`;
  const idx = content.indexOf(idStr);
  if (idx === -1) {
    console.log(`⚠️ Could not find ${id}`);
    continue;
  }
  // Find the closing } for this product (look for badge, isFeatured, isBundle, or the features line)
  // Insert productType after isFeatured, isBundle, or requiresDashboard
  const productChunk = content.substring(idx, idx + 3000);
  
  // Find the last boolean flag line before features
  const featuresIdx = productChunk.indexOf('features:');
  if (featuresIdx === -1) {
    console.log(`⚠️ No features for ${id}`);
    continue;
  }
  
  const beforeFeatures = productChunk.substring(0, featuresIdx);
  const lastNewline = beforeFeatures.lastIndexOf('\n');
  const insertPos = idx + lastNewline + 1;
  
  content = content.substring(0, insertPos) + 
    `    productType: "${type}",\n` + 
    content.substring(insertPos);
  
  console.log(`✅ ${id} → ${type}`);
}

// 6. Recalculate bundle prices
// New prices: Dashboard $149, Meme $99, Flash $99, Agents $199 each × 6 = $1,194
// Multi-Strategy (6 agents): $1,194 → $499 (save $695, 58% off)
// Full Stack (Dashboard + Darvas + Elliott): $149 + $199 + $199 = $547 → $299 (save $248, 45% off)
// Everything (all 9): $149 + $99 + $99 + $1,194 = $1,541 → $599 (save $942, 61% off)

// Multi-Strategy: keep at $399 — that's already good value for 6 agents
// Actually let's make it $499 so it's more but still saves a lot
// No wait — $399 for 6 × $199 = save $795. That's already great. Keep it.

// Everything Bundle: $149 + $99 + $99 + 6×$199 = $1,541
// Old was $899, recalculate: $599 would be 61% off. Let's do $699 (save $842, 55% off)
content = content.replace(
  /id: "everything-bundle",[\s\S]*?price: 899,/,
  (match) => match.replace('price: 899,', 'price: 699,')
);

// Update Everything Bundle badge
content = content.replace(
  /id: "everything-bundle",[\s\S]*?badge: "54% OFF",/,
  (match) => match.replace('badge: "54% OFF",', 'badge: "SAVE $842",')
);

// Multi-Strategy: keep $399, update badge
// Total: 6 × $199 = $1,194, save $795
content = content.replace(
  /id: "multi-strat-bundle",[\s\S]*?badge: "BEST VALUE",/,
  (match) => match.replace('badge: "BEST VALUE",', 'badge: "SAVE $795",')
);

// Full Stack: $149+$199+$199 = $547, keep $299, save $248. Badge already says SAVE $248. Good.

writeFileSync(path, content);
console.log('\n✅ All pricing and categories updated!');

// Verify
const final = readFileSync(path, 'utf8');
const priceMatches = [...final.matchAll(/name: "([^"]+)"[\s\S]*?price: (\d+)/g)];
console.log('\nFinal prices:');
for (const m of priceMatches) {
  if (m[1].length > 5) console.log(`  ${m[1]}: $${m[2]}`);
}
