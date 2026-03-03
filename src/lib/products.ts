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
    name: "AI Trading Dashboard",
    description: "Full-featured AI trading dashboard with autonomous agents, goal-based execution, multi-exchange support, and real-time analytics. Built with Next.js 15, TypeScript, and Supabase.",
    longDescription: `The same dashboard powering Cival Systems — packaged as a template you can deploy in minutes.

**What you get:**
- Autonomous trading agents with configurable strategies (VWAP, Darvas, Elliott Wave, Heikin Ashi, and more)
- Goal-based trading — set profit targets and let agents execute
- Multi-exchange support: Hyperliquid + Bybit with API key management
- Real-time trade tracking, P&L, and position management
- Risk analytics dashboard with drawdown monitoring
- Agent health monitoring and performance scoring
- Full source code (Next.js 15 + TypeScript + Supabase)
- One-click deploy to Vercel

**Not included:** Live API keys or exchange accounts (you bring your own).`,
    price: 149,
    category: "templates",
    badge: "FLAGSHIP",
    emoji: "📊",
    isFeatured: true,
    features: [
      "Autonomous AI trading agents",
      "Goal-based execution engine",
      "Hyperliquid + Bybit integration",
      "Real-time P&L tracking",
      "Risk analytics suite",
      "Agent health monitoring",
      "Full TypeScript source code",
      "Vercel deploy ready"
    ],
    techStack: ["Next.js 15", "TypeScript", "Supabase", "Hyperliquid SDK", "TailwindCSS"],
    image: "/images/products/trading-dashboard-template.jpg",
    images: [
      "/images/products/trading-dashboard-template.jpg",
      "/images/products/dashboard-analytics.jpg",
      "/images/products/dashboard-trades.jpg",
      "/images/products/dashboard-farms.jpg",
      "/images/products/dashboard-goals.jpg",
    ],
  },
  {
    id: "meme-trading-template",
    name: "Meme Trading System",
    description: "Automated meme coin trading with discovery, auto-execution, position monitoring, and risk management. The system that finds trending memes and trades them before the crowd.",
    longDescription: `Our battle-tested meme trading system — the same one running live on Hyperliquid.

**What you get:**
- Meme coin discovery engine (trending detection, volume analysis)
- Auto-trade execution on Hyperliquid
- Position monitoring with auto-stop-loss
- Meme agent scheduler (configurable scan intervals)
- Risk management (max positions, position sizing, drawdown limits)
- Performance dashboard with trade history
- Full source code + setup wizard

**Warning:** Meme trading is high-risk. This tool gives you an edge, not a guarantee.`,
    price: 99,
    category: "templates",
    badge: "HOT",
    emoji: "🐸",
    isFeatured: true,
    features: [
      "Meme coin discovery engine",
      "Auto-trade execution",
      "Position monitoring",
      "Auto stop-loss",
      "Risk management",
      "Performance analytics",
      "Configurable scanner",
      "Full source code"
    ],
    techStack: ["Next.js 15", "TypeScript", "Hyperliquid SDK", "Supabase"],
    image: "/images/products/meme-trading-template.jpg",
  },
  {
    id: "second-brain-template",
    name: "Second Brain",
    description: "PARA-organized personal knowledge base with tasks, documents, search, AI chat, weekly digests, and a script library with TTS. Your productivity command center.",
    longDescription: `A complete second brain built on the PARA methodology — Projects, Areas, Resources, Archive.

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
  },
  {
    id: "ai-saas-starter",
    name: "AI SaaS Starter Kit",
    description: "Production-ready SaaS template with auth, billing, AI API integration, and admin dashboard. Ship your AI product in days, not months.",
    longDescription: `Skip the boilerplate. Start with a production-ready SaaS foundation.

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
    image: "/images/products/ai-saas-store.jpg",
  },

  // === TRADING TOOLS ===
  {
    id: "darvas-indicator",
    name: "Darvas Box Indicator",
    description: "Classic Darvas Box breakout detection with modern enhancements. Auto-identifies consolidation zones and breakout signals across any timeframe.",
    longDescription: `The Darvas Box method — modernized with AI and automated execution.

**What you get:**
- Darvas Box breakout detection algorithm (TypeScript)
- Multi-timeframe analysis (1H, 4H, 1D)
- Auto box identification with consolidation zone mapping
- Entry/exit signal generation with confidence scoring
- Alert system for breakout notifications
- Backtesting data and historical performance metrics
- TradingView-compatible overlay component
- Full source code with documentation`,
    price: 49,
    category: "trading",
    emoji: "📦",
    features: ["Multi-timeframe", "Auto box detection", "Alert system", "Backtesting data", "TradingView compatible"],
    image: "/images/products/dashboard-analytics.jpg",
  },
  {
    id: "elliott-wave-agent",
    name: "Elliott Wave Agent",
    description: "AI-powered Elliott Wave analysis. Identifies wave patterns, generates entry/exit signals, and manages risk automatically.",
    longDescription: `An autonomous trading agent that reads Elliott Wave patterns and executes trades.

**What you get:**
- AI wave pattern detection using DeepSeek/GPT-4 analysis
- Automatic wave counting (impulse + corrective patterns)
- Entry/exit signal generation based on wave position
- Built-in risk management (position sizing, stop-loss, take-profit)
- Multi-asset support (crypto, forex, equities)
- Telegram alert integration
- Backtested strategy with performance metrics
- Full TypeScript source code

**This is the same agent running live in our Cival trading system.** Extracted, documented, and packaged for you to deploy.`,
    price: 199,
    category: "trading",
    badge: "PREMIUM",
    emoji: "🌊",
    features: ["AI wave detection", "Auto entry/exit", "Risk management", "Multi-asset", "Telegram alerts", "Backtested strategy"],
    image: "/images/products/dashboard-agents.jpg",
  },
  {
    id: "multi-strat-bundle",
    name: "Multi-Strategy Bundle",
    description: "Complete bundle of 6 trading strategies: Darvas, Williams, Elliott, Heikin Ashi, Renko, and Multi-Strat. Run them individually or as a farm.",
    longDescription: `Six battle-tested trading strategies in one bundle. Run them individually or orchestrate them as a farm.

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
- Deploy guide for Vercel + Supabase`,
    price: 399,
    category: "trading",
    badge: "BEST VALUE",
    emoji: "🏭",
    features: ["6 strategies included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"],
    image: "/images/products/dashboard-trades.jpg",
    images: [
      "/images/products/dashboard-trades.jpg",
      "/images/products/dashboard-farms.jpg",
      "/images/products/dashboard-performance.jpg",
      "/images/products/dashboard-correlation.jpg",
    ],
  },

  // === PROMPTS ===
  {
    id: "content-creator-prompts",
    name: "Content Creator Mega Pack",
    description: "500+ prompts for TikTok scripts, YouTube thumbnails, Instagram captions, blog posts, and viral hooks. Organized by platform and niche.",
    price: 29,
    category: "prompts",
    badge: "500+ PROMPTS",
    emoji: "✍️",
    features: ["TikTok scripts", "YouTube thumbnails", "Instagram captions", "Blog frameworks", "Viral hooks", "Niche-specific"],
    image: "/images/products/content-creator-prompts.jpg",
  },
  {
    id: "trading-analysis-prompts",
    name: "Trading Analysis Prompts",
    description: "200+ prompts for market analysis, signal generation, risk assessment, and portfolio review. Built for GPT-4, Claude, and Gemini.",
    price: 39,
    category: "prompts",
    emoji: "🔍",
    features: ["Market analysis", "Signal generation", "Risk assessment", "Portfolio review", "Multi-model compatible"],
    image: "/images/products/trading-analysis-prompts.jpg",
  },
  {
    id: "ai-art-prompts",
    name: "AI Art Direction Pack",
    description: "300+ curated prompts for Midjourney, DALL-E, Flux, and Stable Diffusion. Claymation, cyberpunk, minimalist, abstract, and more.",
    price: 24,
    category: "prompts",
    emoji: "🎨",
    features: ["300+ art prompts", "Multiple AI platforms", "Style categories", "Negative prompts", "Commercial license"],
    image: "/images/products/ai-art-prompts.jpg",
  },

  // === WALLPAPERS ===
  {
    id: "cyber-wave-pack",
    name: "Cyber Wave Collection",
    description: "20 ultra-high-res AI wallpapers. Cyberpunk meets synthwave — neon grids, chrome structures, digital horizons.",
    price: 12,
    category: "wallpapers",
    emoji: "🌆",
    features: ["20 wallpapers", "4K + 8K", "Desktop + mobile", "Cyberpunk aesthetic", "Commercial license"],
    image: "/images/products/cyber-wave-pack.jpg",
  },
  {
    id: "abstract-flow-pack",
    name: "Abstract Flow Collection",
    description: "15 premium abstract wallpapers. Fluid gradients, geometric patterns, and organic forms in a dark palette.",
    price: 9,
    category: "wallpapers",
    emoji: "🌀",
    features: ["15 wallpapers", "4K resolution", "Desktop + mobile", "Abstract art", "Dark palette"],
    image: "/images/products/abstract-flow-pack.jpg",
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
    name: "Clay Verse Animation Pack",
    description: "Complete claymation content toolkit — 10 detailed AI video prompts, 5 style reference cards, 3 TikTok scripts, and platform-specific settings for Runway, Kling, and ComfyUI.",
    longDescription: `Everything you need to create stunning claymation-style AI videos.

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
  },
  {
    id: "3d-render-pack",
    name: "3D Product Renders Pack",
    description: "20 isometric 3D product render prompts, 5 Blender scene templates, 5 color palettes, and batch generation scripts. Create stunning product photography with AI.",
    longDescription: `Professional-grade AI product photography toolkit.

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
