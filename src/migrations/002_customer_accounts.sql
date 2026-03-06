-- Migration: Customer Account System
-- Adds user_id link to orders and indexes for email-based lookups

-- Add user_id to orders (optional link to auth user)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Note: Downloads remain time-limited by default.
-- Account holders can regenerate tokens via /api/account/regenerate-download.
