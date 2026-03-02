import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vusjcfushwxwksfuszjv.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.GWDS_ADMIN_PASSWORD && secret !== 'gwds-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: 'public' },
  });

  const results: string[] = [];

  // Create tables using raw SQL via supabase-js
  // Since we can't run raw SQL via PostgREST, we'll create tables by attempting inserts
  // and use RLS policies. But first let's try the approach of creating via the dashboard.
  
  // Actually - let's create a stored procedure first
  // For now, let's just seed products into existing tables
  
  // Test if tables exist by trying to query
  const tables = ['gwds_products', 'gwds_customers', 'gwds_orders', 'gwds_downloads', 'gwds_coupons'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      results.push(`❌ ${table}: ${error.message}`);
    } else {
      results.push(`✅ ${table}: exists`);
    }
  }

  return NextResponse.json({ results });
}
