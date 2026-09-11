import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const email = user.email!.toLowerCase();
    const supabase = createServerClient();

    // Verified email ownership is sufficient to claim pre-account purchases.
    const { data: legacyOrders } = await supabase
      .from('orders')
      .select('id,created_at')
      .is('user_id', null)
      .eq('customer_email', email)
      .in('status', ['paid', 'completed']);

    for (const legacy of legacyOrders || []) {
      const { data: claimed } = await supabase
        .from('orders')
        .update({ user_id: user.id, updated_at: new Date().toISOString() })
        .eq('id', legacy.id)
        .is('user_id', null)
        .select('id')
        .maybeSingle();
      if (!claimed) continue;

      const { data: legacyItems } = await supabase.from('order_items').select('id,product_id').eq('order_id', legacy.id);
      if (legacyItems?.length) {
        const updatesUntil = new Date(new Date(legacy.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('entitlements').upsert(legacyItems.map((item) => ({
          user_id: user.id,
          product_id: item.product_id,
          source_order_item_id: item.id,
          status: 'active',
          updates_until: updatesUntil,
        })), { onConflict: 'source_order_item_id', ignoreDuplicates: true });
      }
    }

    await supabase.from('customers').update({ user_id: user.id, updated_at: new Date().toISOString() })
      .eq('email', email).is('user_id', null);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id,customer_email,customer_name,total_cents,status,fulfillment_status,paid_at,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (ordersError) throw new CommerceError('ORDERS_UNAVAILABLE', 'Your purchases could not be loaded.', 503);
    if (!orders?.length) return NextResponse.json({ orders: [] }, { headers: { 'Cache-Control': 'private, no-store' } });

    const orderIds = orders.map((order) => order.id);
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id,order_id,product_id,quantity,price_cents,product_version')
      .in('order_id', orderIds);
    if (itemsError) throw new CommerceError('ORDERS_UNAVAILABLE', 'Your purchase details could not be loaded.', 503);

    const itemIds = (items || []).map((item) => item.id);
    const productIds = [...new Set((items || []).map((item) => item.product_id))];
    const [{ data: entitlements }, { data: downloads }, { data: products }] = await Promise.all([
      itemIds.length
        ? supabase.from('entitlements').select('id,source_order_item_id,status,updates_until').eq('user_id', user.id).in('source_order_item_id', itemIds)
        : Promise.resolve({ data: [] }),
      orderIds.length
        ? supabase.from('downloads').select('order_id,product_id,expires_at,downloaded_count,max_downloads,revoked_at').in('order_id', orderIds)
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase.from('products').select('id,artifact_ready,version').in('id', productIds)
        : Promise.resolve({ data: [] }),
    ]);

    const response = orders.map((order) => ({
      ...order,
      items: (items || []).filter((item) => item.order_id === order.id).map((item) => {
        const entitlement = (entitlements || []).find((entry) => entry.source_order_item_id === item.id);
        const download = (downloads || []).find((entry) => entry.order_id === order.id && entry.product_id === item.product_id);
        const product = (products || []).find((entry) => entry.id === item.product_id);
        return {
          ...item,
          entitlementStatus: entitlement?.status || 'unavailable',
          updatesUntil: entitlement?.updates_until || null,
          artifactReady: product?.artifact_ready === true,
          currentVersion: product?.version || item.product_version,
          download: download ? {
            expiresAt: download.expires_at,
            downloadedCount: download.downloaded_count,
            maxDownloads: download.max_downloads,
            revoked: Boolean(download.revoked_at),
          } : null,
        };
      }),
    }));

    return NextResponse.json({ orders: response }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
