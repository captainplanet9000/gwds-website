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
    description: "A trading dashboard you install and customize yourself. Includes editable source code and the Darvas Box strategy, with support for additional strategy plugins.",
    longDescription: "Core is the starting point for building your own trading workspace. It brings dashboard screens, the Darvas Box strategy and the code that connects them into one downloadable project.\n\nUse it to develop your workflow: configure agents, review trading activity and adapt the interface to your needs. Open the TypeScript source in your preferred editor or AI coding tool to change strategy rules, add features or build your own integrations.\n\nThis edition is for people comfortable installing and maintaining web applications, or working with a developer. If you prefer a dashboard with the server managed for you, choose managed hosting instead.",
    price: 99,
    category: "trading",
    badge: "EDITION",
    emoji: "📊",
    isFeatured: true,
    productType: "flagship",
    features: [
      "Editable dashboard and application source code",
      "Darvas Box strategy included — no separate purchase needed",
      "Screens for agents, trades, risk settings and analytics",
      "Additional screens for agent groups and backtesting",
      "Support for compatible strategy plugins",
      "Supabase connection code for accounts and stored data",
      "Database setup files and example configuration"
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
    description: "Look for price breakouts from a defined trading range, with a volume check before a signal. A strategy add-on for a compatible Cival dashboard; already included in Core and Trader.",
    longDescription: "Darvas Box looks for periods when price stays within a range, then checks for a breakout supported by trading volume. You can adjust the rules used to identify the range and confirm the move.\n\nThe download includes editable strategy code and configuration. It produces trade signals and suggested protection levels; your dashboard handles order placement and position management.\n\nCore and Trader already include Darvas. If you own either edition, use the included strategy rather than purchasing it again.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📦",
    productType: "agent",
    features: [
      "Identifies trading ranges from price highs and lows",
      "Checks trading volume when price breaks out",
      "Tracks more than one detected range",
      "Adjustable range and volume settings",
      "Explains the conditions behind each signal",
      "Editable TypeScript strategy code"
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
    description: "Look for potential Elliott Wave setups using price swings and Fibonacci ratios. An editable strategy add-on for a compatible Cival dashboard; included in Trader.",
    longDescription: "This strategy identifies swing highs and lows, then checks whether their sequence matches its Elliott Wave rules. Fibonacci ratios help it assess the size of retracements and possible wave completion.\n\nThe rules produce candidate setups, not a definitive interpretation of every wave. Review the signal reasoning and test the settings against your chosen market and timeframe.\n\nThe download includes strategy code and configuration. Your dashboard supplies charts, market data, order placement and position management. It does not include a separate chart-overlay tool.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🌊",
    productType: "agent",
    features: [
      "Finds swing highs and lows in candle data",
      "Checks sequences against Elliott impulse-wave rules",
      "Uses adjustable Fibonacci retracement tolerances",
      "Evaluates potential entries as patterns develop",
      "Provides the reasoning behind signals",
      "Editable strategy code and settings"
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
    description: "Compare price with its volume-weighted average to evaluate breakouts and possible reversals. A strategy add-on for a compatible Cival dashboard; included in Trader.",
    longDescription: "VWAP is the average price weighted by trading volume. This strategy compares price with VWAP and surrounding bands to look for breakouts or unusually large moves away from the average.\n\nYou can configure the calculation period, band width and anchored VWAP settings. Volume estimates come from price candles; they are not a live order-book or individual-trade feed.\n\nThe download includes editable strategy code and configuration. Your dashboard supplies market data, places orders and manages positions. The current release remains unavailable while configuration and integration issues are being corrected.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "📊",
    productType: "agent",
    features: [
      "Volume-weighted average price calculation",
      "Adjustable calculation period and price bands",
      "Anchored VWAP support",
      "Price-and-volume estimates from candles",
      "Breakout and reversal signal rules",
      "Editable strategy code and settings"
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
    description: "Use smoothed candles and trend checks to evaluate potential entries. A strategy add-on for a compatible Cival dashboard; included in Trader.",
    longDescription: "Heikin Ashi smooths price candles to make directional trends easier to evaluate. This strategy checks consecutive candles and their wicks, then uses an exponential moving average to confirm the trend.\n\nIt uses average true range, a measure of recent price movement, to suggest protection levels. Smoothing can delay signals, so test the settings for your chosen market and timeframe.\n\nThe download includes editable strategy code and configuration. Your dashboard handles order placement and position management. This version does not include an ADX trend-strength filter.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🕯️",
    productType: "agent",
    features: [
      "Converts price data into Heikin Ashi candles",
      "Optional extra smoothing",
      "Checks candle direction and wick patterns",
      "Confirms trends with an exponential moving average",
      "Suggests protection levels using recent volatility",
      "Editable strategy code and settings"
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
    description: "Look for potential price reversals using Bollinger Bands, Keltner Channels and RSI. A strategy add-on for a compatible Cival dashboard; included in Trader.",
    longDescription: "Mean reversion looks for price to move back toward an average after an unusually large move. This strategy combines price bands, momentum checks and reversal patterns to evaluate those conditions.\n\nIt also checks for narrow trading ranges and price repeatedly following a band. These checks help describe the setup; they cannot ensure that a strong trend will reverse.\n\nThe download includes editable strategy code and configuration. Your dashboard handles order sizing, placement and exits. The module does not place staged one-third orders by itself.",
    price: 49,
    category: "trading",
    emoji: "📉",
    productType: "agent",
    badge: "AGENT",
    features: [
      "Bollinger Bands for price relative to its average",
      "Keltner Channels for a second volatility comparison",
      "RSI momentum checks",
      "Detects narrow ranges and price following a band",
      "Checks double-top and double-bottom patterns",
      "Editable strategy code and settings"
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
    description: "An experimental strategy that uses price and volume to estimate market sentiment. For research and customization in a compatible Cival dashboard; included in Trader.",
    longDescription: "This research module looks for extreme price and volume conditions and evaluates potential contrarian trades. Its sentiment readings are estimates derived from market candles, not measurements of investor opinions.\n\nIt does not include news, social media, central-bank policy, wallet tracking or live funding and open-interest feeds. Some code variables use names from these topics, but their values are estimates or simulations.\n\nUse it to inspect and develop your own research ideas. It can produce buy, sell or no-trade signals, but it does not coordinate all your other agents. Your dashboard supplies market data, order execution and position management.",
    price: 49,
    category: "trading",
    badge: "AGENT",
    emoji: "🧠",
    productType: "agent",
    features: [
      "Uses candle prices and trading volume",
      "Inspectable sentiment estimates",
      "Rules for extreme conditions and contrarian setups",
      "Adjustable signal thresholds",
      "Buy, sell and no-trade signal output",
      "Editable research code; no external data feeds included"
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
    description: "The Core dashboard and all six strategy frameworks in one source-code package. Install it on your own infrastructure, choose your strategies and customize the code.",
    longDescription: "Trader includes everything in Core plus Elliott Wave, VWAP, Heikin Ashi, Bollinger Mean Reversion and Sentiment Proxy. Darvas is already part of Core, bringing the total to six strategy frameworks.\n\nUse one dashboard as a starting point for testing different approaches. Configure each strategy for your markets and timeframes, review its behavior and customize the TypeScript code as needed. The Sentiment Proxy framework is experimental and uses price and volume estimates, not external news or macroeconomic feeds.\n\nTrader is installed and maintained by you. It does not include managed hosting, trading funds or third-party service fees. At the listed prices, Core plus the five additional agents costs $344; Trader is $249, a $95 bundle saving.",
    price: 249,
    category: "trading",
    badge: "SAVE $95",
    emoji: "🏭",
    isFeatured: true,
    productType: "bundle",
    features: [
      "Core dashboard and Darvas Box strategy",
      "Elliott Wave strategy",
      "VWAP strategy",
      "Heikin Ashi trend strategy",
      "Bollinger Mean Reversion strategy",
      "Experimental Sentiment Proxy research strategy",
      "Editable source code and strategy configuration",
      "Save $95 against Core plus five separate add-ons"
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
