export type ProductCategory = "trading";

/** Product tier — drives store grouping/sorting. Every product declares one. */
export type ProductType = "flagship" | "extension" | "agent" | "bundle";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  wasPrice?: number;
  category: ProductCategory;
  badge?: string;
  emoji: string;
  features: string[];
  productType: ProductType;
  techStack?: string[];
  image?: string;
  images?: string[];
  downloadUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  stripePriceId?: string;
  isFeatured?: boolean;
  requiresDashboard?: boolean;
  isBundle?: boolean;
  /** Superseded by the current edition lineup — kept purchasable for existing
   *  order/download lookups, but hidden from store browsing and nav. */
  legacy?: boolean;
}

export const categories: { id: ProductCategory; label: string; emoji: string; color: string; description: string }[] = [
  { id: "trading", label: "Trading", emoji: "📈", color: "#1D4ED8", description: "Indicators, agents, and systems for real-money execution." },
];

/**
 * NOTE ON demoUrl — removed 2026-08-27, deliberately.
 *
 * All 11 products carried demoUrl -> ai-trading-dashboard-demo.vercel.app, a deployment of a
 * materially larger build than any of these archives contain. A link labelled only "View the
 * live demo" on a paid product page is a representation about that product, and this one
 * showed a richer system than the buyer would receive — a gap they could observe themselves
 * within minutes of downloading.
 *
 * To restore demos, point demoUrl at a deployment of the EXACT artifact that ships for that
 * SKU, or label the link unambiguously as a different edition. Do not re-add the old URL.
 */
export const products: Product[] = [
  {
    id: "trading-dashboard-template",
    stripePriceId: "price_1U09vdLLyk0oaesNmjX9ZSDL",
    name: "Core Edition",
    description: "The trading platform with one strategy agent pre-installed and running. Seven dashboard sections, 66 API routes, the Postgres schema, and the plugin system every other agent in this store drops into.",
    longDescription: `This is the system, not a mockup of one. It ships with the Darvas Box Breakout agent already installed: it identifies consolidation boxes, waits for a breakout confirmed by volume, and sizes the entry against a stop below the box floor.

The archive ships in paper mode. Going live is an explicit change to TRADING_MODE plus a wallet address — nothing places a real order until you decide it should.

Everything else is scaffolding you'd otherwise spend a quarter writing: reconciled position state, an order lifecycle that survives a reload, agent supervision, and a UI that stays legible on a bad day.

Add strategies when you want them. Each agent in the store drops into the same runtime with no code changes.`,
    price: 99,
    category: "trading",
    badge: "EDITION",
    emoji: "📊",
    isFeatured: true,
    productType: "flagship",
    features: [
      "Darvas Box Breakout agent, pre-installed and ready to run",
      "Seven dashboard sections: agents, farms, trades, backtest, risk, P&L analytics, settings",
      "66 API routes and 213 TypeScript files — nothing compiled, nothing obfuscated",
      "Backtest engine that replays real candles through the same strategy code that trades",
      "Multi-strategy farms with shared risk limits and a shared scratchpad",
      "Plugin system — every agent in this store installs by dropping a folder in plugins/",
      "Consolidated Postgres schema included; one command to provision",
      "Ships in paper mode. Live trading requires an explicit, deliberate switch",
    ],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "TailwindCSS"],
    image: "/images/cival/gw-shot-overview.png",
    images: [
      "/images/cival/gw-shot-overview.png",
      "/images/cival/gw-shot-live-trading.png",
      "/images/cival/gw-shot-agents.png",
      "/images/cival/gw-shot-performance.png",
      "/images/cival/gw-shot-farms.png",
      "/images/cival/gw-shot-analytics.png",
      "/images/cival/gw-shot-coordination.png",
    ],
    downloadUrl: "downloads/ai-trading-dashboard-v2.0.0.zip",
    videoUrl: "/videos/products/cival-promo-v3.mp4",
  },
  {
    id: "meme-trading-suite",
    // HIDDEN 2026-08-28: this archive imports library modules it does not
    // contain (8 for the meme suite, 4 for flash-loan) and cannot build. Kept
    // purchasable-by-id for existing order lookups, removed from browsing until
    // the missing modules ship. Un-hide by deleting this legacy flag.
    legacy: true,
    stripePriceId: "price_1U09vdLLyk0oaesNetEHtOa0",
    requiresDashboard: true,
    name: "Meme Trading Suite",
    description: "Nine-tab meme desk: DexScreener scanning, autonomous snipers, smart-money tracking, Solana execution, and a signal engine that ranks the noise.",
    longDescription: `Meme markets move faster than any human process. This suite gives the dashboard a dedicated Solana desk: scan new pairs, filter the obvious rugs, watch wallets that are consistently early, and let a sniper agent take the entry.

It plugs into the same agent runtime and risk engine as everything else, so meme positions show up in the same P&L and drawdown view as your majors.`,
    price: 79,
    category: "trading",
    badge: "EXTENSION",
    emoji: "🚀",
    isFeatured: true,
    productType: "extension",
    features: [
      "Nine-tab meme trading dashboard",
      "DexScreener pair scanner with liquidity and rug filters",
      "Autonomous sniper agents with configurable entry rules",
      "Smart-money wallet tracking and copy signals",
      "Solana execution via Jupiter routing",
      "Signal engine with confidence scoring",
      "Social sentiment ingestion",
      "Twenty-eight source files, fully integrated with the dashboard",
    ],
    techStack: ["Next.js 15", "TypeScript", "@solana/web3.js", "Supabase", "DexScreener API"],
    image: "/images/products/store/meme-token-scanner.png",
    images: [
      "/images/products/store/meme-token-scanner.png",
      "/images/cival/gw-shot-overview.png",
    ],
    downloadUrl: "downloads/meme-trading-suite-v2.0.0.zip",
    videoUrl: "/videos/products/meme-trading.mp4",
  },
  {
    id: "flash-loan-arbitrage",
    // HIDDEN 2026-08-28: this archive imports library modules it does not
    // contain (8 for the meme suite, 4 for flash-loan) and cannot build. Kept
    // purchasable-by-id for existing order lookups, removed from browsing until
    // the missing modules ship. Un-hide by deleting this legacy flag.
    legacy: true,
    stripePriceId: "price_1U09vdLLyk0oaesNO6v6K9Ei",
    requiresDashboard: true,
    name: "Flash Loan Arbitrage Engine",
    description: "Cross-DEX arbitrage with zero collateral — Aave V3 flash loans on Arbitrum, scanning Uniswap V3, PancakeSwap V3, Camelot V3 and Ramses V2.",
    longDescription: `Arbitrage is a latency and plumbing problem, not an idea problem. This engine handles the plumbing: it watches four Arbitrum DEXes, simulates the round trip including gas, and only fires when the net edge clears your threshold.

Because it borrows through Aave V3 flash loans, positions open and close in one transaction with no collateral parked anywhere.`,
    price: 79,
    category: "trading",
    badge: "EXTENSION",
    emoji: "⚡",
    productType: "extension",
    features: [
      "Multi-DEX price scanning across four venues",
      "Aave V3 flash loans — no capital locked up",
      "Server-side auto-executor with gas-aware profitability checks",
      "Real-time opportunity feed with expected net edge",
      "Simulation mode before any capital touches a router",
      "Configurable minimum-profit and slippage thresholds",
      "Full contract interaction source",
      "Arbitrum-first, portable to other EVM chains",
    ],
    techStack: ["TypeScript", "viem", "Aave V3", "Arbitrum"],
    image: "/images/products/store/flash-loan-flow.png",
    images: ["/images/products/store/flash-loan-flow.png"],
    downloadUrl: "downloads/flash-loan-arbitrage-v2.0.0.zip",
    videoUrl: "/videos/products/flash-loan.mp4",
  },
  {
    id: "darvas-indicator",
    stripePriceId: "price_1U09vdLLyk0oaesNIb1MgxJh",
    requiresDashboard: true,
    name: "Darvas Box Breakout Agent",
    description: "Nicolas Darvas' box method, automated: finds consolidation ranges, waits for a volume-confirmed break, then trails the stop up the ladder.",
    longDescription: `Darvas boxes are a discipline problem: the pattern is easy to see and easy to jump early. The agent doesn't jump — it needs the range, the break, and the volume before it commits.

It runs inside the dashboard's farm system, so it shares position limits with your other agents instead of quietly doubling your exposure.`,
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📦",
    productType: "agent",
    features: [
      "Automatic consolidation-box detection",
      "Volume confirmation before entry",
      "Multi-timeframe analysis across 15m, 1H and 4H",
      "Trailing stops that step with each new box",
      "Configurable box tolerance and breakout thresholds",
      "Full entry and exit logging into the trade journal",
    ],
    techStack: ["TypeScript", "Hyperliquid SDK"],
    image: "/images/products/store/darvas-agent-signals.png",
    images: ["/images/products/store/darvas-agent-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/darvas-indicator-v2.0.0.zip",
    videoUrl: "/videos/products/darvas-agent.mp4",
  },
  {
    id: "elliott-wave-agent",
    stripePriceId: "price_1U09veLLyk0oaesNLxwlRQ8l",
    requiresDashboard: true,
    name: "Elliott Wave Pattern Agent",
    description: "Automated wave counting with Fibonacci extension targets — impulse waves 1–5, corrective A-B-C, validated against ratio tolerances before any entry.",
    longDescription: `Wave counting is famously subjective. This agent makes it mechanical: a count only stands if its retracement and extension ratios stay inside tolerance, and the count invalidates itself when price says otherwise.

You get the entry logic and the drawn overlay, so you can see exactly why it took a trade.`,
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🌊",
    productType: "agent",
    features: [
      "Impulse wave (1-5) and corrective (A-B-C) detection",
      "Fibonacci ratio validation on every count",
      "Automatic extension targets for exits",
      "Entries restricted to high-probability wave positions",
      "Invalidation levels that flatten the position",
      "Wave overlay drawn into the dashboard chart",
    ],
    techStack: ["TypeScript", "Hyperliquid SDK"],
    image: "/images/products/store/elliott-wave-signals.png",
    images: ["/images/products/store/elliott-wave-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/elliott-wave-agent-v2.0.0.zip",
    videoUrl: "/videos/products/elliott-wave.mp4",
  },
  {
    id: "vwap-momentum-agent",
    stripePriceId: "price_1U09veLLyk0oaesNBbMPGIFW",
    requiresDashboard: true,
    name: "VWAP Pro Agent",
    description: "Volume-weighted average price with standard-deviation bands, multi-timeframe confirmation and dynamic confidence sizing. Installs into Core Edition as a plugin.",
    longDescription: `The dashboard's included agent trades VWAP breakouts competently. This one trades them properly: it reads which side is absorbing, sizes by confidence rather than a fixed fraction, and refuses breaks that lack flow behind them.

Install it alongside the basic agent or replace it outright — the config shape is compatible.`,
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📊",
    productType: "agent",
    features: [
      "Multi-timeframe VWAP band analysis",
      "Order flow and delta tracking",
      "Accumulation and distribution zone detection",
      "Dynamic confidence scoring that scales position size",
      "Roughly six-hour average hold time",
      "Session, daily and anchored VWAP modes",
      "Divergence filters to skip low-quality breaks",
      "Drop-in replacement for the bundled agent",
    ],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/vwap-agent-signals.png",
    images: ["/images/products/store/vwap-agent-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/vwap-momentum-agent-v2.0.0.zip",
    videoUrl: "/videos/products/vwap-agent.mp4",
  },
  {
    id: "heikin-ashi-agent",
    stripePriceId: "price_1U09veLLyk0oaesNtE88tL1l",
    requiresDashboard: true,
    name: "Heikin Ashi Trend Agent",
    description: "Smoothed candles strip the noise; ADX confirms the trend is real. Enters on candle sequences and rides the move with a trailing stop.",
    longDescription: `Trend following fails on chop, and Heikin Ashi candles exist to hide chop. The agent trades the smoothed series but sizes and stops on real prices, with ADX as the gate that keeps it out of ranges.

Longer holds than the breakout agents, which makes it a useful counterweight in a farm.`,
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🕯️",
    productType: "agent",
    features: [
      "Heikin Ashi smoothing to filter chop",
      "Entry on consecutive bullish or bearish sequences",
      "ADX trend-strength confirmation",
      "Trailing stops sized to recent range",
      "Roughly twenty-two hour average hold",
      "Configurable sequence length and ADX floor",
      "Optional higher-timeframe trend gate",
      "Full journal entries with the deciding candles",
    ],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/heikin-ashi-signals.png",
    images: ["/images/products/store/heikin-ashi-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/heikin-ashi-agent-v2.0.0.zip",
    videoUrl: "/videos/products/heikin-ashi.mp4",
  },
  {
    id: "mean-reversion-agent",
    stripePriceId: "price_1U09veLLyk0oaesNh2F0P5l0",
    requiresDashboard: true,
    name: "Bollinger Mean Reversion Agent",
    description: "Buys oversold, sells overbought — RSI extremes, Bollinger touches and Z-score deviation, entered in scaled thirds rather than one brave click.",
    longDescription: `Mean reversion dies from conviction. This agent never takes a full position at the first touch — it scales in thirds and keeps an invalidation level that admits when the move is a trend, not a stretch.

Statistically conservative by design; it is the agent that quietly earns while the breakout agents are flat.`,
    price: 49,
    category: "trading",
    emoji: "📉",
    productType: "agent",
    badge: "AGENT",
    features: [
      "RSI extreme detection with adjustable bounds",
      "Bollinger Band touch and close-outside logic",
      "Z-score deviation sizing",
      "Scaled one-third entries at each level",
      "Hard invalidation when deviation keeps extending",
      "Conservative default risk profile",
      "Works on majors and liquid alts",
      "Per-symbol parameter overrides",
    ],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/mean-reversion-signals.png",
    images: ["/images/products/store/mean-reversion-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/mean-reversion-agent-v2.0.0.zip",
    videoUrl: "/videos/products/mean-reversion.mp4",
  },
  {
    id: "macro-sentiment-agent",
    stripePriceId: "price_1U09vfLLyk0oaesNxQMi8wuE",
    requiresDashboard: true,
    name: "Macro & On-Chain Sentiment Agent",
    description: "The coordination layer: reads Fed policy, whale flows, exchange in/outflows and social sentiment, then tells every other agent whether the farm is risk-on or risk-off.",
    longDescription: `Individual agents can't see the weather. This one does nothing but watch it, and then it changes how everything else behaves — sizing down into risk-off, releasing the brakes into risk-on.

It is the single highest-leverage agent in the set precisely because it never takes a trade of its own.`,
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🧠",
    productType: "agent",
    features: [
      "Fed policy and macro calendar ingestion",
      "On-chain whale flow and exchange in/outflow monitoring",
      "Social sentiment scoring",
      "Composite risk-on / risk-off regime signal",
      "Broadcasts regime to every agent in the farm",
      "Automatic defensive mode on regime flip",
      "Configurable weightings per input",
      "Regime history charted in the dashboard",
    ],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase", "OpenRouter AI"],
    image: "/images/products/store/macro-sentiment-signals.png",
    images: ["/images/products/store/macro-sentiment-signals.png", "/images/cival/gw-shot-agents.png"],
    downloadUrl: "downloads/macro-sentiment-agent-v2.0.0.zip",
    videoUrl: "/videos/products/macro-sentiment.mp4",
  },
  {
    id: "multi-strat-bundle",
    stripePriceId: "price_1U09vfLLyk0oaesNmhg0rCpa",
    isBundle: true,
    name: "Trader Edition",
    description: "All six strategy frameworks — Darvas, Elliott Wave, VWAP Pro, Heikin Ashi, Mean Reversion and Macro Sentiment — run as one coordinated farm under shared risk management.",
    longDescription: `A single strategy has one weather condition it likes. Six strategies, coordinated by a regime signal and capped by shared risk limits, is the closest thing here to an actual book.

The farm ships pre-configured — sensible correlation caps, per-agent allocation, and a defensive mode that triggers together.`,
    price: 249,
    wasPrice: 393,
    category: "trading",
    badge: "SAVE $144",
    emoji: "🏭",
    isFeatured: true,
    productType: "bundle",
    features: [
      "Everything in Core Edition",
      "All six strategy agents",
      "Pre-configured coordinated farm",
      "Shared risk limits across every strategy",
      "Macro Sentiment wired as the regime coordinator",
      "Saves $144 against buying the agents one by one",
    ],
    image: "/images/cival/gw-shot-farms.png",
    downloadUrl: "downloads/multi-strat-bundle-v2.0.0.zip",
    images: [
      "/images/cival/gw-shot-farms.png",
      "/images/cival/gw-shot-coordination.png",
      "/images/cival/gw-shot-analytics.png",
      "/images/products/store/darvas-agent-signals.png",
    ],
    videoUrl: "/videos/products/multi-strat-bundle.mp4",
  },
  {
    id: "full-stack-trader-bundle",
    stripePriceId: "price_1T7p7ZLLyk0oaesN9Mt54Oaz",
    isBundle: true,
    legacy: true,
    name: "The Full Stack Trader",
    description: "Dashboard + Darvas Box + Elliott Wave. The core AI trading toolkit in one purchase.",
    longDescription: `Superseded by the Trader and Desk editions. Kept here so existing owners keep access to their download.`,
    price: 299,
    category: "trading",
    emoji: "🎯",
    productType: "bundle",
    features: ["AI Trading Dashboard", "Darvas Box Breakout Agent", "Elliott Wave Pattern Agent", "All future updates"],
    image: "/images/products/store/dashboard-command-center.png",
    downloadUrl: "downloads/full-stack-trader-bundle-v2.0.0.zip",
  },
  {
    id: "everything-bundle",
    stripePriceId: "price_1U09vfLLyk0oaesN5dTydx9a",
    isBundle: true,
    name: "Desk Edition",
    description: "Everything we've built: the platform, all six agents, the Solana meme desk and the Arbitrum arbitrage engine — plus every new agent for a year.",
    longDescription: `If you're building a desk rather than testing an idea, this is the one. Crypto majors on Hyperliquid, Solana meme flow, and Arbitrum arbitrage all reporting into one risk view.

Buying the same parts individually comes to $551. This is $399, and it includes every new agent we ship over the next twelve months.`,
    price: 399,
    wasPrice: 551,
    category: "trading",
    badge: "SAVE $152",
    emoji: "🌟",
    productType: "bundle",
    isFeatured: true,
    features: [
      "Everything in Trader Edition",
      "Meme Trading Suite — Solana desk",
      "Flash Loan Arbitrage Engine — Arbitrum",
      "Every new agent we ship for a year",
      "Priority Discord channel",
      "Saves $152 against buying piece by piece",
    ],
    downloadUrl: "downloads/everything-bundle-v2.0.0.zip",
    /* Leads on the analytics view — the "one risk view" this edition's copy sells.
     * The farms shot belongs to Trader Edition, whose whole pitch is the farm;
     * sharing it made the two priciest SKUs indistinguishable in the store grid. */
    image: "/images/cival/gw-shot-analytics.png",
    images: [
      "/images/cival/gw-shot-analytics.png",
      "/images/cival/gw-shot-farms.png",
      "/images/cival/gw-shot-coordination.png",
      "/images/products/store/meme-token-scanner.png",
      "/images/products/store/flash-loan-flow.png",
    ],
    videoUrl: "/videos/products/everything-bundle.mp4",
  },
];

/** What each edition already contains — an add-on covered by an edition already
 * in the cart is shown as included rather than charged again. */
const AGENT_IDS = products.filter((p) => p.productType === "agent").map((p) => p.id);
const EXT_IDS = products.filter((p) => p.productType === "extension").map((p) => p.id);
export const EDITION_INCLUDES: Record<string, string[]> = {
  "trading-dashboard-template": [],
  "multi-strat-bundle": AGENT_IDS,
  "everything-bundle": [...AGENT_IDS, ...EXT_IDS],
};

export function getProductsByCategory(cat: ProductCategory): Product[] {
  return products.filter((p) => p.category === cat);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.includes(q)
  );
}
