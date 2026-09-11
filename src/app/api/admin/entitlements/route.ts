import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { DOWNLOAD_MAX_USES, DOWNLOAD_TTL_SECONDS, getSiteUrl, hashDownloadToken, newDownloadToken } from '@/lib/commerce';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const ENTITLEMENT_STATUSES = ['active', 'revoked'] as const;

type EntitlementRow = {
  id: string;
  user_id: string;
  product_id: string;
  source_order_item_id: string;
  status: string;
  updates_until: string | null;
  granted_at: string;
  revoked_at: string | null;
  revoke_reason: string | null;
};

type OrderItemRow = { id: string; order_id: string };
type OrderRow = { id: string; customer_email: string; customer_name: string | null; status: string; created_at: string };
type ProductRow = { id: string; name: string; emoji: string };
type DownloadRow = {
  order_id: string;
  product_id: string;
  expires_at: string | null;
  downloaded_count: number;
  max_downloads: number;
  revoked_at: string | null;
  last_downloaded_at: string | null;
};

function normalizeReason(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 500);
  return trimmed || null;
}

// Never include download_token/token_hash here — admin list views must not expose raw tokens.
function buildView(
  entitlement: EntitlementRow,
  orderItem: OrderItemRow | undefined,
  order: OrderRow | undefined,
  product: ProductRow | undefined,
  download: DownloadRow | undefined,
) {
  return {
    id: entitlement.id,
    userId: entitlement.user_id,
    productId: entitlement.product_id,
    productName: product?.name || entitlement.product_id,
    productEmoji: product?.emoji || null,
    orderId: orderItem?.order_id || null,
    orderStatus: order?.status || null,
    customerEmail: order?.customer_email || null,
    customerName: order?.customer_name || null,
    status: entitlement.status,
    active: entitlement.status === 'active' && !entitlement.revoked_at,
    updatesUntil: entitlement.updates_until,
    grantedAt: entitlement.granted_at,
    revokedAt: entitlement.revoked_at,
    revokeReason: entitlement.revoke_reason,
    download: download ? {
      downloadedCount: download.downloaded_count,
      maxDownloads: download.max_downloads,
      expiresAt: download.expires_at,
      lastDownloadedAt: download.last_downloaded_at,
      revoked: Boolean(download.revoked_at),
    } : null,
  };
}

async function hydrate(sb: ReturnType<typeof createServerClient>, entitlements: EntitlementRow[]) {
  if (!entitlements.length) return [];

  const sourceItemIds = [...new Set(entitlements.map((e) => e.source_order_item_id))];
  const { data: orderItems, error: orderItemsError } = await sb
    .from('order_items').select('id,order_id').in('id', sourceItemIds);
  if (orderItemsError) throw orderItemsError;

  const orderIds = [...new Set((orderItems || []).map((i) => i.order_id))];
  const productIds = [...new Set(entitlements.map((e) => e.product_id))];

  const [{ data: orders, error: ordersError }, { data: products, error: productsError }, { data: downloads, error: downloadsError }] = await Promise.all([
    orderIds.length
      ? sb.from('orders').select('id,customer_email,customer_name,status,created_at').in('id', orderIds)
      : Promise.resolve({ data: [] as OrderRow[], error: null }),
    productIds.length
      ? sb.from('products').select('id,name,emoji').in('id', productIds)
      : Promise.resolve({ data: [] as ProductRow[], error: null }),
    orderIds.length
      ? sb.from('downloads').select('order_id,product_id,expires_at,downloaded_count,max_downloads,revoked_at,last_downloaded_at').in('order_id', orderIds)
      : Promise.resolve({ data: [] as DownloadRow[], error: null }),
  ]);
  if (ordersError) throw ordersError;
  if (productsError) throw productsError;
  if (downloadsError) throw downloadsError;

  return entitlements.map((entitlement) => {
    const orderItem = (orderItems || []).find((i) => i.id === entitlement.source_order_item_id);
    const order = orderItem ? (orders || []).find((o) => o.id === orderItem.order_id) : undefined;
    const product = (products || []).find((p) => p.id === entitlement.product_id);
    const download = orderItem
      ? (downloads || []).find((d) => d.order_id === orderItem.order_id && d.product_id === entitlement.product_id)
      : undefined;
    return buildView(entitlement, orderItem, order, product, download);
  });
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 320);
    const statusFilter = url.searchParams.get('status') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
    const offset = (page - 1) * limit;

    // Search spans orders (by email or order id), so resolve matching orders/items first.
    let itemIds: string[] | null = null;
    if (q) {
      let orderQuery = sb.from('orders').select('id');
      orderQuery = UUID_RE.test(q) ? orderQuery.eq('id', q) : orderQuery.ilike('customer_email', `%${q}%`);
      const { data: matchedOrders, error: orderSearchError } = await orderQuery.limit(200);
      if (orderSearchError) throw orderSearchError;
      const matchedOrderIds = (matchedOrders || []).map((o) => o.id);
      if (!matchedOrderIds.length) {
        return NextResponse.json({ entitlements: [], total: 0, page, limit }, { headers: { 'Cache-Control': 'no-store' } });
      }
      const { data: items, error: itemsError } = await sb.from('order_items').select('id').in('order_id', matchedOrderIds);
      if (itemsError) throw itemsError;
      itemIds = (items || []).map((i) => i.id);
      if (!itemIds.length) {
        return NextResponse.json({ entitlements: [], total: 0, page, limit }, { headers: { 'Cache-Control': 'no-store' } });
      }
    }

    let entQuery = sb.from('entitlements')
      .select('id,user_id,product_id,source_order_item_id,status,updates_until,granted_at,revoked_at,revoke_reason', { count: 'exact' });
    if (itemIds) entQuery = entQuery.in('source_order_item_id', itemIds);
    if ((ENTITLEMENT_STATUSES as readonly string[]).includes(statusFilter)) entQuery = entQuery.eq('status', statusFilter);

    const { data: entitlements, error: entError, count } = await entQuery
      .order('granted_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (entError) throw entError;

    const view = await hydrate(sb, (entitlements || []) as EntitlementRow[]);
    return NextResponse.json({ entitlements: view, total: count || 0, page, limit }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, entitlements: [] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();
  try {
    if (Number(req.headers.get('content-length') || '0') > 8_192) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const body = await req.json() as Record<string, unknown>;
    const action = body.action;
    const entitlementId = body.entitlementId;
    if (typeof entitlementId !== 'string' || !UUID_RE.test(entitlementId)) {
      return NextResponse.json({ error: 'A valid entitlementId is required' }, { status: 400 });
    }
    if (action !== 'revoke' && action !== 'reissue') {
      return NextResponse.json({ error: 'action must be revoke or reissue' }, { status: 400 });
    }

    const sb = createServerClient();
    const { data: entitlement, error: entError } = await sb
      .from('entitlements')
      .select('id,user_id,product_id,source_order_item_id,status,updates_until,granted_at,revoked_at,revoke_reason')
      .eq('id', entitlementId)
      .maybeSingle();
    if (entError) throw entError;
    if (!entitlement) return NextResponse.json({ error: 'Entitlement not found' }, { status: 404 });

    const { data: orderItem, error: orderItemError } = await sb
      .from('order_items').select('id,order_id').eq('id', entitlement.source_order_item_id).maybeSingle();
    if (orderItemError) throw orderItemError;
    if (!orderItem) return NextResponse.json({ error: 'Source order item not found' }, { status: 409 });

    const now = new Date().toISOString();

    if (action === 'revoke') {
      const reason = normalizeReason(body.reason) || 'admin_revoked';
      const { data: updated, error: updateError } = await sb
        .from('entitlements')
        .update({ status: 'revoked', revoked_at: now, revoke_reason: reason })
        .eq('id', entitlementId)
        .select('id,user_id,product_id,source_order_item_id,status,updates_until,granted_at,revoked_at,revoke_reason')
        .single();
      if (updateError) throw updateError;

      await sb.from('downloads')
        .update({ revoked_at: now, updated_at: now })
        .eq('order_id', orderItem.order_id)
        .eq('product_id', entitlement.product_id)
        .is('revoked_at', null);

      try {
        await sb.from('admin_audit').insert({
          action: 'entitlement_revoke',
          resource_type: 'entitlement',
          resource_id: entitlementId,
          metadata: { product_id: entitlement.product_id, order_id: orderItem.order_id, user_id: entitlement.user_id, reason, admin_email: admin.email },
        });
      } catch (auditErr) {
        console.error('Audit log error:', auditErr);
      }

      const [view] = await hydrate(sb, [updated as EntitlementRow]);
      return NextResponse.json({ entitlement: view });
    }

    // Reissue: restore the entitlement to active and mint a fresh, single-use download link.
    const { data: product, error: productError } = await sb
      .from('products').select('artifact_ready,artifact_path,artifact_sha256,artifact_size_bytes')
      .eq('id', entitlement.product_id).maybeSingle();
    if (productError) throw productError;
    if (!product?.artifact_ready || !product.artifact_path || !product.artifact_sha256 || !product.artifact_size_bytes) {
      return NextResponse.json({ error: 'This release is not ready to reissue (artifact unverified).' }, { status: 409 });
    }

    const { data: health, error: storageError } = await sb.storage.from('downloads').createSignedUrl(product.artifact_path, 30);
    if (storageError || !health?.signedUrl) {
      return NextResponse.json({ error: 'Downloads are temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    const { data: updatedEntitlement, error: reactivateError } = await sb
      .from('entitlements')
      .update({ status: 'active', revoked_at: null, revoke_reason: null })
      .eq('id', entitlementId)
      .select('id,user_id,product_id,source_order_item_id,status,updates_until,granted_at,revoked_at,revoke_reason')
      .single();
    if (reactivateError) throw reactivateError;

    const rawToken = newDownloadToken();
    const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_SECONDS * 1000).toISOString();
    const { error: tokenError } = await sb.from('downloads').upsert({
      order_id: orderItem.order_id,
      product_id: entitlement.product_id,
      entitlement_id: entitlement.id,
      download_token: null,
      token_hash: hashDownloadToken(rawToken),
      expires_at: expiresAt,
      downloaded_count: 0,
      max_downloads: DOWNLOAD_MAX_USES,
      revoked_at: null,
      updated_at: now,
    }, { onConflict: 'order_id,product_id' });
    if (tokenError) throw tokenError;

    try {
      await sb.from('admin_audit').insert({
        action: 'entitlement_reissue',
        resource_type: 'entitlement',
        resource_id: entitlementId,
        metadata: { product_id: entitlement.product_id, order_id: orderItem.order_id, user_id: entitlement.user_id, admin_email: admin.email },
      });
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }

    const [view] = await hydrate(sb, [updatedEntitlement as EntitlementRow]);
    const path = `/api/downloads/${orderItem.order_id}/${encodeURIComponent(entitlement.product_id)}?token=${encodeURIComponent(rawToken)}`;
    return NextResponse.json({
      entitlement: view,
      downloadUrl: `${getSiteUrl()}${path}`,
      expiresAt,
      maxDownloads: DOWNLOAD_MAX_USES,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
