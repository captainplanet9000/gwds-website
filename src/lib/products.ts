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
    image: "/images/products/dashboard-overview.jpg",
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
    image: "/images/products/dashboard-analytics.jpg",
  },
  {
    id: "ai-saas-starter",
    name: "AI SaaS Starter Kit",
    description: "Production-ready SaaS template with auth, billing, AI API integration, and admin dashboard. Ship your AI product in days, not months.",
    price: 99,
    category: "templates",
    emoji: "🚀",
    features: ["Auth + billing", "AI API integration", "Admin dashboard", "Landing page", "Email templates", "Stripe payments"],
    techStack: ["Next.js 15", "TypeScript", "Supabase Auth", "Stripe"],
    image: "/images/products/dashboard-goals.jpg",
  },

  // === TRADING TOOLS ===
  {
    id: "darvas-indicator",
    name: "Darvas Box Indicator",
    description: "Classic Darvas Box breakout detection with modern enhancements. Auto-identifies consolidation zones and breakout signals across any timeframe.",
    price: 49,
    category: "trading",
    emoji: "📦",
    features: ["Multi-timeframe", "Auto box detection", "Alert system", "Backtesting data", "TradingView compatible"],
    image: "/images/products/dashboard-performance.jpg",
  },
  {
    id: "elliott-wave-agent",
    name: "Elliott Wave Agent",
    description: "AI-powered Elliott Wave analysis. Identifies wave patterns, generates entry/exit signals, and manages risk automatically.",
    price: 199,
    category: "trading",
    badge: "PREMIUM",
    emoji: "🌊",
    features: ["AI wave detection", "Auto entry/exit", "Risk management", "Multi-asset", "Telegram alerts", "Backtested strategy"],
    image: "/images/products/dashboard-farms.jpg",
  },
  {
    id: "multi-strat-bundle",
    name: "Multi-Strategy Bundle",
    description: "Complete bundle of 6 trading strategies: Darvas, Williams, Elliott, Heikin Ashi, Renko, and Multi-Strat. Run them individually or as a farm.",
    price: 399,
    category: "trading",
    badge: "BEST VALUE",
    emoji: "🏭",
    features: ["6 strategies included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"],
    image: "/images/products/dashboard-flash-loans.jpg",
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
  },
  {
    id: "trading-analysis-prompts",
    name: "Trading Analysis Prompts",
    description: "200+ prompts for market analysis, signal generation, risk assessment, and portfolio review. Built for GPT-4, Claude, and Gemini.",
    price: 39,
    category: "prompts",
    emoji: "🔍",
    features: ["Market analysis", "Signal generation", "Risk assessment", "Portfolio review", "Multi-model compatible"],
  },
  {
    id: "ai-art-prompts",
    name: "AI Art Direction Pack",
    description: "300+ curated prompts for Midjourney, DALL-E, Flux, and Stable Diffusion. Claymation, cyberpunk, minimalist, abstract, and more.",
    price: 24,
    category: "prompts",
    emoji: "🎨",
    features: ["300+ art prompts", "Multiple AI platforms", "Style categories", "Negative prompts", "Commercial license"],
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
  },
  {
    id: "abstract-flow-pack",
    name: "Abstract Flow Collection",
    description: "15 premium abstract wallpapers. Fluid gradients, geometric patterns, and organic forms in a dark palette.",
    price: 9,
    category: "wallpapers",
    emoji: "🌀",
    features: ["15 wallpapers", "4K resolution", "Desktop + mobile", "Abstract art", "Dark palette"],
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
  },

  // === ANIMATIONS ===
  {
    id: "clay-verse-pack",
    name: "Clay Verse Animation Pack",
    description: "10 claymation-style animated loops. Perfect for TikTok intros, social media, or creative projects.",
    price: 19,
    category: "animations",
    emoji: "🏗️",
    features: ["10 animations", "1080p quality", "Loopable", "Transparent BG option", "Commercial license"],
  },
  {
    id: "3d-render-pack",
    name: "3D Product Renders Pack",
    description: "20 isometric 3D product mockup animations. Floating devices, rotating objects, ambient lighting.",
    price: 34,
    category: "animations",
    emoji: "🎥",
    features: ["20 renders", "Isometric style", "4K output", "Loop-ready", "Ad-optimized"],
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
