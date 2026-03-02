# GWDS Website & Store — Complete Buildout Plan

## Executive Summary
Transform GWDS from a static product listing into a fully operational digital products business with real payments, automated delivery, admin CRM, and three flagship template products packaged from our existing builds.

---

## Phase 1: STORE FOUNDATION (Days 1-2)
*Get the store actually working end-to-end*

### 1.1 Fix Broken Store Pages
- [ ] Fix store gallery/grid — products must display, filter, and link properly
- [ ] Fix product detail pages (`/store/[id]`) — full product page with images, features, pricing, add-to-cart
- [ ] Fix cart drawer — slide-out cart with quantity controls, remove items, total
- [ ] Fix checkout page — form with email, name, payment
- [ ] Fix checkout success page — order confirmation with download links
- [ ] Fix downloads page (`/downloads/[orderId]`) — secure file delivery

### 1.2 Payment Processing (Stripe)
- [ ] Install `stripe` + `@stripe/stripe-js` packages
- [ ] Create Stripe account or use existing GWDS Stripe
- [ ] `/api/checkout/route.ts` — Create Stripe Checkout Session with line items
- [ ] `/api/webhooks/stripe/route.ts` — Handle `checkout.session.completed` webhook
- [ ] Redirect to Stripe hosted checkout (no PCI headaches)
- [ ] On success: mark order as paid, trigger delivery
- [ ] Store Stripe session ID + payment intent on order record
- [ ] Support both one-time purchases and future subscriptions

### 1.3 Digital Product Delivery
- [ ] `/api/downloads/[orderId]/[productId]/route.ts` — Signed, time-limited download URLs
- [ ] Store product files in `/products/` directory (gitignored) or use Supabase Storage
- [ ] Generate unique download tokens per order (expire after 3 downloads or 7 days)
- [ ] Email delivery via Resend or SendGrid — order confirmation + download links
- [ ] Download page shows all purchased products with download buttons

### 1.4 Order Storage (Supabase)
- [ ] Create `gwds_orders` table: `id, order_id, email, name, items (jsonb), total, status, stripe_session_id, stripe_payment_intent, created_at`
- [ ] Create `gwds_downloads` table: `id, order_id, product_id, token, downloads_remaining, expires_at, created_at`
- [ ] Create `gwds_customers` table: `id, email, name, total_spent, order_count, first_purchase, last_purchase, created_at`
- [ ] Migrate from JSON file storage to Supabase
- [ ] All order/customer data persisted and queryable

---

## Phase 2: ADMIN CRM & PRODUCT MANAGEMENT (Days 3-4)
*Manage the store without touching code*

### 2.1 Admin Authentication
- [ ] `/admin` route group with simple auth (password-based or Supabase Auth)
- [ ] Admin middleware — check session/token before allowing access
- [ ] Login page at `/admin/login`
- [ ] Environment variable: `GWDS_ADMIN_PASSWORD`

### 2.2 Admin Dashboard (`/admin`)
- [ ] Overview cards: Total Revenue, Orders Today, Total Customers, Products Active
- [ ] Revenue chart (last 30 days) — simple bar/line chart
- [ ] Recent orders table (last 20)
- [ ] Quick links to Products, Orders, Customers

### 2.3 Product Manager (`/admin/products`)
- [ ] List all products with status, price, category, sales count
- [ ] Create new product form: name, description, price, category, features, badge, upload file
- [ ] Edit existing product — inline or modal
- [ ] Toggle product active/inactive (hide from store without deleting)
- [ ] Upload product files (ZIP, PDF) to Supabase Storage
- [ ] Product image upload
- [ ] Migrate product data from hardcoded `products.ts` → Supabase `gwds_products` table
- [ ] API: `/api/admin/products` — CRUD operations

### 2.4 Order Manager (`/admin/orders`)
- [ ] List all orders with status, customer, total, date
- [ ] Order detail view — items, payment status, download activity
- [ ] Mark orders as refunded/cancelled
- [ ] Resend download links
- [ ] Export orders to CSV

### 2.5 Customer Manager (`/admin/customers`)
- [ ] Customer list with email, total spent, order count, last purchase
- [ ] Customer detail — order history, download history
- [ ] Search/filter customers
- [ ] Export customer list

---

## Phase 3: FLAGSHIP TEMPLATE PRODUCTS (Days 5-8)
*Package our existing builds into sellable products*

### 3.1 AI Trading Dashboard Template ($149)
**Source**: `C:\TradingFarm\Cival-Dashboard-v9`
**What we strip down to**:
- [ ] Clean Next.js app with agent management UI
- [ ] Goal-based trading (set goals, agents pursue them)
- [ ] Market connections page: Bybit + Hyperliquid API key input
- [ ] Trade tracking dashboard: open positions, P&L, history
- [ ] Analytics page: performance charts, win rate, drawdown
- [ ] Agent configuration: strategy selection, risk tolerance, position sizing
- [ ] Remove: all GWDS-specific code, meme trading, flash loans, prop firms, Star Office
- [ ] Add: Setup wizard (enter API keys → connect → start trading)
- [ ] Add: README with setup instructions, env vars, deployment guide
- [ ] Package as ZIP with: source code, README, .env.example, database schema
- [ ] Create demo screenshots for store listing
- [ ] **Pricing**: $149 (source code, self-hosted, lifetime updates for 1 year)

### 3.2 Meme Trading System Template ($99)
**Source**: `C:\TradingFarm\Cival-Dashboard-v9` (meme agent features)
**What we package**:
- [ ] Meme coin discovery + trending detection
- [ ] Auto-trade meme coins on Hyperliquid/Bybit
- [ ] Position monitoring with auto-stop-loss
- [ ] Meme agent scheduler (scan interval, risk params)
- [ ] Simple dashboard: active meme trades, P&L, settings
- [ ] Remove: all non-meme-trading features
- [ ] Add: Setup guide, API key configuration, risk disclaimers
- [ ] Package as ZIP
- [ ] **Pricing**: $99 (source code, self-hosted)

### 3.3 Second Brain Template ($79)
**Source**: `C:\Users\Anthony\clawd\second-brain`
**What we streamline**:
- [ ] Clean PARA-organized knowledge base
- [ ] Task management (Kanban board)
- [ ] Document CRUD with rich text
- [ ] Full-text search across all content
- [ ] AI chat integration (bring your own API key)
- [ ] Weekly digest generation
- [ ] Calendar view
- [ ] Script library with TTS (optional)
- [ ] Remove: all Cival-specific agent data, GWDS-specific content
- [ ] Add: Onboarding flow, theme customization, deploy-to-Vercel button
- [ ] Add: Sample content so it's not empty on first run
- [ ] Package as ZIP
- [ ] **Pricing**: $79 (source code, Vercel-deployable)

### 3.4 Product Listing Pages
For each template:
- [ ] Hero section with product name + tagline
- [ ] Feature grid (what's included)
- [ ] Live demo screenshots / video embed
- [ ] Tech stack badges (Next.js, React, TypeScript, Supabase, etc.)
- [ ] FAQ section
- [ ] "What you get" checklist
- [ ] Testimonials section (placeholder for now)
- [ ] Add to cart / Buy now button
- [ ] Related products

---

## Phase 4: STORE POLISH & MARKETING (Days 9-10)
*Make it convert*

### 4.1 Store UX
- [ ] Product cards with hover preview
- [ ] Category filter tabs (sticky on scroll)
- [ ] Search functionality
- [ ] Sort by: price, popularity, newest
- [ ] "Featured" / "Best Seller" badges
- [ ] Product comparison (for templates)
- [ ] Bundle pricing (buy 2+ templates, get discount)

### 4.2 Email System
- [ ] Resend or SendGrid integration
- [ ] Order confirmation email (with download links)
- [ ] Welcome email for first-time customers
- [ ] Email templates (branded, not plain text)

### 4.3 SEO & Performance
- [ ] Proper meta tags on every page (title, description, OG image)
- [ ] Sitemap.xml generation
- [ ] robots.txt
- [ ] Product structured data (JSON-LD) for Google Shopping
- [ ] Image optimization (next/image, WebP)
- [ ] Core Web Vitals optimization

### 4.4 Legal Pages
- [ ] `/terms` — Terms of Service
- [ ] `/privacy` — Privacy Policy
- [ ] `/refunds` — Refund Policy (digital products = limited refunds)
- [ ] `/license` — Template license terms (personal vs commercial)

---

## Phase 5: ADVANCED FEATURES (Days 11-14)
*Scale and automate*

### 5.1 Customer Accounts (Optional)
- [ ] Sign up / sign in with email (Supabase Auth)
- [ ] Customer dashboard: order history, downloads, account settings
- [ ] Re-download purchased products anytime
- [ ] Save payment method for future purchases

### 5.2 Analytics & Reporting
- [ ] Admin analytics: revenue by product, conversion rates, top customers
- [ ] Stripe revenue dashboard embed
- [ ] Google Analytics 4 integration
- [ ] Conversion funnel tracking

### 5.3 Discount System
- [ ] Coupon codes (percentage or fixed amount)
- [ ] Auto-apply bundle discounts
- [ ] Limited-time offers with countdown
- [ ] `/api/admin/coupons` — CRUD

### 5.4 Content/Blog
- [ ] `/blog` with markdown-based posts
- [ ] SEO-optimized articles about trading, AI, productivity
- [ ] Funnel content → store products

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe Checkout + Webhooks |
| File Storage | Supabase Storage (product ZIPs) |
| Email | Resend ($0 for 100/day) |
| Auth (Admin) | Simple password or Supabase Auth |
| Hosting | Vercel (already deployed) |
| Animations | GSAP + Three.js (already installed) |
| Styling | Inline styles + globals.css |

## Database Schema (New Tables)

```sql
-- Products (migrate from hardcoded)
CREATE TABLE gwds_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  badge TEXT,
  emoji TEXT,
  features JSONB DEFAULT '[]',
  image_url TEXT,
  file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE gwds_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES gwds_customers(id),
  email TEXT NOT NULL,
  name TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE gwds_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Download tokens
CREATE TABLE gwds_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES gwds_orders(order_id),
  product_slug TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  downloads_remaining INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE gwds_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Revenue Projections (Conservative)

| Product | Price | Monthly Sales (Est) | Monthly Revenue |
|---------|-------|-------------------|----------------|
| AI Trading Dashboard | $149 | 10-20 | $1,490 - $2,980 |
| Meme Trading System | $99 | 15-30 | $1,485 - $2,970 |
| Second Brain Template | $79 | 20-40 | $1,580 - $3,160 |
| Prompt Packs ($24-39) | avg $30 | 30-50 | $900 - $1,500 |
| Other (wallpapers, animations) | avg $15 | 20-30 | $300 - $450 |
| **TOTAL** | | | **$5,755 - $11,060/mo** |

*With SEO + TikTok content funnel driving traffic, $5-10K/mo in 3-6 months is realistic.*

---

## Immediate Priority Order

1. **Phase 1** — Fix store, add Stripe, make it sellable TODAY
2. **Phase 2** — Admin CRM so Anthony can manage without code
3. **Phase 3.3** — Second Brain template (fastest to package, highest volume)
4. **Phase 3.1** — Trading Dashboard template (highest price, most complex)
5. **Phase 3.2** — Meme Trading template
6. **Phase 4-5** — Polish, SEO, advanced features

**Estimated total build time: 10-14 days with sub-agents**
