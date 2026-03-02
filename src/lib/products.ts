export type ProductCategory = "templates" | "trading" | "prompts" | "wallpapers" | "nfts" | "animations";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  badge?: string;
  emoji: string;
  features: string[];
  image?: string;
  downloadUrl?: string;
}

export const categories: { id: ProductCategory; label: string; emoji: string; description: string }[] = [
  { id: "templates", label: "AI Templates", emoji: "🧩", description: "Production-ready dashboards, apps, and tools you can customize and ship." },
  { id: "trading", label: "Trading Tools", emoji: "📈", description: "Indicators, agents, and systems built for real-money execution." },
  { id: "prompts", label: "Prompt Packs", emoji: "💬", description: "Curated prompt libraries for content, code, trading, and creative workflows." },
  { id: "wallpapers", label: "Wallpapers", emoji: "🎨", description: "AI-generated wallpapers and digital art for desktop and mobile." },
  { id: "nfts", label: "NFT Collections", emoji: "💎", description: "Limited-edition generative art and collectibles on multiple chains." },
  { id: "animations", label: "Animations", emoji: "🎬", description: "Claymation, 3D renders, and animated content packs." },
];

export const products: Product[] = [
  // Templates
  {
    id: "trading-dashboard-template",
    name: "Trading Dashboard Pro",
    description: "Full-featured trading dashboard with real-time charts, position management, risk analytics, and multi-exchange support. Built with Next.js 15 + Tailwind.",
    price: 149,
    category: "templates",
    badge: "FLAGSHIP",
    emoji: "📊",
    features: ["Next.js 15 + TypeScript", "Multi-exchange support", "Risk management suite", "Real-time WebSocket data", "Dark/light themes", "Mobile responsive"],
  },
  {
    id: "second-brain-template",
    name: "Second Brain Template",
    description: "PARA-organized personal knowledge base with tasks, docs, search, timeline, calendar, and AI chat. Deploy to Vercel in minutes.",
    price: 79,
    category: "templates",
    badge: "POPULAR",
    emoji: "🧠",
    features: ["PARA methodology", "Full-text search", "AI chat integration", "Task management", "Weekly digests", "Vercel-ready"],
  },
  {
    id: "ai-saas-starter",
    name: "AI SaaS Starter Kit",
    description: "Production-ready SaaS template with auth, billing, AI API integration, and admin dashboard. Ship your AI product in days, not months.",
    price: 99,
    category: "templates",
    emoji: "🚀",
    features: ["Auth + billing", "AI API integration", "Admin dashboard", "Landing page", "Email templates", "Stripe payments"],
  },

  // Trading
  {
    id: "darvas-indicator",
    name: "Darvas Box Indicator",
    description: "Classic Darvas Box breakout detection with modern enhancements. Auto-identifies consolidation zones and breakout signals across any timeframe.",
    price: 49,
    category: "trading",
    emoji: "📦",
    features: ["Multi-timeframe", "Auto box detection", "Alert system", "Backtesting data", "TradingView compatible"],
  },
  {
    id: "elliott-wave-agent",
    name: "Elliott Wave Trading Agent",
    description: "AI-powered Elliott Wave analysis agent. Identifies wave patterns, generates entry/exit signals, and manages risk automatically.",
    price: 199,
    category: "trading",
    badge: "PREMIUM",
    emoji: "🌊",
    features: ["AI wave detection", "Auto entry/exit", "Risk management", "Multi-asset", "Telegram alerts", "Backtested strategy"],
  },
  {
    id: "multi-strat-bundle",
    name: "Multi-Strategy Agent Bundle",
    description: "Complete bundle of 6 trading strategies: Darvas, Williams, Elliott, Heikin Ashi, Renko, and Multi-Strat. Run them individually or as an orchestrated farm.",
    price: 399,
    category: "trading",
    badge: "BEST VALUE",
    emoji: "🏭",
    features: ["6 strategies included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"],
  },

  // Prompts
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
    description: "300+ curated prompts for Midjourney, DALL-E, Flux, and Stable Diffusion. Styles include claymation, cyberpunk, minimalist, abstract, and more.",
    price: 24,
    category: "prompts",
    emoji: "🎨",
    features: ["300+ art prompts", "Multiple AI platforms", "Style categories", "Negative prompts included", "Commercial license"],
  },

  // Wallpapers
  {
    id: "cyber-wave-pack",
    name: "Cyber Wave Collection",
    description: "20 ultra-high-res AI-generated wallpapers. Cyberpunk meets synthwave — neon grids, chrome structures, and digital horizons.",
    price: 12,
    category: "wallpapers",
    emoji: "🌆",
    features: ["20 wallpapers", "4K + 8K", "Desktop + mobile", "Cyberpunk aesthetic", "Commercial license"],
  },
  {
    id: "abstract-flow-pack",
    name: "Abstract Flow Collection",
    description: "15 premium abstract wallpapers. Fluid gradients, geometric patterns, and organic forms in a dark, sophisticated palette.",
    price: 9,
    category: "wallpapers",
    emoji: "🌀",
    features: ["15 wallpapers", "4K resolution", "Desktop + mobile", "Abstract art", "Dark palette"],
  },

  // NFTs
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

  // Animations
  {
    id: "clay-verse-pack",
    name: "Clay Verse Animation Pack",
    description: "10 claymation-style animated loops. Perfect for TikTok intros, social media, or creative projects. 1080p, loopable, transparent backgrounds available.",
    price: 19,
    category: "animations",
    emoji: "🏗️",
    features: ["10 animations", "1080p quality", "Loopable", "Transparent BG option", "Commercial license"],
  },
  {
    id: "3d-render-pack",
    name: "3D Product Renders Pack",
    description: "20 isometric 3D product mockup animations. Floating devices, rotating objects, and ambient lighting. Great for product pages and ads.",
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
