export type ProductCategory = "trading";

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
  { id: "trading", label: "Trading", emoji: "📈", color: "#10B981", description: "Indicators, agents, and systems for real-money execution." },

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
    category: "trading",
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

  {
    id: "full-stack-trader-bundle",
    stripePriceId: "price_1T7p7ZLLyk0oaesN9Mt54Oaz",
    name: "The Full Stack Trader",
    description: "Dashboard + Darvas Box + Elliott Wave. The core AI trading toolkit in one purchase.",
    longDescription: `Save $248 — get the core trading toolkit in one purchase.

**3 products included:**
• **AI Trading Dashboard** ($149) — Full autonomous trading platform with 10+ strategies
• **Darvas Box Breakout Agent** ($199) — Volume-confirmed box breakout detection
• **Elliott Wave Pattern Agent** ($199) — AI-powered wave counting with Fibonacci targets

**Total value: $547 — You pay $299.**

👉 **Try the live demo** to see all these systems working together in one unified dashboard.

All three products delivered instantly. Same source code, same updates, same support.`,
    price: 299,
    category: "trading" as ProductCategory,
    badge: "SAVE $248",
    emoji: "🎯",
    features: ["AI Trading Dashboard", "Darvas Box Breakout Agent", "Elliott Wave Pattern Agent", "All future updates", "$248 savings"],
    isFeatured: true,
    image: "/images/products/dashboard-overview-new.jpg",
    images: [
      "/images/products/dashboard-overview-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-agents-new.jpg",
      "/images/products/dashboard-strategy-performance-new.jpg",
      "/images/products/dashboard-analytics-new.jpg",
    ],
    downloadUrl: "downloads/full-stack-trader-bundle-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
  },
  {
    id: "everything-bundle",
    stripePriceId: "price_1T7tb4LLyk0oaesN76sJI7HL",
    name: "GWDS Everything Bundle",
    description: "Every agent, every template, every tool. The entire GWDS trading arsenal in one package.",
    longDescription: `The ultimate deal — every single product in the GWDS store.

**9 products included:**
• **AI Trading Dashboard** ($149) — Full autonomous trading platform
• **Flash Loan Arbitrage** ($49) — Cross-DEX arbitrage with Aave V3
• **Meme Trading System** ($99) — Meme token scanner & trader
• **Darvas Box Breakout Agent** ($199) — Volume-confirmed breakout detection
• **Elliott Wave Pattern Agent** ($199) — AI-powered wave counting
• **VWAP Volume Breakout Agent** ($199) — Volume-weighted momentum
• **Heikin Ashi Trend Following Agent** ($199) — Noise-filtered trend riding
• **Bollinger Band Mean Reversion Agent** ($199) — Statistical mean reversion
• **Macro & On-Chain Sentiment Agent** ($199) — Macro + on-chain signals

**Total value: $1,690 — You pay $699.**

👉 **Try the live demo** to see all 6 trading agents working together in real-time.

Lifetime access. All future updates included.`,
    price: 699,
    category: "trading" as ProductCategory,
    badge: "60% OFF",
    emoji: "💎",
    features: ["All 9 products", "6 trading agents", "Dashboard + Flash Loans + Meme Trading", "Lifetime updates", "$991 savings"],
    isFeatured: true,
    downloadUrl: "downloads/everything-bundle-v1.0.0.zip",
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
