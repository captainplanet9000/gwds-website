-- GWDS E-Commerce Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  category TEXT NOT NULL,
  badge TEXT,
  emoji TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  stripe_price_id TEXT,
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  download_token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMPTZ NOT NULL,
  downloaded_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Products: public read access
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Orders: readable by customer email match
CREATE POLICY "Orders are viewable by customer"
  ON orders FOR SELECT
  USING (auth.jwt() ->> 'email' = customer_email);

-- Order items: readable by order owner
CREATE POLICY "Order items viewable by order owner"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Downloads: readable by token (no auth required for download links)
CREATE POLICY "Downloads viewable by token"
  ON downloads FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order ON downloads(order_id);

-- Seed products from products.ts
INSERT INTO products (id, name, description, price_cents, category, badge, emoji, features, image_url) VALUES
-- Templates
('trading-dashboard-template', 'Trading Dashboard Pro', 'Full-featured trading dashboard with real-time charts, position management, risk analytics, and multi-exchange support. Built with Next.js 15 + Tailwind.', 14900, 'templates', 'FLAGSHIP', '📊', '["Next.js 15 + TypeScript", "Multi-exchange support", "Risk management suite", "Real-time WebSocket data", "Dark/light themes", "Mobile responsive"]', NULL),
('second-brain-template', 'Second Brain Template', 'PARA-organized personal knowledge base with tasks, docs, search, timeline, calendar, and AI chat. Deploy to Vercel in minutes.', 7900, 'templates', 'POPULAR', '🧠', '["PARA methodology", "Full-text search", "AI chat integration", "Task management", "Weekly digests", "Vercel-ready"]', NULL),
('ai-saas-starter', 'AI SaaS Starter Kit', 'Production-ready SaaS template with auth, billing, AI API integration, and admin dashboard. Ship your AI product in days, not months.', 9900, 'templates', NULL, '🚀', '["Auth + billing", "AI API integration", "Admin dashboard", "Landing page", "Email templates", "Stripe payments"]', NULL),

-- Trading
('darvas-indicator', 'Darvas Box Indicator', 'Classic Darvas Box breakout detection with modern enhancements. Auto-identifies consolidation zones and breakout signals across any timeframe.', 4900, 'trading', NULL, '📦', '["Multi-timeframe", "Auto box detection", "Alert system", "Backtesting data", "TradingView compatible"]', NULL),
('elliott-wave-agent', 'Elliott Wave Trading Agent', 'AI-powered Elliott Wave analysis agent. Identifies wave patterns, generates entry/exit signals, and manages risk automatically.', 19900, 'trading', 'PREMIUM', '🌊', '["AI wave detection", "Auto entry/exit", "Risk management", "Multi-asset", "Telegram alerts", "Backtested strategy"]', NULL),
('multi-strat-bundle', 'Multi-Strategy Agent Bundle', 'Complete bundle of 6 trading strategies: Darvas, Williams, Elliott, Heikin Ashi, Renko, and Multi-Strat. Run them individually or as an orchestrated farm.', 39900, 'trading', 'BEST VALUE', '🏭', '["6 strategies included", "Farm orchestration", "Position management", "Margin-aware", "Telegram alerts", "Full source code"]', NULL),

-- Prompts
('content-creator-prompts', 'Content Creator Mega Pack', '500+ prompts for TikTok scripts, YouTube thumbnails, Instagram captions, blog posts, and viral hooks. Organized by platform and niche.', 2900, 'prompts', '500+ PROMPTS', '✍️', '["TikTok scripts", "YouTube thumbnails", "Instagram captions", "Blog frameworks", "Viral hooks", "Niche-specific"]', NULL),
('trading-analysis-prompts', 'Trading Analysis Prompts', '200+ prompts for market analysis, signal generation, risk assessment, and portfolio review. Built for GPT-4, Claude, and Gemini.', 3900, 'prompts', NULL, '🔍', '["Market analysis", "Signal generation", "Risk assessment", "Portfolio review", "Multi-model compatible"]', NULL),
('ai-art-prompts', 'AI Art Direction Pack', '300+ curated prompts for Midjourney, DALL-E, Flux, and Stable Diffusion. Styles include claymation, cyberpunk, minimalist, abstract, and more.', 2400, 'prompts', NULL, '🎨', '["300+ art prompts", "Multiple AI platforms", "Style categories", "Negative prompts included", "Commercial license"]', NULL),

-- Wallpapers
('cyber-wave-pack', 'Cyber Wave Collection', '20 ultra-high-res AI-generated wallpapers. Cyberpunk meets synthwave — neon grids, chrome structures, and digital horizons.', 1200, 'wallpapers', NULL, '🌆', '["20 wallpapers", "4K + 8K", "Desktop + mobile", "Cyberpunk aesthetic", "Commercial license"]', NULL),
('abstract-flow-pack', 'Abstract Flow Collection', '15 premium abstract wallpapers. Fluid gradients, geometric patterns, and organic forms in a dark, sophisticated palette.', 900, 'wallpapers', NULL, '🌀', '["15 wallpapers", "4K resolution", "Desktop + mobile", "Abstract art", "Dark palette"]', NULL),

-- NFTs
('400-club', 'The 400 Club', '9,400-piece generative art collection on Ethereum. Unique character NFTs with trait-based rarity and community perks.', 0, 'nfts', 'COMING SOON', '🎭', '["9,400 unique pieces", "Ethereum mainnet", "Trait rarity", "Community access", "Holder benefits"]', NULL),

-- Animations
('clay-verse-pack', 'Clay Verse Animation Pack', '10 claymation-style animated loops. Perfect for TikTok intros, social media, or creative projects. 1080p, loopable, transparent backgrounds available.', 1900, 'animations', NULL, '🏗️', '["10 animations", "1080p quality", "Loopable", "Transparent BG option", "Commercial license"]', NULL),
('3d-render-pack', '3D Product Renders Pack', '20 isometric 3D product mockup animations. Floating devices, rotating objects, and ambient lighting. Great for product pages and ads.', 3400, 'animations', NULL, '🎥', '["20 renders", "Isometric style", "4K output", "Loop-ready", "Ad-optimized"]', NULL)
ON CONFLICT (id) DO NOTHING;
