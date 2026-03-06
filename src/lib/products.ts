export type ProductCategory = "templates" | "trading" | "prompts" | "wallpapers" | "nfts" | "animations";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: ProductCategory;
  badge?: string;
  emoji: string;
  features: string[];
  techStack?: string[];
  image?: string;
  images?: string[];
  downloadUrl?: string;
  demoUrl?: string;
  stripePriceId?: string;
  isFeatured?: boolean;
}

export const categories: { id: ProductCategory; label: string; emoji: string; color: string; description: string }[] = [
  { id: "templates", label: "Templates", emoji: "🧩", color: "#8B5CF6", description: "Production-ready dashboards, apps, and tools." },
  { id: "trading", label: "Trading", emoji: "📈", color: "#10B981", description: "Indicators, agents, and systems for real-money execution." },
  { id: "prompts", label: "Prompts", emoji: "💬", color: "#F59E0B", description: "Curated prompt libraries for content, code, and trading." },
  { id: "wallpapers", label: "Wallpapers", emoji: "🎨", color: "#EC4899", description: "AI-generated wallpapers and digital art." },
  { id: "nfts", label: "NFTs", emoji: "💎", color: "#6366F1", description: "Limited-edition generative art and collectibles." },
  { id: "animations", label: "Animations", emoji: "🎬", color: "#EF4444", description: "Claymation, 3D renders, and animated content." },
];

export const products: Product[] = [
  // === FLAGSHIP TEMPLATES ===
  {
    id: "trading-dashboard-template",
    stripePriceId: "price_1T7AnhLLyk0oaesNcsOUw8UU",
    name: "AI Trading Dashboard",
    description: "Full-featured AI trading dashboard with autonomous agents, goal-based execution, multi-exchange support, 44 built-in themes, and a modular plugin system. Built with Next.js 15, TypeScript, and Supabase.",
    longDescription: `The same dashboard powering Cival Systems — packaged as a template you can deploy in 5 minutes.

**See it running right now:** $184K portfolio from $80K start, 6 autonomous agents, 68% win rate, 2,847 trades. The live demo isn't showing you what's possible — it's showing you what's already working.

**Deploy in 3 steps:**
1. Set up a free Supabase project and run the included SQL migration
2. Get your Hyperliquid API wallet key (trading only — can't withdraw your funds)
3. Run \`npm run dev\` locally or deploy to Vercel — paste your keys, and you're live

**What you get:**
- Autonomous trading agents with configurable strategies (VWAP, Darvas, Elliott Wave, Heikin Ashi, Renko, Williams Alligator, and more)
- Multi-strategy farm system — run multiple agents coordinated under one portfolio with shared scratchpad for inter-agent communication
- Goal-based trading — set profit targets and let agents execute
- Real-time trade tracking, P&L, positions, and order management
- Risk analytics with drawdown monitoring, correlation checks, and position sizing
- Agent health monitoring, performance scoring, and benchmarking
- Plugin system — extend with add-on modules (Meme Trading, Flash Loans, and more)
- Full source code (Next.js 15, TypeScript, Supabase, 2,400+ files)
- One-click deploy to Vercel — no local setup required

**🎨 44 Built-In Themes**
Make it yours. Choose from 44 professionally designed themes — from Cyberpunk and Cosmic Night to Clean Slate and Mocha Mousse. Switch themes instantly or customize your own. Need a branded look for your fund? We offer custom theme design as a service.

**Themes include:** Default, Amber Minimal, Amethyst Haze, Bold Tech, Bubblegum, Caffeine, Candyland, Catppuccin, Claude, Claymorphism, Clean Slate, Cosmic Night, Cyberpunk, Darkmatter, Doom 64, Elegant Luxury, Graphite, Kodama Grove, Midnight Bloom, Mocha Mousse, Modern Minimal, Mono, Nature, Neo Brutalism, Northern Lights, Notebook, Ocean Breeze, Pastel Dreams, Perpetuity, Quantum Rose, Retro Arcade, Sage Garden, Soft Pop, Solar Dusk, Starry Night, Sunset Horizon, Supabase, T3 Chat, Tangerine, Twitter, Vercel, Vintage Paper, Violet Bloom, and more.

**🧩 Modular Plugin System**
Start with the base dashboard and add capabilities as you need them. Each add-on plugs directly into the dashboard — no code changes required. Available add-ons include Meme Trading System, Flash Loans, Command Center, and strategy-specific agents.

**Not included:** Live API keys or exchange accounts (you bring your own).`,
    price: 149,
    category: "templates",
    badge: "FLAGSHIP",
    emoji: "📊",
    isFeatured: true,
    features: [
      "Autonomous AI trading agents",
      "Goal-based execution engine",
      "44 built-in themes",
      "Modular plugin system",
      "Hyperliquid + Bybit integration",
      "Real-time P&L tracking",
      "Risk analytics suite",
      "Agent health monitoring",
      "Farm orchestration & scratchpad",
      "Full TypeScript source code",
      "Vercel deploy ready",
      "Custom theme service available"
    ],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "TailwindCSS"],
    image: "/images/products/dashboard-overview-new.jpg",
    images: [
      "/images/products/dashboard-overview-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-farms-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-plugins-new.jpg",
      "/images/products/dashboard-correlation-new.jpg",
      "/images/products/dashboard-position-monitor-new.jpg",
      "/images/products/dashboard-system-status-new.jpg",
      "/images/products/dashboard-order-flow-new.jpg",
      "/images/products/dashboard-news-new.jpg",
      "/images/products/dashboard-goals-new.jpg",
      "/images/products/dashboard-settings-new.jpg",
    ],
    downloadUrl: "downloads/ai-trading-dashboard-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app",
  },
  {
    id: "meme-trading-system",
    stripePriceId: "price_1T7AnhLLyk0oaesNWVz1hMTi",
    name: "Meme Trading System",
    description: "The same system that finds trending meme coins before they 10x. Plugs into your AI Trading Dashboard in 30 seconds. Scan, execute, manage — fully automated.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Drop this into your dashboard's \`plugins/\` folder and start trading meme coins automatically.

The same system that finds trending meme coins before they 10x. Plugs into your AI Trading Dashboard in 30 seconds. Scan, execute, manage — fully automated.

**What you get:**
- Meme coin discovery engine (trending detection, volume analysis)
- Auto-trade execution on Hyperliquid
- Position monitoring with auto-stop-loss
- Meme agent scheduler (configurable scan intervals)
- Risk management (max positions, position sizing, drawdown limits)
- Performance dashboard with trade history
- Full source code + setup wizard
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the meme trading interface in action with real-time data.

**Warning:** Meme trading is high-risk. This tool gives you an edge, not a guarantee.

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 99,
    category: "trading",
    badge: "HOT",
    emoji: "🐸",
    isFeatured: true,
    features: [
      "Dashboard plugin",
      "Meme coin discovery engine",
      "Auto-trade execution",
      "Position monitoring",
      "Auto stop-loss",
      "Risk management",
      "Performance analytics",
      "Plug-and-play install"
    ],
    techStack: ["Next.js 15", "TypeScript", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/dashboard-plugins-new.jpg",
    images: [
      "/images/products/dashboard-plugins-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-overview-new.jpg",
    ],
    downloadUrl: "downloads/meme-trading-template-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/meme-coins",
  },
  {
    id: "flash-loan-arbitrage",
    stripePriceId: "price_1T7p7YLLyk0oaesNdr4UMLMS",
    name: "Flash Loan Arbitrage",
    description: "Automated cross-DEX arbitrage using Aave V3 flash loans on Arbitrum. Zero collateral, atomic execution, MEV protection. The same system scanning 15+ DEXes for profit opportunities 24/7.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Drop into your dashboard's \`plugins/\` folder and start finding arbitrage opportunities automatically.

Borrow millions with zero collateral. Buy low on one DEX, sell high on another. Repay in the same transaction. Keep the profit — or the whole thing reverts and you lose nothing but gas.

**What you get:**
- Real-time price scanner across 15+ DEXes (Uniswap V3, Camelot, PancakeSwap, SushiSwap, etc.)
- Aave V3 flash loan integration (0.05% fee, zero collateral)
- Multi-hop arbitrage pathfinding (up to 4 swaps per route)
- Gas optimization and profitability calculator
- MEV protection with private transaction submission
- Execution history with P&L tracking
- Auto-execute mode with configurable min profit threshold
- Smart contract (Solidity) + TypeScript execution engine
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the scanner finding real-time opportunities across DEXes.

**How it works:**
1. Scanner monitors price differences across 15+ DEXes every 12 seconds
2. When spread exceeds gas + fees, it triggers a flash loan from Aave V3
3. Atomic transaction: borrow → buy low → sell high → repay → profit
4. If the trade isn't profitable, the entire transaction reverts (you lose nothing)

**Risk profile:** Very low. Flash loans are atomic — either you profit or the transaction reverts. The only cost of a failed attempt is gas (~$2-3 on Arbitrum).

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 49,
    category: "trading",
    badge: "NEW",
    emoji: "⚡",
    features: [
      "Dashboard plugin",
      "15+ DEX monitoring",
      "Aave V3 flash loans",
      "Auto arbitrage execution",
      "MEV protection",
      "Gas optimization",
      "Multi-hop pathfinding",
      "Plug-and-play install"
    ],
    techStack: ["Solidity", "TypeScript", "Aave V3", "Arbitrum", "Next.js 15"],
    image: "/images/products/dashboard-flash-loans-new.jpg",
    images: [
      "/images/products/dashboard-flash-loans-new.jpg",
      "/images/products/dashboard-plugins-new.jpg",
      "/images/products/dashboard-overview-new.jpg",
    ],
    downloadUrl: "downloads/flash-loan-arbitrage-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/flash-loans",
  },
  {
    id: "second-brain-template",
    stripePriceId: "price_1T7AniLLyk0oaesN0hgWMRRO",
    name: "Second Brain",
    description: "Your entire life, organized. Tasks, docs, scripts, AI chat, weekly digests — all in one place. PARA methodology. Deploy to Vercel in 2 minutes.",
    longDescription: `Your entire life, organized. Tasks, docs, scripts, AI chat, weekly digests — all in one place. PARA methodology. Deploy to Vercel in 2 minutes.

**What you get:**
- Kanban task management with priorities
- Document CRUD with rich text editing
- Full-text search across all content
- AI chat integration (bring your own API key)
- Weekly digest auto-generation
- Calendar view with event tracking
- Script library with text-to-speech
- Timeline activity feed
- Dark mode with multiple themes

**Deploy to Vercel in 2 minutes** with the included setup script.`,
    price: 79,
    category: "templates",
    badge: "POPULAR",
    emoji: "🧠",
    isFeatured: true,
    features: [
      "PARA methodology",
      "Kanban task board",
      "Full-text search",
      "AI chat integration",
      "Weekly digest generation",
      "Script library + TTS",
      "Calendar view",
      "Vercel deploy button"
    ],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Inworld TTS"],
    image: "/images/products/second-brain-store.jpg",
    downloadUrl: "downloads/second-brain-template-v1.0.0.zip",
  },
  {
    id: "ai-saas-starter",
    stripePriceId: "price_1T7AniLLyk0oaesNEpAd01o0",
    name: "AI SaaS Starter Kit",
    description: "Skip 3 months of boilerplate. Auth, billing, AI API integration, admin dashboard, landing page — all wired up. Configure your env vars and ship.",
    longDescription: `Skip 3 months of boilerplate. Auth, billing, AI API integration, admin dashboard, landing page — all wired up. Configure your env vars and ship.

**What you get:**
- Supabase Auth with email/password + OAuth (Google, GitHub)
- Stripe billing integration (subscriptions + one-time payments)
- AI API integration layer (OpenAI, Anthropic, or bring your own)
- Admin dashboard with user management and analytics
- Marketing landing page with pricing table
- Transactional email templates (welcome, receipt, password reset)
- Full TypeScript source code
- One-click deploy to Vercel

**Built for speed.** Clone, configure env vars, deploy. Your SaaS is live.`,
    price: 99,
    category: "templates",
    emoji: "🚀",
    features: ["Auth + billing", "AI API integration", "Admin dashboard", "Landing page", "Email templates", "Stripe payments"],
    techStack: ["Next.js 15", "TypeScript", "Supabase Auth", "Stripe"],
        downloadUrl: "downloads/ai-saas-starter-v1.0.0.zip",
  },

  // === TRADING TOOLS ===
  {
    id: "darvas-indicator",
    stripePriceId: "price_1T7pe5LLyk0oaesNNXwg2VwU",
    name: "Darvas Box Breakout Agent",
    description: "Automated box breakout detection based on the Nicolas Darvas method. Identifies consolidation boxes, confirms breakouts with volume, and executes entries with trailing stops. Multi-timeframe analysis across 15m/1H/4H.",
    longDescription: `Nicolas Darvas turned $36,000 into $2.25 million using box breakouts. This plugin automates his method with modern AI. Multi-timeframe analysis, confidence scoring, and auto-execution.

**🔌 Plugin for the AI Trading Dashboard** — drop into your dashboard's \`plugins/\` folder and restart. Instant Darvas Box strategy.

**What you get:**
- Darvas Box breakout detection algorithm (TypeScript)
- Multi-timeframe analysis (1H, 4H, 1D)
- Auto box identification with consolidation zone mapping
- Entry/exit signal generation with confidence scoring
- Alert system for breakout notifications
- Dashboard widget component (DarvasOverlay.tsx)
- manifest.json for plug-and-play installation
- Full source code with documentation

👉 **Try the live demo** to see the Darvas agent running with real-time data in the Agents dashboard.

**Integrates with:** AI Trading Dashboard ($149) — just copy the folder into \`plugins/\` and restart.`,
    price: 199,
    category: "trading",
    emoji: "📦",
    features: ["Dashboard plugin", "Multi-timeframe", "Auto box detection", "Alert system", "Confidence scoring", "Plug-and-play install"],
    image: "/images/products/dashboard-agents-new.jpg",
    images: [
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    downloadUrl: "downloads/darvas-indicator-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "elliott-wave-agent",
    stripePriceId: "price_1T7pe6LLyk0oaesNN61g0lrl",
    name: "Elliott Wave Pattern Agent",
    description: "AI-powered Elliott Wave counting with automatic Fibonacci extension targets. Detects impulse waves (1-5) and corrective patterns (A-B-C), validates with Fibonacci ratios, and executes entries at high-probability wave positions.",
    longDescription: `The most sophisticated wave analysis you can deploy yourself. AI-powered wave counting, Fibonacci validation, autonomous trade execution. This is the same agent running live in our $184K portfolio.

**🔌 Plugin for the AI Trading Dashboard** — install into \`plugins/\` and the agent starts analyzing waves immediately.

**What you get:**
- AI wave pattern detection using DeepSeek/GPT-4 analysis
- Automatic wave counting (impulse + corrective patterns)
- Entry/exit signal generation based on wave position
- Fibonacci ratio validation for wave relationships
- Built-in risk management (position sizing, stop-loss, multi-target take-profit)
- Dashboard panel component (ElliottWavePanel.tsx)
- manifest.json for plug-and-play installation
- Full TypeScript source code

👉 **Try the live demo** to see the Elliott Wave agent analyzing patterns in real-time.

**This is the same agent running live in our $184K portfolio.** Extracted, documented, and packaged for you to deploy.

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 199,
    category: "trading",
    badge: "PREMIUM",
    emoji: "🌊",
    features: ["Dashboard plugin", "AI wave detection", "Auto entry/exit", "Fibonacci validation", "Risk management", "Plug-and-play"],
    image: "/images/products/dashboard-performance-new.jpg",
    images: [
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    downloadUrl: "downloads/elliott-wave-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "vwap-momentum-agent",
    stripePriceId: "price_1T7pe7LLyk0oaesN9l7hI7Zd",
    name: "VWAP Volume Breakout Agent",
    description: "Trades breakouts from the Volume Weighted Average Price with RSI divergence confirmation. Tracks accumulation/distribution zones, detects volume spikes, and enters when price breaks VWAP with momentum. 6-hour average hold time.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — The same VWAP agent running live in our $184K portfolio.

Combines VWAP (Volume Weighted Average Price) with volume divergence analysis and RSI momentum signals. Identifies accumulation zones, volume spikes, and momentum shifts to enter high-probability trades.

**What you get:**
- VWAP calculation engine with dynamic support/resistance levels
- Volume divergence detection (accumulation/distribution analysis)
- RSI momentum overlay with divergence alerts
- Multi-timeframe analysis (15m, 1H, 4H)
- Order flow analysis — buy/sell volume ratio tracking
- Auto-entry with confidence scoring (0-100)
- Trailing stop-loss with dynamic adjustment
- Agent thought stream — see exactly why it enters/exits
- Dashboard panel component (VWAPPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to watch the VWAP agent analyzing volume patterns in real-time.

**Live stats:** 892 trades | 64% win rate | +$7,100 P&L | 6.2h avg hold time | 82% confidence

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 199,
    category: "trading",
    badge: "LIVE AGENT",
    emoji: "📊",
    features: ["Dashboard plugin", "VWAP analysis", "Volume divergence", "RSI momentum", "Order flow tracking", "Auto-execution", "Confidence scoring", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/dashboard-agents-new.jpg",
    images: [
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    downloadUrl: "downloads/vwap-momentum-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "heikin-ashi-agent",
    stripePriceId: "price_1T7pe7LLyk0oaesNiRtA8Q70",
    name: "Heikin Ashi Trend Following Agent",
    description: "Trend-following agent using Heikin Ashi smoothed candles to filter market noise. Enters on consecutive bullish/bearish candle sequences, confirms with ADX trend strength, and rides moves with trailing stops. 22-hour average hold time.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Trend-following agent using Heikin Ashi smoothed candles.

Heikin Ashi candles filter market noise to reveal the true trend. This agent identifies consecutive bullish/bearish sequences, confirms with ADX trend strength, and rides momentum with trailing stops.

**What you get:**
- Heikin Ashi candle transformation engine
- Consecutive candle pattern detection (7+ candle sequences)
- ADX trend strength validation (enters only when ADX > 25)
- +DI/-DI crossover confirmation
- Trailing stop-loss that rides trends
- Multi-timeframe trend alignment (1H + 4H + 1D)
- Reversal doji detection for exit timing
- Agent thought stream — see trend analysis in real-time
- Dashboard panel component (HeikinAshiPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the Heikin Ashi agent riding trends across crypto assets.

**Live stats:** 412 trades | 61% win rate | +$3,750 P&L | 22.4h avg hold time | Catches multi-day trends

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 199,
    category: "trading",
    badge: "LIVE AGENT",
    emoji: "🕯️",
    features: ["Dashboard plugin", "Heikin Ashi candles", "ADX trend strength", "Trailing stops", "Multi-timeframe", "Reversal detection", "Noise filtering", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/dashboard-agents-new.jpg",
    images: [
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    downloadUrl: "downloads/heikin-ashi-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "mean-reversion-agent",
    stripePriceId: "price_1T7pe8LLyk0oaesNtleC9nah",
    name: "Bollinger Band Mean Reversion Agent",
    description: "Buys oversold assets and sells overbought using RSI extremes, Bollinger Band touches, and Z-score deviation. Enters with scaled 1/3 position sizing at each level. Conservative, statistical approach to catching bounces.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Finds oversold assets and trades the bounce.

When assets deviate significantly from their statistical mean, they tend to revert. This agent detects extreme deviations using RSI, Bollinger Bands, and Z-score calculations, then enters positions with scaled entries.

**What you get:**
- RSI oversold/overbought detection (configurable thresholds)
- Bollinger Band squeeze and expansion analysis
- Z-score statistical deviation measurement
- Scaled entry system (1/3 position sizing at each level)
- Mean reversion probability calculator (historical backtest)
- Correlation-aware positioning (avoids concentrated exposure)
- Auto stop-loss at extended deviation levels
- Agent thought stream — see statistical analysis live
- Dashboard panel component (MeanReversionPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to watch the agent finding oversold setups across crypto markets.

**Live stats:** 381 trades | 59% win rate | +$1,980 P&L | 8.6h avg hold time | 78% reversion accuracy

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 199,
    category: "trading",
    emoji: "📉",
    features: ["Dashboard plugin", "RSI analysis", "Bollinger Bands", "Z-score detection", "Scaled entries", "Mean reversion probability", "Correlation-aware", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/dashboard-analytics-new.jpg",
    images: [
      "/images/products/dashboard-analytics-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-correlation-new.jpg",
    ],
    downloadUrl: "downloads/mean-reversion-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "macro-sentiment-agent",
    stripePriceId: "price_1T7pe8LLyk0oaesNKFWCuZHo",
    name: "Macro & On-Chain Sentiment Agent",
    description: "Analyzes Fed policy, on-chain whale flows, social media sentiment scores, and exchange inflow/outflow data. Broadcasts risk-on/risk-off signals to all other agents. The coordination layer that decides when the farm goes aggressive or defensive.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — The intelligence layer that coordinates your trading farm.

This isn't just another indicator. The Macro & On-Chain Sentiment Agent reads the entire market environment — Fed policy, on-chain whale movements, social media sentiment, exchange flows — and broadcasts risk assessments to all other agents.

**What you get:**
- News sentiment analysis (Fed speeches, macro events, crypto news)
- On-chain metrics tracking (whale accumulation, exchange flows, supply dynamics)
- Social sentiment scoring (Twitter/X crypto sentiment 0-100)
- Google Trends integration for retail interest detection
- Macro risk score calculator (0-10 scale)
- VIX, DXY, and gold correlation monitoring
- Farm-wide broadcasting — sends risk signals to all agents
- Green-light/red-light system for portfolio-wide risk management
- Agent thought stream — see macro analysis in real-time
- Dashboard panel component (MacroSentimentPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the Macro Analyzer broadcasting risk signals to the entire farm.

**Live stats:** 251 trades | 71% win rate | +$6,370 P&L | 31.2h avg hold time | Coordinates 5 other agents

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 199,
    category: "trading",
    badge: "LIVE AGENT",
    emoji: "🧠",
    features: ["Dashboard plugin", "News sentiment", "On-chain analytics", "Social scoring", "Macro risk score", "Farm broadcasting", "VIX/DXY correlation", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase", "OpenRouter AI"],
    image: "/images/products/dashboard-agents-new.jpg",
    images: [
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
      "/images/products/dashboard-correlation-new.jpg",
    ],
    downloadUrl: "downloads/macro-sentiment-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
  },
  {
    id: "multi-strat-bundle",
    stripePriceId: "price_1T7AnkLLyk0oaesNv8HuW24O",
    name: "Multi-Strategy Bundle",
    description: "Six proven strategies working together. Darvas, Elliott Wave, Williams Alligator, Heikin Ashi, Renko, and VWAP-RSI-MACD. Run them as a coordinated farm with shared risk management. The full arsenal.",
    longDescription: `Six proven strategies working together. Darvas, Elliott Wave, Williams Alligator, Heikin Ashi, Renko, and VWAP-RSI-MACD. Run them as a coordinated farm with shared risk management. The full arsenal.

**🔌 Plugin for the AI Trading Dashboard** — drop all six strategies into \`plugins/\` and use the farm orchestrator to coordinate them.

**Strategies included:**
1. **Darvas Box** — Breakout detection with consolidation zones
2. **Williams Alligator** — Trend-following with jaw/teeth/lips smoothing
3. **Elliott Wave** — AI-powered wave pattern analysis
4. **Heikin Ashi** — Smoothed candle trend detection
5. **Renko Breakout** — Noise-filtered brick analysis
6. **Multi-Strategy** — VWAP + RSI + MACD combined signals

**Plus:**
- Farm orchestration system — run all 6 strategies simultaneously
- Position management with margin awareness
- Risk management and drawdown protection
- Macro market regime detection
- Full TypeScript source code
- Deploy guide for Vercel + Supabase

👉 **Try the live demo** to see the farm orchestration in action — multiple strategies coordinated under one portfolio.

**Integrates with:** AI Trading Dashboard ($149) — copy to \`plugins/\`, restart, done.`,
    price: 399,
    category: "trading",
    badge: "BEST VALUE",
    emoji: "🏭",
    features: ["6 strategies included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"],
    image: "/images/products/dashboard-farms-new.jpg",
    downloadUrl: "downloads/multi-strat-bundle-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/farms",
    images: [
      "/images/products/dashboard-farms-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
  },

  // === PROMPTS ===
  {
    id: "content-creator-prompts",
    stripePriceId: "price_1T7AnkLLyk0oaesNyHeUB0FO",
    name: "Content Creator Mega Pack",
    description: "500+ prompts organized by platform. TikTok hooks, YouTube thumbnails, Instagram captions, blog frameworks, email sequences. Copy, paste, customize, post.",
    price: 29,
    category: "prompts",
    badge: "500+ PROMPTS",
    emoji: "✍️",
    features: ["TikTok scripts", "YouTube thumbnails", "Instagram captions", "Blog frameworks", "Viral hooks", "Niche-specific"],
    image: "/images/products/content-creator-prompts.jpg",
    downloadUrl: "downloads/content-creator-prompts-v1.0.0.zip",
  },
  {
    id: "trading-analysis-prompts",
    stripePriceId: "price_1T7AnlLLyk0oaesNF7r5OOG9",
    name: "Trading Analysis Prompts",
    description: "200+ prompts for market analysis. Technical setups, fundamental research, risk assessment, portfolio review. Works with GPT-4, Claude, and Gemini.",
    price: 39,
    category: "prompts",
    emoji: "🔍",
    features: ["Market analysis", "Signal generation", "Risk assessment", "Portfolio review", "Multi-model compatible"],
    image: "/images/products/trading-analysis-prompts.jpg",
    downloadUrl: "downloads/trading-analysis-prompts-v1.0.0.zip",
  },
  {
    id: "ai-art-prompts",
    stripePriceId: "price_1T7AnlLLyk0oaesNO8J0tY3i",
    name: "AI Art Direction Pack",
    description: "300+ curated prompts for Midjourney, DALL-E, Flux, and Stable Diffusion. Claymation, cyberpunk, minimalist, abstract, photorealistic. Negative prompts included.",
    price: 24,
    category: "prompts",
    emoji: "🎨",
    features: ["300+ art prompts", "Multiple AI platforms", "Style categories", "Negative prompts", "Commercial license"],
    image: "/images/products/ai-art-prompts.jpg",
    downloadUrl: "downloads/ai-art-prompts-v1.0.0.zip",
  },

  // === WALLPAPERS ===
  {
    id: "cyber-wave-pack",
    stripePriceId: "price_1T7AnmLLyk0oaesNju8f36zt",
    name: "Cyber Wave Collection",
    description: "20 ultra-high-res AI wallpapers. Cyberpunk meets synthwave — neon grids, chrome structures, digital horizons.",
    price: 12,
    category: "wallpapers",
    emoji: "🌆",
    features: ["20 wallpapers", "4K + 8K", "Desktop + mobile", "Cyberpunk aesthetic", "Commercial license"],
    image: "/images/products/cyber-wave-pack.jpg",
    downloadUrl: "downloads/cyber-wave-pack-v1.0.0.zip",
  },
  {
    id: "abstract-flow-pack",
    stripePriceId: "price_1T7AnmLLyk0oaesN2Nsd1Ati",
    name: "Abstract Flow Collection",
    description: "15 premium abstract wallpapers. Fluid gradients, geometric patterns, and organic forms in a dark palette.",
    price: 9,
    category: "wallpapers",
    emoji: "🌀",
    features: ["15 wallpapers", "4K resolution", "Desktop + mobile", "Abstract art", "Dark palette"],
    image: "/images/products/abstract-flow-pack.jpg",
    downloadUrl: "downloads/abstract-flow-pack-v1.0.0.zip",
  },

  // === NFTs ===
  {
    id: "400-club",
    name: "The 400 Club",
    description: "9,400-piece generative art collection on Ethereum. Unique character NFTs with trait-based rarity and community perks.",
    price: 0,
    category: "nfts",
    badge: "COMING SOON",
    emoji: "🎭",
    features: ["9,400 unique pieces", "Ethereum mainnet", "Trait rarity", "Community access", "Holder benefits"],
    image: "/images/products/400-club.jpg",
  },

  // === ANIMATIONS ===
  {
    id: "clay-verse-pack",
    stripePriceId: "price_1T7AnmLLyk0oaesNJeQr3uRq",
    name: "Clay Verse Animation Pack",
    description: "10 detailed AI video prompts + 5 style reference cards + 3 TikTok scripts. Everything you need to create stunning claymation content.",
    longDescription: `10 detailed AI video prompts + 5 style reference cards + 3 TikTok scripts. Everything you need to create stunning claymation content.

**What you get:**
- 10 detailed claymation prompts for AI video generation (Runway Gen-3, Kling, Pika)
- 5 style reference cards — fingerprint-clay, smooth-polymer, rough-rustic, neon-glaze, pastel-whimsy
- 3 ready-to-film TikTok scripts (60s format) for claymation content
- Platform settings guides for Runway, Kling, and ComfyUI
- Commercial license included

**Each prompt includes:** scene description, camera angles, lighting setup, mood, and style notes. Drop these into any AI video tool and get professional clay animation results.`,
    price: 19,
    category: "animations",
    badge: "NEW",
    emoji: "🏗️",
    features: ["10 video prompts", "5 style guides", "3 TikTok scripts", "Runway + Kling + ComfyUI", "Commercial license"],
    image: "/images/products/clay-verse-pack.jpg",
    downloadUrl: "downloads/clay-verse-pack-v1.0.0.zip",
  },
  {
    id: "3d-render-pack",
    stripePriceId: "price_1T7AnnLLyk0oaesNtJf28hMp",
    name: "3D Product Renders Pack",
    description: "20 isometric 3D render prompts + 5 Blender scene templates + batch generation scripts. Professional product photography powered by AI.",
    longDescription: `20 isometric 3D render prompts + 5 Blender scene templates + batch generation scripts. Professional product photography powered by AI.

**What you get:**
- 20 isometric 3D render prompts for Midjourney, DALL-E, and Flux
- 10 product types × multiple scene setups (floating platform, studio lighting, neon accent, minimalist)
- 5 Blender scene description templates for common product shot setups
- 5 curated color palettes (tech-minimal, luxury-dark, vibrant-pop, earth-organic, neon-future)
- 2 Python batch generation scripts (combine products × styles × palettes automatically)
- Best practices guide for AI-generated product photography

**Each prompt includes:** full prompt text, negative prompts, and recommended settings per platform.`,
    price: 34,
    category: "animations",
    badge: "NEW",
    emoji: "🎥",
    features: ["20 render prompts", "5 Blender templates", "5 color palettes", "Batch scripts", "Multi-platform"],
    image: "/images/products/3d-render-pack.jpg",
    downloadUrl: "downloads/3d-render-pack-v1.0.0.zip",
  },
  {
    id: "full-stack-trader-bundle",
    stripePriceId: "price_1T7p7ZLLyk0oaesN9Mt54Oaz",
    name: "The Full Stack Trader",
    description: "Dashboard + Darvas Box + Elliott Wave + Analysis Prompts. Everything you need to run AI-powered trading.",
    longDescription: `Save $289 — get the core trading toolkit in one purchase.

**4 products included:**
• **AI Trading Dashboard** ($149) — Full autonomous trading platform with 10+ strategies
• **Darvas Box Breakout Agent** ($199) — Volume-confirmed box breakout detection
• **Elliott Wave Pattern Agent** ($199) — AI-powered wave counting with Fibonacci targets
• **Trading Analysis Prompts** ($39) — 50+ prompts for technical and fundamental analysis

**Total value: $588 — You pay $299.**

👉 **Try the live demo** to see all these systems working together in one unified dashboard.

All four products delivered instantly. Same source code, same updates, same support.`,
    price: 299,
    category: "trading" as ProductCategory,
    badge: "SAVE $289",
    emoji: "🎯",
    features: ["AI Trading Dashboard", "Darvas Box Breakout Agent", "Elliott Wave Pattern Agent", "Trading Analysis Prompts", "All future updates", "$289 savings"],
    isFeatured: true,
    stripePriceId: "",
    image: "/images/products/dashboard-overview-new.jpg",
    images: [
      "/images/products/dashboard-overview-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
  },
  {
    id: "ai-builder-bundle",
    stripePriceId: "price_1T7p7aLLyk0oaesNR2K45OWk",
    name: "AI Builder Pack",
    description: "Dashboard + SaaS Starter + Second Brain. Ship AI-powered products faster.",
    longDescription: `Save $108 — the complete toolkit for building and launching AI products.

**3 products included:**
• **AI Trading Dashboard** ($149) — Production-ready Next.js trading platform
• **AI SaaS Starter Kit** ($99) — Auth, billing, AI integration boilerplate
• **Second Brain** ($79) — PARA-organized knowledge management system

**Total value: $327 — You pay $219.**

Three production-ready codebases. Fork, customize, deploy.`,
    price: 219,
    category: "templates" as ProductCategory,
    badge: "SAVE $108",
    emoji: "🏗️",
    features: ["AI Trading Dashboard", "AI SaaS Starter Kit", "Second Brain Template", "All source code", "Vercel-ready", "$108 savings"],
    stripePriceId: "",
    image: "/images/products/dashboard-overview-new.jpg",
    images: [
      "/images/products/dashboard-overview-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-system-status-new.jpg",
    ],
  },
  {
    id: "content-empire-bundle",
    stripePriceId: "price_1T7p7aLLyk0oaesNByy8qtOV",
    name: "Content Empire Pack",
    description: "All three prompt packs for content creators, traders, and AI artists.",
    longDescription: `Save $33 — every prompt pack in one download.

**3 products included:**
• **Content Creator Mega Pack** ($29) — 500+ prompts for TikTok, YouTube, Twitter, newsletters
• **AI Art Direction Pack** ($24) — 300+ prompts for Midjourney, DALL-E, Stable Diffusion
• **Trading Analysis Prompts** ($39) — 200+ prompts for technical and fundamental analysis

**Total value: $92 — You pay $59.**`,
    price: 59,
    category: "prompts" as ProductCategory,
    badge: "SAVE $33",
    emoji: "👑",
    features: ["Content Creator Mega Pack", "AI Art Direction Pack", "Trading Analysis Prompts", "400+ total prompts", "All formats", "$33 savings"],
    stripePriceId: "",
  },
  {
    id: "everything-bundle",
    stripePriceId: "price_1T7p7aLLyk0oaesNjdZqcSEx",
    name: "GWDS Everything Bundle",
    description: "All 19 products. Every agent, every template, every tool, every prompt pack. One price.",
    longDescription: `The ultimate deal — every single product in the GWDS store for over 60% off.

**19 products included:**
• **AI Trading Dashboard** ($149)
• **Flash Loan Arbitrage** ($49)
• **Meme Trading System** ($99)
• **VWAP Volume Breakout Agent** ($199)
• **Elliott Wave Pattern Agent** ($199)
• **Darvas Box Breakout Agent** ($199)
• **Heikin Ashi Trend Following Agent** ($199)
• **Bollinger Band Mean Reversion Agent** ($199)
• **Macro & On-Chain Sentiment Agent** ($199)
• **Multi-Strategy Bundle** ($399)
• **Second Brain** ($79)
• **AI SaaS Starter Kit** ($99)
• **Content Creator Mega Pack** ($29)
• **Trading Analysis Prompts** ($39)
• **AI Art Direction Pack** ($24)
• **Cyber Wave Collection** ($12)
• **Abstract Flow Collection** ($9)
• **Clay Verse Animation Pack** ($19)
• **3D Product Renders Pack** ($34)

**Total value: $2,234 — You pay $899.**

👉 **Try the live demo** to see all 6 trading agents working together in real-time.

Lifetime access. All future updates included.`,
    price: 899,
    category: "templates" as ProductCategory,
    badge: "60% OFF",
    emoji: "💎",
    features: ["All 19 products", "6 trading agents", "Every template & tool", "Every prompt pack", "All wallpapers & animations", "Lifetime updates", "$1,341 savings"],
    isFeatured: true,
    stripePriceId: "",
    image: "/images/products/dashboard-overview-new.jpg",
    images: [
      "/images/products/dashboard-overview-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-farms-new.jpg",
      "/images/products/dashboard-performance-new.jpg",
      "/images/products/dashboard-plugins-new.jpg",
      "/images/products/dashboard-correlation-new.jpg",
      "/images/products/dashboard-position-monitor-new.jpg",
    ],
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
  },
];

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
