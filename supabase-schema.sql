-- GWDS Store Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/vusjcfushwxwksfuszjv/sql)

-- Products
CREATE TABLE IF NOT EXISTS gwds_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  badge TEXT,
  emoji TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  file_url TEXT,
  demo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sales_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS gwds_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS gwds_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES gwds_customers(id),
  email TEXT NOT NULL,
  name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Download tokens
CREATE TABLE IF NOT EXISTS gwds_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  downloads_remaining INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS gwds_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  min_order DECIMAL(10,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS but allow service role full access
ALTER TABLE gwds_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gwds_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gwds_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gwds_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gwds_coupons ENABLE ROW LEVEL SECURITY;

-- Public read on active products
CREATE POLICY "Public can read active products" ON gwds_products FOR SELECT USING (is_active = true);

-- Service role can do everything
CREATE POLICY "Service role full access products" ON gwds_products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access customers" ON gwds_customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access orders" ON gwds_orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access downloads" ON gwds_downloads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access coupons" ON gwds_coupons FOR ALL USING (auth.role() = 'service_role');

-- Anon can read products and create orders (checkout flow)
CREATE POLICY "Anon can read products" ON gwds_products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Anon can create orders" ON gwds_orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read own order" ON gwds_orders FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read downloads" ON gwds_downloads FOR SELECT TO anon USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON gwds_products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON gwds_products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_email ON gwds_orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON gwds_orders(status);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON gwds_downloads(token);
CREATE INDEX IF NOT EXISTS idx_customers_email ON gwds_customers(email);

-- Seed helper function
CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
