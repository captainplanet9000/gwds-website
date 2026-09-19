import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { needsReleaseAcceptance } from '@/lib/release-readiness';
import { products } from '@/lib/products';

export const dynamic = 'force-dynamic';

/** Public availability only. Storage paths, signing keys and orders never leave the server. */
export async function GET() {
  try {
    const { data, error } = await createServerClient().from('products')
      .select('id,price_cents,stripe_price_id_live,version,is_active,artifact_ready,artifact_sha256,artifact_size_bytes')
      .in('id', products.filter(p => !p.legacy).map(p => p.id));
    if (error) throw error;
    return NextResponse.json({ products: products.filter(p => !p.legacy).map(product => {
      const row = data?.find(item => item.id === product.id);
      return {
        id: product.id,
        available: !needsReleaseAcceptance(product.id) && process.env.NEXT_PUBLIC_STORE_SALES_ENABLED === 'true' && !!row?.is_active && !!row?.artifact_ready
          && !!row?.artifact_sha256 && Number(row?.artifact_size_bytes) > 0
          && row?.price_cents === Math.round(product.price * 100) && row?.stripe_price_id_live === product.stripePriceId,
        version: row?.version || null,
      };
    }) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Product availability could not be checked. Please retry.' }, { status: 503 });
  }
}
