export type ProductCategory = "trading";

/** Product tier — drives store grouping and sorting. */
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
  /** Retained for historical order/download resolution, never shown for sale. */
  legacy?: boolean;
}

export const categories: {
  id: ProductCategory;
  label: string;
  emoji: string;
  color: string;
  description: string;
}[] = [
  {
    id: "trading",
    label: "Trading",
    emoji: "📈",
    color: "#4ade9f",
    description: "Source templates for trading-system interfaces, strategy research, and execution workflows.",
  },
];

export const products: Product[] = [
  {
    id: "trading-dashboard-template",
    stripePriceId: "price_1U09vdLLyk0oaesNmjX9ZSDL",
    name: "Core Edition",
    description: "The complete Cival TypeScript workspace: dashboard, Hyperliquid integration points, paper workflows, orchestration interfaces, risk controls, themes, and plugin slots.",
    longDescription: `Core Edition is a substantial source-code starting point, not a managed investment product. It includes exchange integration code, paper/demo workflows, risk-control modules, and the complete dashboard interface.

You supply and protect your own third-party accounts and API keys. Review every integration and validate order handling, position state, and risk controls in paper or testnet mode before considering live use.`,
    price: 99,
    wasPrice: 149,
    category: "trading",
    badge: "FOUNDER PRICE",
    emoji: "📊",
    isFeatured: true,
    productType: "flagship",
    features: [
      "Complete TypeScript dashboard source",
      "Goal configuration and execution-workflow source",
      "Multi-strategy farm and shared-risk interfaces",
      "P&L, position, and order-management interfaces",
      "Drawdown, correlation, and position-sizing modules",
      "Agent health scoring and benchmarking interfaces",
      "44 built-in themes and plugin extension points",
      "More than 1,700 source files in the verified release tree",
      "Windows and macOS quick-start scripts",
      "Commercial single-user source licence",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Supabase", "Hyperliquid"],
    image: "/images/products/demo/overview.jpg",
    images: [
      "/images/products/demo/overview.jpg",
      "/images/products/demo/live-trading.jpg",
      "/images/products/demo/agents.jpg",
      "/images/products/demo/farms.jpg",
      "/images/products/demo/performance.jpg",
      "/images/products/demo/analytics.jpg",
      "/images/products/demo/position-monitor.jpg",
      "/images/products/demo/strategy-performance.jpg",
      "/images/products/demo/journal.jpg",
      "/images/products/demo/plugins.jpg",
      "/images/products/demo/settings.jpg",
    ],
    downloadUrl: "downloads/ai-trading-dashboard-v1.0.1.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app",
    videoUrl: "/videos/products/cival-promo-v3.mp4",
  },
  {
    id: "strategy-pack",
    stripePriceId: "price_1U6fUeLLyk0oaesN0BYagEvp",
    name: "Seven-Strategy Research Pack",
    description: "Seven strategies that are actually wired into Cival's dispatcher, plus a reproducible Hyperliquid candle backtest harness and an evidence dossier that includes losing results.",
    longDescription: `This research pack contains the exact seven dispatcher paths present in the compatible Cival engine: Darvas Box, Williams Fractal, Multi-Strategy Consensus, Elliott Wave, Williams Alligator, Heikin Ashi, and Renko Breakout.

It also includes a deterministic evaluation harness, raw output, assumptions, fees, slippage, and failures. Backtests are historical simulations—not promises, forecasts, or evidence that a strategy will be profitable live.`,
    price: 149,
    category: "trading",
    badge: "EVIDENCE INCLUDED",
    emoji: "🧪",
    isFeatured: true,
    productType: "agent",
    requiresDashboard: true,
    features: [
      "Darvas Box breakout",
      "Williams Fractal breakout",
      "Multi-Strategy consensus",
      "Elliott Wave pattern logic",
      "Williams Alligator trend logic",
      "Heikin Ashi trend logic",
      "Renko breakout logic",
      "Reproducible historical-candle harness",
      "Machine-readable JSON and CSV results",
      "Evidence dossier that reports winners and losers",
    ],
    techStack: ["TypeScript", "Node.js", "Hyperliquid public candle API"],
    image: "/images/products/demo/strategy-performance.jpg",
    images: [
      "/images/products/demo/strategy-performance.jpg",
      "/images/products/store/darvas-agent-signals.png",
      "/images/products/store/elliott-wave-signals.png",
      "/images/products/store/heikin-ashi-signals.png",
      "/images/products/demo/performance.jpg",
      "/images/products/demo/agents.jpg",
    ],
    downloadUrl: "downloads/strategy-pack-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "meme-trading-suite",
    stripePriceId: "price_1U09vdLLyk0oaesNetEHtOa0",
    requiresDashboard: true,
    name: "Meme Trading Suite",
    description: "A nine-tab meme-market workspace with DexScreener scanning, configurable research workflows, wallet tracking, Solana integration points, and signal-ranking source.",
    longDescription: `This extension supplies a Solana-focused interface and reference workflows for scanning new pairs, applying configurable filters, tracking selected wallets, and evaluating entry rules.

The release page defines nine implemented tabs. Token filters cannot eliminate fraud or loss; independently review providers, key custody, and execution logic before using live capital.`,
    price: 79,
    category: "trading",
    badge: "EXTENSION",
    emoji: "🚀",
    isFeatured: true,
    productType: "extension",
    features: [
      "Nine implemented meme-market tabs",
      "DexScreener pair-scanning source",
      "Configurable research and execution scaffolds",
      "Selected-wallet tracking interfaces",
      "Jupiter routing integration points",
      "Signal engine with configurable scoring",
      "Twenty-eight TypeScript source files",
      "Install and environment documentation",
    ],
    techStack: ["Next.js", "TypeScript", "Solana web3.js", "Supabase", "DexScreener"],
    image: "/images/products/store/meme-token-scanner.png",
    images: [
      "/images/products/store/meme-token-scanner.png",
      "/images/products/demo/meme-trading.jpg",
      "/images/products/demo/plugins.jpg",
      "/images/products/demo/position-monitor.jpg",
    ],
    downloadUrl: "downloads/meme-trading-suite-v1.0.1.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/meme-coins",
    videoUrl: "/videos/products/meme-trading.mp4",
  },
  {
    id: "flash-loan-arbitrage",
    stripePriceId: "price_1U09vdLLyk0oaesNO6v6K9Ei",
    requiresDashboard: true,
    name: "Flash Loan Arbitrage Reference",
    description: "An Arbitrum cross-DEX research implementation with Aave V3 flash-loan mechanics, four venue adapters, simulation-first controls, and explicit operational risks.",
    longDescription: `This extension includes source for monitoring four Arbitrum DEX adapters, simulating routes and gas, and evaluating configurable net-edge thresholds.

It is reference software—not a turnkey profit engine. You still need contracts, RPC access, gas, key management, security review, and independent testing. Quoted or simulated opportunities may disappear before execution and reverted transactions can still cost gas.`,
    price: 79,
    category: "trading",
    badge: "EXTENSION",
    emoji: "⚡",
    productType: "extension",
    features: [
      "Four configurable Arbitrum venue adapters",
      "Aave V3 flash-loan reference flow",
      "Server-side executor scaffold with gas-aware checks",
      "Opportunity feed with estimated net edge",
      "Dry-run mode before live execution",
      "Configurable profit and slippage thresholds",
      "Contract-interaction source",
      "Install, environment, and risk documentation",
    ],
    techStack: ["TypeScript", "ethers", "Aave V3", "Arbitrum"],
    image: "/images/products/demo/flash-loans.jpg",
    images: [
      "/images/products/demo/flash-loans.jpg",
      "/images/products/store/flash-loan-flow.png",
      "/images/products/demo/plugins.jpg",
      "/images/products/demo/correlation.jpg",
    ],
    downloadUrl: "downloads/flash-loan-arbitrage-v1.1.1.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/flash-loans",
    videoUrl: "/videos/products/flash-loan.mp4",
  },
  {
    id: "multi-strat-bundle",
    stripePriceId: "price_1U6fUfLLyk0oaesNXjQHm8mS",
    isBundle: true,
    name: "Trader Edition",
    description: "Core Edition plus the Seven-Strategy Research Pack, packaged together with one licence and one verified release manifest.",
    longDescription: `Trader Edition contains the complete Core workspace and the Seven-Strategy Research Pack. The research dossier reports its assumptions and adverse results; it is not a profitability claim.

The nested release archives are independently hashed so you can verify exactly what was delivered.`,
    price: 199,
    wasPrice: 248,
    category: "trading",
    badge: "SAVE $49",
    emoji: "🏭",
    isFeatured: true,
    productType: "bundle",
    features: [
      "Everything in Core Edition",
      "Seven-Strategy Research Pack",
      "Reproducible evaluation harness and evidence dossier",
      "Shared compatibility and release manifest",
      "Commercial single-user source licence",
      "Saves $49 versus the two products separately",
    ],
    image: "/images/products/demo/farms.jpg",
    images: [
      "/images/products/demo/farms.jpg",
      "/images/products/demo/agents.jpg",
      "/images/products/demo/strategy-performance.jpg",
      "/images/products/demo/performance.jpg",
      "/images/products/demo/correlation.jpg",
      "/images/products/demo/position-monitor.jpg",
    ],
    downloadUrl: "downloads/trader-edition-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/farms",
    videoUrl: "/videos/products/multi-strat-bundle.mp4",
  },
  {
    id: "everything-bundle",
    stripePriceId: "price_1U6fUgLLyk0oaesNFqt7X8MN",
    isBundle: true,
    name: "Desk Edition",
    description: "Core, all seven strategy research modules, the Solana meme workspace, and the Arbitrum arbitrage reference in one verified source bundle.",
    longDescription: `Desk Edition combines every current Cival source product in one package: Core, the Seven-Strategy Research Pack, Meme Trading Suite, and Flash Loan Arbitrage Reference.

Every nested archive is listed with its version, byte size, and SHA-256 digest. No included module is a managed service or a promise of trading performance.`,
    price: 349,
    wasPrice: 406,
    category: "trading",
    badge: "COMPLETE DESK",
    emoji: "🌟",
    productType: "bundle",
    isFeatured: true,
    features: [
      "Everything in Trader Edition",
      "Meme Trading Suite",
      "Flash Loan Arbitrage Reference",
      "Versioned nested archives and release manifest",
      "Commercial single-user source licence",
      "Saves $57 versus buying separately",
    ],
    downloadUrl: "downloads/desk-edition-v1.0.0.zip",
    image: "/images/products/demo/live-trading.jpg",
    images: [
      "/images/products/demo/live-trading.jpg",
      "/images/products/demo/overview.jpg",
      "/images/products/demo/farms.jpg",
      "/images/products/demo/agents.jpg",
      "/images/products/demo/analytics.jpg",
      "/images/products/demo/meme-trading.jpg",
      "/images/products/demo/flash-loans.jpg",
      "/images/products/demo/plugins.jpg",
    ],
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
    videoUrl: "/videos/products/everything-bundle.mp4",
  },
  ...[
    ["darvas-indicator", "Darvas Box Breakout Agent", "price_1U09vdLLyk0oaesNIb1MgxJh", "downloads/darvas-indicator-v1.0.0.zip"],
    ["elliott-wave-agent", "Elliott Wave Pattern Agent", "price_1U09veLLyk0oaesNLxwlRQ8l", "downloads/elliott-wave-agent-v1.0.0.zip"],
    ["vwap-momentum-agent", "VWAP Pro Agent", "price_1U09veLLyk0oaesNBbMPGIFW", "downloads/vwap-momentum-agent-v1.0.0.zip"],
    ["heikin-ashi-agent", "Heikin Ashi Trend Agent", "price_1U09veLLyk0oaesNtE88tL1l", "downloads/heikin-ashi-agent-v1.0.0.zip"],
    ["mean-reversion-agent", "Bollinger Mean Reversion Agent", "price_1U09veLLyk0oaesNh2F0P5l0", "downloads/mean-reversion-agent-v1.0.0.zip"],
    ["macro-sentiment-agent", "Macro & On-Chain Sentiment Agent", "price_1U09vfLLyk0oaesNxQMi8wuE", "downloads/macro-sentiment-agent-v1.0.0.zip"],
    ["full-stack-trader-bundle", "The Full Stack Trader", "price_1T7p7ZLLyk0oaesN9Mt54Oaz", "downloads/full-stack-trader-bundle-v1.0.0.zip"],
  ].map(([id, name, stripePriceId, downloadUrl]): Product => ({
    id,
    name,
    stripePriceId,
    downloadUrl,
    description: "Historical product retained only for existing order and download resolution.",
    longDescription: "This SKU has been retired and is not available for new purchases.",
    price: 0,
    category: "trading",
    emoji: "📦",
    features: ["Existing-customer download continuity"],
    productType: id === "full-stack-trader-bundle" ? "bundle" : "agent",
    legacy: true,
  })),
];

/** Add-ons already covered by each edition are not charged twice in one cart. */
export const EDITION_INCLUDES: Record<string, string[]> = {
  "trading-dashboard-template": [],
  "multi-strat-bundle": ["trading-dashboard-template", "strategy-pack"],
  "everything-bundle": [
    "trading-dashboard-template",
    "strategy-pack",
    "meme-trading-suite",
    "flash-loan-arbitrage",
  ],
};

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((product) => product.category === category && !product.legacy);
}

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.isFeatured && !product.legacy);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.toLowerCase();
  return products.filter((product) =>
    !product.legacy &&
    (product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized) ||
      product.category.includes(normalized)),
  );
}
