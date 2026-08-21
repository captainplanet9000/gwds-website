import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  CommerceError,
  DOWNLOAD_MAX_USES,
  DOWNLOAD_TTL_SECONDS,
  errorResponseBody,
  getSiteUrl,
  hashDownloadToken,
  newDownloadToken,
  requireVerifiedUser,
} from '@/lib/commerce';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const body = await req.json() as { orderId?: unknown; productId?: unknown };
    if (typeof body.orderId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.orderId)
      || typeof body.productId !== 'string' || !/^[a-z0-9-]{2,80}$/.test(body.productId)) {
      throw new CommerceError('INVALID_DOWNLOAD_REQUEST', 'Choose a valid purchase to download.');
    }

    const supabase = createServerClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id,status')
      .eq('id', body.orderId)
      .eq('user_id', user.id)
      .in('status', ['paid', 'completed'])
      .maybeSingle();
    if (!order) throw new CommerceError('ORDER_NOT_FOUND', 'This paid order was not found.', 404);

    const { data: item } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', order.id)
      .eq('product_id', body.productId)
      .maybeSingle();
    if (!item) throw new CommerceError('PRODUCT_NOT_PURCHASED', 'This product is not part of the order.', 403);

    const [{ data: entitlement }, { data: product }] = await Promise.all([
      supabase.from('entitlements').select('id,status').eq('source_order_item_id', item.id).eq('user_id', user.id).eq('status', 'active').maybeSingle(),
      supabase.from('products').select('artifact_ready,artifact_path,artifact_sha256,artifact_size_bytes').eq('id', body.productId).maybeSingle(),
    ]);
    if (!entitlement) throw new CommerceError('ENTITLEMENT_INACTIVE', 'Your license for this product is not active.', 403);
    if (!product?.artifact_ready || !product.artifact_path || !product.artifact_sha256 || !product.artifact_size_bytes) {
      throw new CommerceError('RELEASE_NOT_READY', 'This release is temporarily unavailable while its archive is verified.', 503);
    }

    // Confirm Storage can sign the exact artifact before issuing a customer token.
    const { data: health, error: storageError } = await supabase.storage.from('downloads').createSignedUrl(product.artifact_path, 30);
    if (storageError || !health?.signedUrl) {
      throw new CommerceError('DOWNLOAD_SERVICE_UNAVAILABLE', 'Downloads are temporarily unavailable. Please try again later.', 503);
    }

    const rawToken = newDownloadToken();
    const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_SECONDS * 1000).toISOString();
    const { error: tokenError } = await supabase.from('downloads').upsert({
      order_id: order.id,
      product_id: body.productId,
      entitlement_id: entitlement.id,
      download_token: null,
      token_hash: hashDownloadToken(rawToken),
      expires_at: expiresAt,
      downloaded_count: 0,
      max_downloads: DOWNLOAD_MAX_USES,
      revoked_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_id,product_id' });
    if (tokenError) throw new CommerceError('TOKEN_ISSUE_FAILED', 'A download link could not be created.', 503);

    const path = `/api/downloads/${order.id}/${encodeURIComponent(body.productId)}?token=${encodeURIComponent(rawToken)}`;
    return NextResponse.json({
      downloadUrl: `${getSiteUrl()}${path}`,
      expiresAt,
      maxDownloads: DOWNLOAD_MAX_USES,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
