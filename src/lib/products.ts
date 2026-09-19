import { productMedia } from './product-media';
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
    description: "Self-hosted trading dashboard source with the Darvas strategy, Supabase integration and a plugin loader. Installation and execution acceptance for the current 2.1 archive is in progress.",
    longDescription: "Core is a source-code edition for customers who operate their own application server and Supabase project. The archive includes dashboard screens, strategy code, API routes and a database schema. Darvas is already included.\n\nThe 2.1 audit found build and execution issues, so new sales are paused until a corrected archive passes installation and trade-lifecycle checks. A paper-mode setting alone is not a verified safety boundary. Review the setup guide for version-specific requirements.\n\nHosting, exchange funds and external service fees are separate. This source edition is not the same artifact as the managed customer dashboard.",
    price: 99,
    category: "trading",
    badge: "EDITION",
    emoji: "📊",
    isFeatured: true,
    productType: "flagship",
    features: [
  "Readable TypeScript application source",
  "Darvas strategy source included",
  "Agents, farms, trades, backtest, risk, analytics and settings screens",
  "Supabase Auth, REST and PostgreSQL integration",
  "Plugin manifest and strategy loader",
  "Database schema and environment example",
  "Self-hosting and maintenance required",
  "Release acceptance pending — new purchases paused"
],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "TailwindCSS"],
    image: "/images/guides/customer-journey-v1.png",
    images: [],
    downloadUrl: "downloads/ai-trading-dashboard-v2.0.0.zip",
    videoUrl: undefined,
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
    description: "A candle-based Darvas strategy module that identifies consolidation boxes and evaluates volume-confirmed breakouts. Already included in Core and Trader.",
    longDescription: "Inspect the box detection, volume checks and signal reasoning in readable TypeScript. The strategy returns signals and proposed protection levels; the dashboard runtime is responsible for placing, tracking and closing orders.\n\nA compatible dashboard edition is required. Validate the module with your symbols and candle interval before operation. No measured performance or automatic profit is promised.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📦",
    productType: "agent",
    features: [
  "Pivot-based box detection",
  "Breakout volume confirmation",
  "Tracks multiple detected boxes",
  "Configurable box and volume parameters",
  "Signal reasoning and indicator values",
  "Already included in Core and Trader"
],
    techStack: ["TypeScript", "Hyperliquid SDK"],
    image: "/images/products/verified-copy/darvas-indicator.svg",
    images: [],
    downloadUrl: "downloads/darvas-indicator-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "elliott-wave-agent",
    stripePriceId: "price_1U09veLLyk0oaesNLxwlRQ8l",
    requiresDashboard: true,
    name: "Elliott Wave Pattern Agent",
    description: "Swing-point and Fibonacci-rule strategy source for evaluating Elliott impulse patterns and potential entries.",
    longDescription: "The module evaluates supplied candles, identifies swing points and checks wave rules and Fibonacci tolerances. It returns a signal with reasoning and proposed protection levels.\n\nChart overlays, exchange execution and position management depend on the host dashboard and are not supplied by this strategy module. Trader already includes it.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🌊",
    productType: "agent",
    features: [
  "Swing-high and swing-low analysis",
  "Impulse-pattern rule validation",
  "Fibonacci retracement tolerances",
  "Wave-completion signal evaluation",
  "Readable configuration and strategy source",
  "Requires a compatible dashboard runtime"
],
    techStack: ["TypeScript", "Hyperliquid SDK"],
    image: "/images/products/verified-copy/elliott-wave-agent.svg",
    images: [],
    downloadUrl: "downloads/elliott-wave-agent-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "vwap-momentum-agent",
    stripePriceId: "price_1U09veLLyk0oaesNBbMPGIFW",
    requiresDashboard: true,
    name: "VWAP Strategy Agent",
    description: "Volume-weighted price bands, anchored VWAP and candle-derived volume analysis for breakout and mean-reversion signals.",
    longDescription: "This module computes VWAP and deviation bands from OHLCV candles. Its volume profile and delta are candle-derived estimates, not a live order-book or aggressor-trade feed.\n\nThe current 2.1 archive has a manifest configuration defect. A corrected candidate aligns the defaults and rejects collapsed bands; integration acceptance is pending. The base Core agent is Darvas, not VWAP. Trader includes this framework.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📊",
    productType: "agent",
    features: [
  "Configurable session length in candles",
  "Standard-deviation band multipliers",
  "Anchored VWAP calculation",
  "Candle-derived volume profile and delta",
  "Breakout and extreme-band signal paths",
  "No claimed average holding time or performance"
],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/verified-copy/vwap-momentum-agent.svg",
    images: [],
    downloadUrl: "downloads/vwap-momentum-agent-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "heikin-ashi-agent",
    stripePriceId: "price_1U09veLLyk0oaesNtE88tL1l",
    requiresDashboard: true,
    name: "Heikin Ashi Trend Agent",
    description: "Heikin Ashi candle smoothing with EMA confirmation and ATR-based protection levels for trend signals.",
    longDescription: "The source transforms supplied candles into a smoothed Heikin Ashi series, checks consecutive candle behavior and uses EMA confirmation. ATR informs proposed protection prices.\n\nThe current strategy does not implement the previously advertised ADX gate. Holding time depends on the market and runtime exit behavior; no measured average is claimed. Trader already includes it.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🕯️",
    productType: "agent",
    features: [
  "Heikin Ashi transformation",
  "Optional repeated smoothing",
  "Consecutive candle and wick analysis",
  "EMA trend confirmation",
  "ATR-based proposed protection prices",
  "Readable TypeScript and configurable parameters"
],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/verified-copy/heikin-ashi-agent.svg",
    images: [],
    downloadUrl: "downloads/heikin-ashi-agent-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "mean-reversion-agent",
    stripePriceId: "price_1U09veLLyk0oaesNh2F0P5l0",
    requiresDashboard: true,
    name: "Bollinger Mean Reversion Agent",
    description: "Bollinger Bands, Keltner Channels and RSI strategy source for evaluating mean-reversion and squeeze conditions.",
    longDescription: "The module evaluates supplied candles using Bollinger and Keltner bands, RSI, band-walking checks and reversal patterns. It returns signal reasoning and proposed entry and protection levels.\n\nIt does not itself execute scaled one-third orders or guarantee returns in ranging markets. Order sizing, ownership and exits belong to the dashboard runtime. Trader includes this framework.",
    price: 49,
    category: "trading",
    emoji: "📉",
    productType: "agent",
    badge: "AGENT",
    features: [
  "Bollinger Band analysis",
  "Keltner Channel comparison",
  "RSI checks",
  "Squeeze and band-walking detection",
  "Double-top and double-bottom checks",
  "Source and configuration for a compatible runtime"
],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/verified-copy/mean-reversion-agent.svg",
    images: [],
    downloadUrl: "downloads/mean-reversion-agent-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "macro-sentiment-agent",
    stripePriceId: "price_1U09vfLLyk0oaesNxQMi8wuE",
    requiresDashboard: true,
    name: "Sentiment Proxy Research Agent",
    description: "An experimental candle-derived sentiment framework. Uses price and volume proxies; it does not ingest Fed policy, whale wallets, social feeds or actual funding/open-interest data.",
    longDescription: "This framework derives sentiment-like indicators from OHLCV candles. Variables named funding, open interest, stablecoin flow and dominance are estimates or simulations, not measurements from those external sources.\n\nIt can return long or short signals. It is not a proven farm-wide regime coordinator and does not automatically control every other strategy. Use it as research source, validate its assumptions, and connect independently verified data if your use case requires real macro or on-chain inputs. Trader includes the same framework.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🧠",
    productType: "agent",
    features: [
  "OHLCV price and volume inputs",
  "Inspectable sentiment-proxy calculations",
  "Extreme-condition and contrarian signal logic",
  "Configurable thresholds",
  "Long, short and neutral signal output",
  "No bundled macro, on-chain, social or LLM data service"
],
    techStack: [
  "TypeScript",
  "OHLCV candles"
],
    image: "/images/products/verified-copy/macro-sentiment-agent.svg",
    images: [],
    downloadUrl: "downloads/macro-sentiment-agent-v2.0.0.zip",
    videoUrl: undefined,
  },
  {
    id: "multi-strat-bundle",
    stripePriceId: "price_1U09vfLLyk0oaesNmhg0rCpa",
    isBundle: true,
    name: "Trader Edition",
    description: "Core dashboard source plus all six strategy frameworks in one edition. Configure and validate your strategies, data and risk controls before operation.",
    longDescription: "Trader includes the Core application and six strategy frameworks: Darvas, Elliott Wave, VWAP, Heikin Ashi, Bollinger Mean Reversion and Sentiment Proxy.\n\nIt is a self-hosted source package, not a managed trading service. Shared risk and strategy coordination require installation and integration validation; the current archive is not certified for unattended execution. New purchases are paused during release acceptance.\n\nCore already includes Darvas, so buying Core plus the other five agents separately totals $344. Trader is listed at $249.",
    price: 249,
    wasPrice: 344,
    category: "trading",
    badge: "SAVE $95",
    emoji: "🏭",
    isFeatured: true,
    productType: "bundle",
    features: [
  "Core dashboard source included",
  "Six strategy frameworks in one archive",
  "Readable strategy implementations and manifests",
  "Customer-configured symbols, timeframes and allocations",
  "Supabase and application hosting required",
  "Saves $95 compared with Core plus five additional agents"
],
    image: "/images/guides/customer-journey-v1.png",
    downloadUrl: "downloads/multi-strat-bundle-v2.0.0.zip",
    images: [],
    videoUrl: undefined,
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
    legacy: true, // Production catalog disables this incomplete edition.
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

// Keep catalog, metadata, and galleries on the same authentic screenshot.
for (const product of products) {
  const gallery = productMedia[product.id];
  if (gallery) { product.image = gallery[0].src; product.images = gallery.map(image => image.src); }
}

/** What each edition already contains — an add-on covered by an edition already
 * in the cart is shown as included rather than charged again. */
const AGENT_IDS = products.filter((p) => p.productType === "agent").map((p) => p.id);
const EXT_IDS = products.filter((p) => p.productType === "extension").map((p) => p.id);
export const EDITION_INCLUDES: Record<string, string[]> = {
  "trading-dashboard-template": ["darvas-indicator"],
  "multi-strat-bundle": ["trading-dashboard-template", ...AGENT_IDS],
  "everything-bundle": ["trading-dashboard-template", "multi-strat-bundle", ...AGENT_IDS, ...EXT_IDS],
};

export function getProductsByCategory(cat: ProductCategory): Product[] {
  return products.filter((p) => p.category === cat);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured && !p.legacy);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.includes(q)
  );
}
