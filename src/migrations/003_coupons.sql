-- GWDS Coupon System
CREATE TABLE IF NOT EXISTS gwds_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  min_order NUMERIC DEFAULT 0,
  applies_to TEXT[] DEFAULT NULL,
  excludes TEXT[] DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gwds_coupons_code ON gwds_coupons(code);
CREATE INDEX IF NOT EXISTS idx_gwds_coupons_active ON gwds_coupons(is_active);

-- Add coupon tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER DEFAULT 0;
