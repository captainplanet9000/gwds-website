import { createClient } from "@supabase/supabase-js";

// Browser client (using anon key - safe for client-side)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server client (using service role key - for API routes only)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types
export interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  badge: string | null;
  emoji: string;
  features: string[];
  image_url: string | null;
  stripe_price_id: string | null;
  download_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string | null;
  total_cents: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  created_at: string;
}

export interface Download {
  id: string;
  order_id: string;
  product_id: string;
  download_token: string;
  expires_at: string;
  downloaded_count: number;
  max_downloads: number;
  created_at: string;
}
