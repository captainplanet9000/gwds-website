import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { hashDownloadToken } from '@/lib/commerce';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string; productId: string }> },
) {
  const { orderId, productId } = await params;
  const token = req.nextUrl.searchParams.get('token');
  const noStore = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };

  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !/^[a-z0-9-]{2,80}$/.test(productId)
    || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid or expired download link.' }, { status: 403, headers: noStore });
  }

  try {
    const supabase = createServerClient();
    const tokenHash = hashDownloadToken(token);
    const { data: download } = await supabase
      .from('downloads')
      .select('id,expires_at,downloaded_count,max_downloads,revoked_at,entitlement_id')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!download || download.revoked_at || !download.expires_at
      || new Date(download.expires_at).getTime() <= Date.now()
      || download.downloaded_count >= download.max_downloads) {
      return NextResponse.json({ error: 'Invalid or expired download link.' }, { status: 403, headers: noStore });
    }

    const { data: product } = await supabase
      .from('products')
      .select('artifact_ready,artifact_path,artifact_sha256,artifact_size_bytes')
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();
    if (!product?.artifact_ready || !product.artifact_path || !product.artifact_sha256 || !product.artifact_size_bytes) {
      return NextResponse.json({ error: 'This release is temporarily unavailable.' }, { status: 503, headers: noStore });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('downloads')
      .createSignedUrl(product.artifact_path, 5 * 60, { download: product.artifact_path.split('/').pop() || 'cival-release.zip' });
    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: 'The download service is temporarily unavailable.' }, { status: 503, headers: noStore });
    }

    const { data: consumed, error: consumeError } = await supabase.rpc('consume_store_download', {
      p_token_hash: tokenHash,
      p_order_id: orderId,
      p_product_id: productId,
    });
    if (consumeError || consumed !== true) {
      return NextResponse.json({ error: 'Invalid or expired download link.' }, { status: 403, headers: noStore });
    }

    const response = NextResponse.redirect(signed.signedUrl, 303);
    Object.entries(noStore).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  } catch {
    return NextResponse.json({ error: 'The download service is temporarily unavailable.' }, { status: 503, headers: noStore });
  }
}
