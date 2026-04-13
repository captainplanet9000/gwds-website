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
  requiresDashboard?: boolean;
  isBundle?: boolean;
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
    description: "Complete AI trading dashboard v2 — VWAP + RSI agent, prop firm futures trading, flash loan arbitrage, meme coin sniping, market regime detection, strategy optimizer, trade learning, and a plugin system. 80+ dashboard pages. Deploy on Vercel or self-host.",
    longDescription: `A production-grade trading dashboard v2 with autonomous agents, prop firm futures trading, flash loan arbitrage, meme coin sniping, and 80+ dashboard pages. Deploy on Vercel (serverless) or self-host. 2,100+ files of TypeScript source code.

**🤖 Includes 1 Fully Functional Agent: VWAP + RSI Strategy**
The dashboard ships with a working VWAP Volume Breakout agent that combines Volume-Weighted Average Price analysis with RSI divergence detection. It trades autonomously on Hyperliquid — no additional purchases required to start trading.

Want more strategies? Add premium agents (Darvas Box, Elliott Wave, Heikin Ashi, Mean Reversion, Macro Sentiment) from our store. Each one plugs directly into the dashboard.

**Get running in 1 click:**
1. Extract the zip and double-click \`QUICK-START.bat\` (Windows) or \`QUICK-START.command\` (Mac)

That's it. The script installs dependencies, creates your config file, and opens the dashboard in your browser. A Setup Wizard walks you through connecting your API keys.

**Or deploy to Vercel** — push to GitHub and connect to Vercel for a hosted dashboard. Add your environment variables in the Vercel dashboard.

**Want to try it first?** Demo mode is enabled by default — explore the full dashboard with sample data before connecting any API keys.

**What's included:**
- VWAP + RSI trading agent — fully functional, ready to trade out of the box
- Agent framework — add more agents as you need them
- Multi-strategy farm system — run multiple agents coordinated under one portfolio
- Goal-based trading engine — set targets and let agents execute
- Real-time trade tracking, P&L, positions, and order management
- Risk analytics with drawdown monitoring, correlation checks, and position sizing
- Agent health monitoring, performance scoring, and benchmarking
- Plugin system — extend with add-on modules (Meme Trading, Flash Loans, and more)
- **NEW** Prop Firm Trading Agent — automated futures trading via Tradovate (Apex, etc.)
- **NEW** Market Regime Detection — agents adapt to trending/ranging/transitional markets
- **NEW** Strategy Optimizer — backtest and optimize your strategies
- **NEW** Trade Learning — post-trade analysis feeds back into agent decisions
- **NEW** Vercel-ready — deploys to Vercel free tier for hosted dashboard
- Full source code (Next.js 15, TypeScript, Supabase, 2,100+ files)
- One-click setup — double-click QUICK-START and you're running
- Deploy to Vercel for a hosted dashboard (free tier works)

**🎨 44 Built-In Themes**
Choose from 44 professionally designed themes — from Cyberpunk and Cosmic Night to Clean Slate and Mocha Mousse. Switch instantly or build your own.

**Themes include:** Default, Amber Minimal, Amethyst Haze, Bold Tech, Bubblegum, Caffeine, Candyland, Catppuccin, Claude, Claymorphism, Clean Slate, Cosmic Night, Cyberpunk, Darkmatter, Doom 64, Elegant Luxury, Graphite, Kodama Grove, Midnight Bloom, Mocha Mousse, Modern Minimal, Mono, Nature, Neo Brutalism, Northern Lights, Notebook, Ocean Breeze, Pastel Dreams, Perpetuity, Quantum Rose, Retro Arcade, Sage Garden, Soft Pop, Solar Dusk, Starry Night, Sunset Horizon, Supabase, T3 Chat, Tangerine, Twitter, Vercel, Vintage Paper, Violet Bloom, and more.

**🧩 Expand With Add-Ons**
The dashboard is fully functional on its own. When you're ready for more, add:
- **Trading Agents** ($199 each) — Darvas Box, Elliott Wave, Heikin Ashi, Mean Reversion, Macro Sentiment
- **Extensions** ($99 each) — Meme Trading Suite, Flash Loan Arbitrage Engine
- **Bundles** — Save up to $842 when you buy multiple products together

**Not included:** Live API keys, exchange accounts, funded accounts, or trading signals. You bring your own keys, your own capital, and your own risk management. This is a software tool — not financial advice. See our [Trading Disclaimer](/disclaimer).

⚠️ *Trading involves substantial risk of loss. Past performance of the developer's personal use does not guarantee your results. See full [disclaimer](/disclaimer).*`,
    price: 149,
    category: "trading",
    badge: "FLAGSHIP",
    emoji: "📊",
    isFeatured: true,
    productType: "flagship",
    features: [
      "1 fully functional VWAP + RSI agent included",
      "Trades autonomously on Hyperliquid",
      "NEW: Prop Firm Futures Trading (Tradovate)",
      "NEW: Market Regime Detection",
      "NEW: Strategy Optimizer & Trade Learning",
      "80+ dashboard pages",
      "Goal-based execution engine",
      "44 built-in themes",
      "Plugin system for adding more agents",
      "Real-time P&L & position tracking",
      "Risk analytics & drawdown monitoring",
      "Vercel-ready deployment",
      "Full TypeScript source code (2,100+ files)",
      "One-click setup (QUICK-START script included)"
    ],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "TailwindCSS"],
    image: "/images/products/store/dashboard-command-center.png",
    images: [
      "/images/products/gallery/dashboard-overview.jpg",
      "/images/products/gallery/dashboard-live-trading.jpg",
      "/images/products/gallery/dashboard-agents.jpg",
      "/images/products/gallery/dashboard-performance.jpg",
      "/images/products/gallery/dashboard-farms.jpg",
      "/images/products/gallery/dashboard-risk-monitor.jpg",
      "/images/products/gallery/dashboard-correlation.jpg",
      "/images/products/gallery/dashboard-trade-journal.jpg",
      "/images/products/gallery/dashboard-strategy-perf.jpg",
      "/images/products/gallery/dashboard-plugins.jpg",
      "/images/products/gallery/dashboard-goals.jpg",
      "/images/products/gallery/dashboard-settings-themes.jpg",
    ],
    downloadUrl: "downloads/ai-trading-dashboard-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app",
    videoUrl: "/videos/products/cival-promo-v3.mp4",
  },
  {
    id: "meme-trading-suite",
    stripePriceId: "price_1T83k3LLyk0oaesNL7bGZ12J",
    requiresDashboard: true,
    name: "Meme Trading Suite",
    description: "The complete meme coin trading system — 9-tab dashboard with DexScreener scanner, autonomous agents, smart money tracking, Solana execution, and signal engine. 28 source files, fully integrated.",
    longDescription: `🚀 **Premium Plugin for AI Trading Dashboard** — A comprehensive meme coin trading UI and engine architecture. 28 source files of production TypeScript.

**What you're buying:** The complete frontend, backend, and agent framework for meme coin trading — scanner UI, agent engine, signal system, and execution templates. This is source code and architecture you customize and deploy yourself.

**9-Tab Dashboard UI:**
1. **Scanner** — DexScreener trending tokens with volume/mcap filters
2. **New Pairs** — Tokens less than 24h old across all chains
3. **Watchlist** — Track tokens with configurable price alerts
4. **Search** — Find any token across all supported chains
5. **Trades** — Trade history with P&L analytics
6. **Alerts** — Price, volume, and market cap alert system
7. **Smart Money** — Whale wallet tracking interface
8. **Agents** — Autonomous agent framework (momentum, sniper, scalper strategy templates)
9. **Settings** — Agent config, wallet management, risk parameters

**Engine & Backend (28 files):**
- Meme Agent Engine with autonomous cycle management
- Multi-factor Signal Engine for trade scoring
- Strategy template library (momentum, sniper, scalper)
- Solana trade execution framework via Jupiter aggregator
- Encrypted wallet management
- Agent scheduler, monitor, and sync system
- Full DexScreener API integration

**What makes this different:**
- Complete architecture — not just alerts, but a full execution framework
- Smart money tracking interface for whale wallet analysis
- Signal engine architecture that scores opportunities across multiple factors
- Agent framework with configurable risk limits
- 1960-line dashboard UI with full inline styles (no component library needed)

👉 **Try the live demo** to see the 9-tab interface with real-time DexScreener data.

⚠️ **Risk Warning:** Meme coin trading is extremely high-risk. Most meme coins lose most or all of their value. This software provides tools for trading — it does not guarantee profits or reduce the inherent risk of meme coin markets. You could lose your entire investment. See our [Trading Disclaimer](/disclaimer).

**Installation:** Run the included \`install.bat\` (Windows) or \`bash install.command\` (Mac) — it copies everything to the right place. Restart your dashboard and the Meme Trading tabs appear in the sidebar.

**Requires:** AI Trading Dashboard ($149) + Supabase + Solana RPC endpoint
**You provide:** Your own exchange keys, wallets, capital, and risk management.`,
    price: 99,
    category: "trading",
    badge: "EXTENSION",
    emoji: "🚀",
    isFeatured: true,
    productType: "extension",
    features: [
      "9-tab dashboard plugin",
      "DexScreener token scanner",
      "New pairs discovery engine",
      "Smart money wallet tracking",
      "Autonomous meme trading agents",
      "Solana on-chain execution",
      "Multi-factor signal engine",
      "3 built-in strategies (momentum, sniper, scalper)",
      "Encrypted wallet management",
      "Configurable price & volume alerts",
      "Agent scheduling & monitoring",
      "Trade history with P&L analytics",
      "28 source files, full TypeScript",
      "Plug-and-play install"
    ],
    techStack: ["Next.js 15", "TypeScript", "@solana/web3.js", "Supabase", "DexScreener API"],
    image: "/images/products/store/meme-token-scanner.png",
    images: [
      "/images/products/store/meme-token-scanner.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/meme-trading-suite-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/meme-coins",
    videoUrl: "/videos/products/meme-trading.mp4",
  },
  {
    id: "flash-loan-arbitrage",
    stripePriceId: "price_1T83kgLLyk0oaesNpjgeKsdR",
    requiresDashboard: true,
    name: "Flash Loan Arbitrage Engine",
    description: "Automated cross-DEX arbitrage with multi-DEX scanning (Uniswap V3, PancakeSwap V3, Camelot V3, Ramses V2), server-side auto-executor, and real-time opportunity detection. Zero collateral via Aave V3 flash loans on Arbitrum.",
    longDescription: `🔌 **Extension for AI Trading Dashboard** — Run the install script and start finding arbitrage opportunities automatically.

Borrow millions with zero collateral. Buy low on one DEX, sell high on another. Repay in the same transaction. Keep the profit — or the whole thing reverts and you lose nothing but gas.

**v1.1 — What's new:**
- 🚀 **Auto-Executor** — Server-side continuous scanner that runs independently. Set your min profit, scan interval, and max gas price, then let it find and execute opportunities 24/7
- 🔍 **Multi-DEX Scanning** — Scans Uniswap V3, PancakeSwap V3, Camelot V3, and Ramses V2 simultaneously for best buy/sell spreads
- 📊 **Enhanced Charts** — Cumulative profit, success rate, profit by pair, and gas vs profit visualizations
- 🛡️ **Dry Run Mode** — Log opportunities without executing transactions

**What you get:**
- Real-time price scanner across 4 DEXes on Arbitrum
- Aave V3 flash loan integration (0.05% fee, zero collateral)
- Server-side auto-executor with configurable thresholds
- Gas optimization and profitability calculator
- MEV protection with private transaction submission
- Execution history with P&L tracking and charts
- Dry run mode for risk-free observation
- TypeScript execution engine + manifest.json for plug-and-play install

👉 **Try the live demo** to see the scanner finding real-time opportunities across DEXes.

**How it works:**
1. Scanner monitors price differences across 4 DEXes every 12 seconds
2. When spread exceeds gas + fees, it triggers a flash loan from Aave V3
3. Atomic transaction: borrow → buy low → sell high → repay → profit
4. If the trade isn't profitable, the entire transaction reverts (you lose nothing)

⚠️ **Risk Warning:** While flash loans are atomic (failed trades revert), this does NOT mean risk-free. Smart contract bugs, gas estimation errors, MEV attacks, and market manipulation can result in losses. DeFi protocols carry inherent smart contract risk. You are responsible for auditing, testing, and deploying any smart contracts. See our [Trading Disclaimer](/disclaimer).

**Integrates with:** AI Trading Dashboard ($149) — run the included \`install.bat\` (Windows) or \`bash install.command\` (Mac) — it copies everything to the right place. Restart dashboard.
**You provide:** Your own wallet, private keys, ETH for gas, and risk management.`,
    price: 99,
    category: "trading",
    badge: "EXTENSION",
    emoji: "⚡",
    productType: "extension",
    features: [
      "Dashboard plugin",
      "Multi-DEX scanning (4 DEXes)",
      "Aave V3 flash loans",
      "Server-side auto-executor",
      "Dry run mode",
      "MEV protection",
      "Gas optimization",
      "Real-time profit charts",
      "Configurable thresholds",
      "Plug-and-play install"
    ],
    techStack: ["Solidity", "TypeScript", "Aave V3", "Arbitrum", "Next.js 15"],
    image: "/images/products/store/flash-loan-flow.png",
    images: [
      "/images/products/store/flash-loan-flow.png",
    ],
    downloadUrl: "downloads/flash-loan-arbitrage-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/flash-loans",
    videoUrl: "/videos/products/flash-loan.mp4",
  },
  // === TRADING TOOLS ===
  {
    id: "darvas-indicator",
    stripePriceId: "price_1T7pe5LLyk0oaesNNXwg2VwU",
    requiresDashboard: true,
    name: "Darvas Box Breakout Agent",
    description: "Automated box breakout detection based on the Nicolas Darvas method. Identifies consolidation boxes, confirms breakouts with volume, and executes entries with trailing stops. Multi-timeframe analysis across 15m/1H/4H.",
    longDescription: `Darvas Box breakout detection framework — inspired by the Nicolas Darvas method. Multi-timeframe analysis, confidence scoring, and signal generation architecture. Full TypeScript source code.

**🔌 Plugin for the AI Trading Dashboard** — unzip into your dashboard's \`plugins/\` folder and restart.

**What you get:**
- Darvas Box breakout detection algorithm (TypeScript)
- Multi-timeframe analysis (1H, 4H, 1D)
- Auto box identification with consolidation zone mapping
- Entry/exit signal generation with confidence scoring
- Alert system for breakout notifications
- Dashboard widget component (DarvasOverlay.tsx)
- manifest.json for plug-and-play installation
- Full source code with documentation

👉 **Try the live demo** to see the Darvas interface with sample data.

**What you're buying:** Source code and strategy architecture. A development starting point — not a guaranteed trading system.

⚠️ *Trading involves substantial risk. Historical strategy performance does not guarantee future results. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    emoji: "📦",
    productType: "agent",
    features: ["Dashboard plugin", "Multi-timeframe", "Auto box detection", "Alert system", "Confidence scoring", "Plug-and-play install"],
    image: "/images/products/store/darvas-agent-signals.png",
    images: [
      "/images/products/store/darvas-agent-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/darvas-indicator-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/darvas-agent.mp4",
  },
  {
    id: "elliott-wave-agent",
    stripePriceId: "price_1T7pe6LLyk0oaesNN61g0lrl",
    requiresDashboard: true,
    name: "Elliott Wave Pattern Agent",
    description: "AI-powered Elliott Wave counting with automatic Fibonacci extension targets. Detects impulse waves (1-5) and corrective patterns (A-B-C), validates with Fibonacci ratios, and executes entries at high-probability wave positions.",
    longDescription: `AI-powered Elliott Wave analysis architecture — wave counting, Fibonacci validation, and trade signal generation. Full TypeScript source code.

**🔌 Plugin for the AI Trading Dashboard** — unzip into your dashboard's \`plugins/\` folder, restart, and the agent starts analyzing wave patterns.

**What you get:**
- AI wave pattern detection framework using DeepSeek/GPT-4 analysis
- Automatic wave counting (impulse + corrective patterns)
- Entry/exit signal generation based on wave position
- Fibonacci ratio validation for wave relationships
- Risk management templates (position sizing, stop-loss, multi-target take-profit)
- Dashboard panel component (ElliottWavePanel.tsx)
- manifest.json for plug-and-play installation
- Full TypeScript source code

👉 **Try the live demo** to see the wave analysis interface with sample data.

**What you're buying:** The source code, UI components, and algorithmic framework. This is a development starting point — not a guaranteed trading system. Your results depend on market conditions, configuration, and your own risk management.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    badge: "PREMIUM",
    emoji: "🌊",
    productType: "agent",
    features: ["Dashboard plugin", "AI wave detection", "Auto entry/exit", "Fibonacci validation", "Risk management", "Plug-and-play"],
    image: "/images/products/store/elliott-wave-signals.png",
    images: [
      "/images/products/store/elliott-wave-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/elliott-wave-agent-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/elliott-wave.mp4",
  },
  {
    id: "vwap-momentum-agent",
    stripePriceId: "price_1T7pe7LLyk0oaesN9l7hI7Zd",
    requiresDashboard: true,
    name: "VWAP Pro Agent",
    description: "Advanced VWAP agent with multi-timeframe analysis, order flow tracking, accumulation/distribution zone detection, and dynamic confidence scoring. Upgrades the basic VWAP+RSI agent included with the dashboard. 6-hour average hold time.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — VWAP-based volume analysis and trade signal framework.

Combines VWAP (Volume Weighted Average Price) with volume divergence analysis and RSI momentum signals. Architecture for identifying accumulation zones, volume spikes, and momentum shifts.

**What you get:**
- VWAP calculation engine with dynamic support/resistance levels
- Volume divergence detection (accumulation/distribution analysis)
- RSI momentum overlay with divergence alerts
- Multi-timeframe analysis (15m, 1H, 4H)
- Order flow analysis — buy/sell volume ratio tracking
- Auto-entry framework with confidence scoring (0-100)
- Trailing stop-loss with dynamic adjustment
- Agent thought stream — see the agent's analysis logic
- Dashboard panel component (VWAPPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the VWAP interface with sample data.

**What you're buying:** Source code and strategy architecture. Your results will depend entirely on market conditions, configuration, and risk management.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    badge: "PLUGIN",
    emoji: "📊",
    productType: "agent",
    features: ["Dashboard plugin", "VWAP analysis", "Volume divergence", "RSI momentum", "Order flow tracking", "Auto-execution", "Confidence scoring", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/vwap-agent-signals.png",
    images: [
      "/images/products/store/vwap-agent-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/vwap-momentum-agent-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/vwap-agent.mp4",
  },
  {
    id: "heikin-ashi-agent",
    stripePriceId: "price_1T7pe7LLyk0oaesNiRtA8Q70",
    requiresDashboard: true,
    name: "Heikin Ashi Trend Following Agent",
    description: "Trend-following agent using Heikin Ashi smoothed candles to filter market noise. Enters on consecutive bullish/bearish candle sequences, confirms with ADX trend strength, and rides moves with trailing stops. 22-hour average hold time.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Trend-following agent framework using Heikin Ashi smoothed candles.

Heikin Ashi candles filter market noise to reveal the underlying trend. This agent framework identifies consecutive bullish/bearish sequences, confirms with ADX trend strength, and manages positions with trailing stops.

**What you get:**
- Heikin Ashi candle transformation engine
- Consecutive candle pattern detection (7+ candle sequences)
- ADX trend strength validation (enters only when ADX > 25)
- +DI/-DI crossover confirmation
- Trailing stop-loss with trend-riding logic
- Multi-timeframe trend alignment (1H + 4H + 1D)
- Reversal doji detection for exit timing
- Agent thought stream — see the analysis logic
- Dashboard panel component (HeikinAshiPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the Heikin Ashi interface with sample data.

**What you're buying:** Source code and strategy architecture. A starting point for your own trend-following system.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    badge: "PLUGIN",
    emoji: "🕯️",
    productType: "agent",
    features: ["Dashboard plugin", "Heikin Ashi candles", "ADX trend strength", "Trailing stops", "Multi-timeframe", "Reversal detection", "Noise filtering", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/heikin-ashi-signals.png",
    images: [
      "/images/products/store/heikin-ashi-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/heikin-ashi-agent-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/heikin-ashi.mp4",
  },
  {
    id: "mean-reversion-agent",
    stripePriceId: "price_1T7pe8LLyk0oaesNtleC9nah",
    requiresDashboard: true,
    name: "Bollinger Band Mean Reversion Agent",
    description: "Buys oversold assets and sells overbought using RSI extremes, Bollinger Band touches, and Z-score deviation. Enters with scaled 1/3 position sizing at each level. Conservative, statistical approach to catching bounces.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Mean reversion strategy framework using Bollinger Bands, RSI, and Z-score analysis.

Statistical approach to identifying overbought/oversold conditions. This agent framework detects extreme deviations using RSI, Bollinger Bands, and Z-score calculations, with a scaled entry architecture.

**What you get:**
- RSI oversold/overbought detection (configurable thresholds)
- Bollinger Band squeeze and expansion analysis
- Z-score statistical deviation measurement
- Scaled entry system (1/3 position sizing at each level)
- Mean reversion probability calculator framework
- Correlation-aware positioning (avoids concentrated exposure)
- Auto stop-loss at extended deviation levels
- Agent thought stream — see the statistical analysis logic
- Dashboard panel component (MeanReversionPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the mean reversion interface with sample data.

**What you're buying:** Source code and strategy architecture. Statistical models require your own backtesting, tuning, and risk management.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    emoji: "📉",
    productType: "agent",
    features: ["Dashboard plugin", "RSI analysis", "Bollinger Bands", "Z-score detection", "Scaled entries", "Mean reversion probability", "Correlation-aware", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/store/mean-reversion-signals.png",
    images: [
      "/images/products/store/mean-reversion-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/mean-reversion-agent-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/mean-reversion.mp4",
  },
  {
    id: "macro-sentiment-agent",
    stripePriceId: "price_1T7pe8LLyk0oaesNKFWCuZHo",
    requiresDashboard: true,
    name: "Macro & On-Chain Sentiment Agent",
    description: "Analyzes Fed policy, on-chain whale flows, social media sentiment scores, and exchange inflow/outflow data. Broadcasts risk-on/risk-off signals to all other agents. The coordination layer that decides when the farm goes aggressive or defensive.",
    longDescription: `🔌 **Plugin for AI Trading Dashboard** — Macro and on-chain analysis framework that coordinates your trading farm.

An architecture for reading the broader market environment — news sentiment, on-chain metrics, social signals, and macro indicators — and broadcasting risk assessments to other agents in your farm.

**What you get:**
- News sentiment analysis framework (Fed speeches, macro events, crypto news)
- On-chain metrics tracking (whale accumulation, exchange flows, supply dynamics)
- Social sentiment scoring architecture (Twitter/X crypto sentiment 0-100)
- Google Trends integration for retail interest detection
- Macro risk score calculator (0-10 scale)
- VIX, DXY, and gold correlation monitoring
- Farm-wide broadcasting — sends risk signals to all agents
- Green-light/red-light system for portfolio-wide risk management
- Agent thought stream — see the macro analysis logic
- Dashboard panel component (MacroSentimentPanel.tsx)
- manifest.json for plug-and-play installation

👉 **Try the live demo** to see the macro analysis interface with sample data.

**What you're buying:** Source code and analysis framework. Sentiment analysis accuracy depends on data sources, market conditions, and your configuration.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip into \`plugins/\` folder, restart dashboard — done.`,
    price: 199,
    category: "trading",
    badge: "PLUGIN",
    emoji: "🧠",
    productType: "agent",
    features: ["Dashboard plugin", "News sentiment", "On-chain analytics", "Social scoring", "Macro risk score", "Farm broadcasting", "VIX/DXY correlation", "Plug-and-play install"],
    techStack: ["TypeScript", "Next.js 15", "Hyperliquid SDK", "Supabase", "OpenRouter AI"],
    image: "/images/products/store/macro-sentiment-signals.png",
    images: [
      "/images/products/store/macro-sentiment-signals.png",
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/macro-sentiment-agent-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/agents",
    videoUrl: "/videos/products/macro-sentiment.mp4",
  },

  // === PROP FIRM ===
  {
    id: "prop-firm-agent",
    stripePriceId: "", // TODO: create Stripe price
    requiresDashboard: true,
    name: "Prop Firm Futures Agent",
    description: "Automated futures trading agent for prop firm evaluations. Trades micro futures (MES, MNQ) on Tradovate with AI-driven decisions, dynamic R:R, circuit breakers, and strict risk management. Designed for Apex Trader Funding.",
    longDescription: `🏗️ **NEW — Plugin for AI Trading Dashboard** — Automated futures trading agent built for prop firm evaluations.

Trade micro futures on Tradovate with AI-powered decisions and built-in risk management that respects prop firm drawdown rules. Designed for Apex Trader Funding and similar prop firms.

**What you get:**
- AI-driven trade decisions via OpenRouter (Claude, GPT-4, etc.)
- Direct Tradovate API integration (no TradersPost needed)
- Dynamic R:R based on market regime (trending/ranging/transitional)
- Break-even at 1R, trailing stop at 1.5R
- Circuit breaker: 3 consecutive losses → halt
- Max $250 risk per trade, $1,400 daily loss limit
- Flattens all positions 10 min before market close
- Only trades NY RTH (9:30 AM - 3:50 PM ET)
- Full position management with OCO orders
- Agent thought stream — watch the AI reason through trades
- Dashboard page with live positions, P&L, and account health

**Supported instruments:** MES, MNQ, MYM, M2K, ES, NQ

**How it works:**
1. Agent scans markets every 10 min during NY RTH
2. AI analyzes price action, volume, and regime
3. When confidence > 65% and R:R > 2.0, it enters
4. Break-even stop moves to entry at 1R profit
5. Trailing stop activates at 1.5R profit
6. Circuit breaker halts after 3 consecutive losses
7. All positions flattened 10 min before close

⚠️ **Risk Warning:** Futures trading involves substantial risk of loss. Prop firm evaluations have strict drawdown rules — one bad trade can fail your evaluation. This agent is a tool, not a guarantee. You are responsible for your own trading decisions. See our [disclaimer](/disclaimer).

**Requires:** AI Trading Dashboard ($149) + Tradovate account + OpenRouter API key
**You provide:** Your Tradovate credentials, your prop firm account, your risk management.`,
    price: 199,
    category: "trading",
    badge: "NEW",
    emoji: "🏦",
    productType: "agent",
    features: [
      "Dashboard plugin",
      "Tradovate API integration",
      "AI trade decisions",
      "Dynamic R:R by regime",
      "Circuit breakers",
      "Break-even + trailing stops",
      "Prop firm drawdown tracking",
      "Auto-flatten before close",
      "OCO order management",
      "Plug-and-play install"
    ],
    techStack: ["TypeScript", "Next.js 15", "Tradovate API", "OpenRouter", "Supabase"],
    image: "/images/products/store/dashboard-command-center.png",
    images: [
      "/images/products/store/dashboard-command-center.png",
    ],
    downloadUrl: "downloads/prop-firm-agent-v1.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/prop-firms",
  },
  {
    id: "multi-strat-bundle",
    stripePriceId: "price_1T7AnkLLyk0oaesNv8HuW24O",
    isBundle: true,
    name: "Multi-Strategy Bundle",
    description: "✅ Includes the AI Trading Dashboard — Seven strategies in one package. Darvas Box, Elliott Wave, VWAP, Heikin Ashi, Mean Reversion, Macro Sentiment, and Prop Firm Futures. Run them as a coordinated farm.",
    longDescription: `✅ **Includes the AI Trading Dashboard** — Seven strategy architectures in one package: Darvas Box, Elliott Wave, VWAP Breakout, Heikin Ashi, Bollinger Band Mean Reversion, Macro Sentiment, and Prop Firm Futures. Run them as a coordinated farm with shared risk management.

**🔌 Plugin for the AI Trading Dashboard** — unzip all 7 strategy folders into your dashboard's \`plugins/\` directory, restart, and use the farm orchestrator to coordinate them.

**Strategy frameworks included:**
1. **Darvas Box** — Breakout detection with consolidation zones
2. **Elliott Wave** — AI-powered wave pattern analysis
3. **VWAP Volume Breakout** — Volume-weighted momentum signals
4. **Heikin Ashi** — Smoothed candle trend detection
5. **Bollinger Band Mean Reversion** — Statistical mean reversion
6. **Macro Sentiment** — Market regime detection and farm coordination
7. **Prop Firm Futures** — Automated Tradovate micro futures trading

**Plus:**
- Farm orchestration system — run all 6 strategies simultaneously
- Position management with margin awareness
- Risk management and drawdown protection templates
- Full TypeScript source code
- Deploy guide for Vercel + Supabase

**What you're buying:** Six agent frameworks and a farm orchestration architecture. Source code you customize, test, and deploy yourself.

⚠️ *Trading involves substantial risk. No strategy guarantees profits. See [disclaimer](/disclaimer).*

**Integrates with:** AI Trading Dashboard ($149) — unzip all 6 agent folders into \`plugins/\`, restart dashboard — done.`,
    price: 399,
    category: "trading",
    badge: "SAVE $1,093",
    emoji: "🏭",
    productType: "bundle",
    features: ["7 strategies included", "Prop Firm Futures agent included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"],
    image: "/images/products/store/multi-strat-value.png",
    downloadUrl: "downloads/multi-strat-bundle-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard/farms",
    images: [
      "/images/products/store/multi-strat-value.png",
      "/images/products/store/darvas-agent-signals.png",
      "/images/products/store/elliott-wave-signals.png",
      "/images/products/store/vwap-agent-signals.png",
    ],
    videoUrl: "/videos/products/multi-strat-bundle.mp4",
  },

  {
    id: "full-stack-trader-bundle",
    stripePriceId: "price_1T7p7ZLLyk0oaesN9Mt54Oaz",
    isBundle: true,
    name: "The Full Stack Trader",
    description: "✅ Includes the AI Trading Dashboard — Dashboard + Darvas Box + Elliott Wave. The core AI trading toolkit in one purchase.",
    longDescription: `✅ **Includes the AI Trading Dashboard** — Save $248 and get the core trading toolkit in one purchase.

**3 products included:**
• **AI Trading Dashboard** ($149) — Full autonomous trading platform with 10+ strategies
• **Darvas Box Breakout Agent** ($199) — Volume-confirmed box breakout detection
• **Elliott Wave Pattern Agent** ($199) — AI-powered wave counting with Fibonacci targets

**Total value: $547 — You pay $299. Save $248.**

👉 **Try the live demo** to see all these systems working together in one unified dashboard.

All three products delivered as source code. Double-click \`QUICK-START.bat\` to set up the dashboard, then drop the agent folders into \`plugins/\`. Same architecture, same engineering — a complete starting point.

⚠️ *Software tools, not financial advice. Trading involves substantial risk. See [disclaimer](/disclaimer).*`,
    price: 299,
    category: "trading" as ProductCategory,
    badge: "SAVE $248",
    emoji: "🎯",
    productType: "bundle",
    features: ["AI Trading Dashboard", "Darvas Box Breakout Agent", "Elliott Wave Pattern Agent", "All future updates", "$248 savings"],
    isFeatured: true,
    image: "/images/products/store/dashboard-command-center.png",
    images: [
      "/images/products/store/full-stack-value.png",
      "/images/products/store/dashboard-command-center.png",
      "/images/products/store/darvas-agent-signals.png",
      "/images/products/store/elliott-wave-signals.png",
    ],
    downloadUrl: "downloads/full-stack-trader-bundle-v2.0.0.zip",
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
    videoUrl: "/videos/products/full-stack-trader.mp4",
  },
  {
    id: "everything-bundle",
    stripePriceId: "price_1T83kkLLyk0oaesN9kxVyD0v",
    isBundle: true,
    name: "GWDS Everything Bundle",
    description: "✅ Includes the AI Trading Dashboard — Every agent, every extension, every tool. 10 products in one package.",
    longDescription: `✅ **Includes the AI Trading Dashboard** — The ultimate deal: every single product in the GWDS store.

**10 products included:**
• **AI Trading Dashboard v2** ($149) — Full autonomous trading platform with 80+ pages
• **Meme Trading Suite** ($99) — DexScreener scanner, meme agents, smart money tracking
• **Flash Loan Arbitrage Engine** ($99) — Cross-DEX arbitrage with Aave V3 + auto-executor
• **Prop Firm Futures Agent** ($199) — Automated Tradovate futures trading
• **Darvas Box Breakout Agent** ($199) — Volume-confirmed breakout detection
• **Elliott Wave Pattern Agent** ($199) — AI-powered wave counting
• **VWAP Pro Agent** ($199) — Volume-weighted momentum
• **Heikin Ashi Trend Following Agent** ($199) — Noise-filtered trend riding
• **Bollinger Band Mean Reversion Agent** ($199) — Statistical mean reversion
• **Macro & On-Chain Sentiment Agent** ($199) — Macro + on-chain signals

**Total value: $1,840 — You pay $899. Save $941.**

👉 **Try the live demo** to see the full dashboard interface with sample data.

All products delivered as source code. Run the included \`INSTALL-ALL.bat\` (Windows) or \`bash INSTALL-ALL.command\` (Mac) to install every plugin and extension at once. You get the architecture, the UI, and the engineering — a complete starting point for building your own trading system.

⚠️ *These are software tools — not financial advice. Trading involves substantial risk of loss. See [disclaimer](/disclaimer).*`,
    price: 699,
    category: "trading" as ProductCategory,
    badge: "SAVE $941",
    isFeatured: true,
    downloadUrl: "downloads/everything-bundle-v2.0.0.zip",
    image: "/images/products/store/dashboard-command-center.png",
    images: [
      "/images/products/store/everything-value.png",
      "/images/products/store/dashboard-command-center.png",
      "/images/products/store/meme-token-scanner.png",
      "/images/products/store/flash-loan-flow.png",
      "/images/products/store/darvas-agent-signals.png",
    ],
    demoUrl: "https://ai-trading-dashboard-demo.vercel.app/dashboard",
    videoUrl: "/videos/products/everything-bundle.mp4",
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
