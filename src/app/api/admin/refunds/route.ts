import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Orders that Stripe (via the signed webhook) has already marked as refunded,
// partially refunded, or disputed, plus anything the fulfillment RPC revoked
// for a different reason. This is the reconciliation surface, not a request
// queue — the source of truth is what Stripe told us actually happened.
const REFUND_RELEVANT_STATUSES = ['refunded', 'partially_refunded', 'disputed', 'dispute_lost'];

const REQUEST_STATUSES = ['requested', 'reviewing', 'approved', 'denied', 'refunded'] as const;
type RequestStatus = (typeof REQUEST_STATUSES)[number];

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();

    const { data: orders, error: ordersError } = await sb
      .from('orders')
      .select('id,customer_email,customer_name,user_id,total_cents,currency,status,fulfillment_status,failure_reason,payment_intent_id,stripe_session_id,paid_at,created_at,updated_at')
      .or(`status.in.(${REFUND_RELEVANT_STATUSES.join(',')}),fulfillment_status.eq.revoked`)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (ordersError) throw ordersError;

    const { data: requestRows, error: requestsError } = await sb
      .from('refund_requests')
      .select('id,user_id,order_id,reason,status,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (requestsError) throw requestsError;

    const orderIds = Array.from(new Set([
      ...(orders || []).map((o) => o.id),
      ...(requestRows || []).map((r) => r.order_id),
    ]));

    const [itemsRes, eventsRes, requestOrdersRes] = await Promise.all([
      orderIds.length
        ? sb.from('order_items').select('id,order_id,product_id,quantity,price_cents').in('order_id', orderIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? sb.from('stripe_events').select('stripe_event_id,event_type,status,order_id,last_error,received_at,processed_at')
          .in('order_id', orderIds).order('received_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? sb.from('orders').select('id,customer_email,total_cents,currency,status,fulfillment_status,created_at').in('id', orderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (itemsRes.error) throw itemsRes.error;
    if (eventsRes.error) throw eventsRes.error;
    if (requestOrdersRes.error) throw requestOrdersRes.error;

    const items = itemsRes.data || [];
    const itemIds = items.map((item) => item.id);
    const [entitlementsRes, downloadsRes, productsRes] = await Promise.all([
      itemIds.length
        ? sb.from('entitlements').select('id,product_id,source_order_item_id,status,revoked_at,revoke_reason').in('source_order_item_id', itemIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? sb.from('downloads').select('order_id,product_id,revoked_at').in('order_id', orderIds)
        : Promise.resolve({ data: [], error: null }),
      sb.from('products').select('id,name'),
    ]);
    if (entitlementsRes.error) throw entitlementsRes.error;
    if (downloadsRes.error) throw downloadsRes.error;
    if (productsRes.error) throw productsRes.error;

    const productNames = new Map((productsRes.data || []).map((p) => [p.id, p.name]));
    const orderMap = new Map((requestOrdersRes.data || []).map((o) => [o.id, o]));

    const enrichedOrders = (orders || []).map((order) => {
      const orderItems = items.filter((item) => item.order_id === order.id);
      const orderItemIds = new Set(orderItems.map((item) => item.id));
      const orderEntitlements = (entitlementsRes.data || []).filter((e) => orderItemIds.has(e.source_order_item_id));
      const orderDownloads = (downloadsRes.data || []).filter((d) => d.order_id === order.id);
      const orderEvents = (eventsRes.data || []).filter((e) => e.order_id === order.id);

      return {
        ...order,
        items: orderItems.map((item) => ({ ...item, product_name: productNames.get(item.product_id) || item.product_id })),
        entitlements: orderEntitlements.map((e) => ({ ...e, product_name: productNames.get(e.product_id) || e.product_id })),
        downloads_revoked: orderDownloads.filter((d) => d.revoked_at).length,
        downloads_total: orderDownloads.length,
        events: orderEvents,
      };
    });

    const requests = (requestRows || []).map((request) => ({
      ...request,
      order: orderMap.get(request.order_id) || null,
    }));

    const summary = {
      refunded_orders: (orders || []).filter((o) => o.status === 'refunded' || o.status === 'partially_refunded').length,
      disputed_orders: (orders || []).filter((o) => o.status === 'disputed' || o.status === 'dispute_lost').length,
      open_requests: requests.filter((r) => r.status === 'requested' || r.status === 'reviewing').length,
      revoked_entitlements: (entitlementsRes.data || []).filter((e) => e.status === 'revoked').length,
      total_refunded_cents: (orders || [])
        .filter((o) => o.status === 'refunded' || o.status === 'partially_refunded')
        .reduce((sum, o) => sum + (o.total_cents || 0), 0),
    };

    return NextResponse.json({ summary, orders: enrichedOrders, requests });
  } catch (err: any) {
    console.error('Admin refunds GET failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Refunds and disputes could not be loaded.', orders: [], requests: [] }, { status: 500 });
  }
}

// Mutations here never call Stripe. Refunds and dispute outcomes are decided by
// a human in the Stripe dashboard; this endpoint only reconciles our own
// database (order status bookkeeping, the refund_requests queue, and the
// entitlement/download revocation that access control actually reads) and
// records every change to admin_audit.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();

  try {
    const sb = createServerClient();
    const body = await req.json();
    const action = body?.action;

    if (action === 'set_request_status') {
      const { request_id, status } = body as { request_id?: string; status?: RequestStatus };
      if (!isUuid(request_id)) return NextResponse.json({ error: 'A valid request_id is required' }, { status: 400 });
      if (!REQUEST_STATUSES.includes(status as RequestStatus)) {
        return NextResponse.json({ error: `status must be one of: ${REQUEST_STATUSES.join(', ')}` }, { status: 400 });
      }

      const { data: existing, error: existingError } = await sb
        .from('refund_requests').select('id,order_id,status').eq('id', request_id).maybeSingle();
      if (existingError) throw existingError;
      if (!existing) return NextResponse.json({ error: 'Refund request not found' }, { status: 404 });

      const { data: updated, error: updateError } = await sb
        .from('refund_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', request_id)
        .select('id,order_id,status')
        .single();
      if (updateError) throw updateError;

      let revocation: { revoked_entitlements: number; revoked_downloads: number } | null = null;
      // Marking a request "refunded" is the admin confirming they issued the
      // refund in Stripe for it — access must be revoked in the same action,
      // not left to a webhook that may already have run or may never arrive
      // (e.g. a manual/off-platform refund).
      if (status === 'refunded') {
        revocation = await revokeOrderAccess(sb, existing.order_id, `refund_request:${request_id}`);
        await sb.from('orders').update({ status: 'refunded', fulfillment_status: 'revoked', updated_at: new Date().toISOString() })
          .eq('id', existing.order_id);
      }

      await sb.from('admin_audit').insert({
        action: 'refund_request_status_update',
        resource_type: 'refund_requests',
        resource_id: request_id,
        metadata: { from_status: existing.status, to_status: status, order_id: existing.order_id, admin_email: admin.email, revocation },
      }).then(({ error }) => { if (error) console.error('Audit log error:', error); });

      return NextResponse.json({ request: updated, revocation });
    }

    if (action === 'revoke_entitlements') {
      const { order_id, reason } = body as { order_id?: string; reason?: string };
      if (!isUuid(order_id)) return NextResponse.json({ error: 'A valid order_id is required' }, { status: 400 });
      const { data: order, error: orderError } = await sb.from('orders').select('id,status,fulfillment_status').eq('id', order_id).maybeSingle();
      if (orderError) throw orderError;
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const revocation = await revokeOrderAccess(sb, order_id, reason || 'admin_manual_revoke');
      await sb.from('orders').update({ fulfillment_status: 'revoked', updated_at: new Date().toISOString() }).eq('id', order_id);

      await sb.from('admin_audit').insert({
        action: 'order_access_revoked',
        resource_type: 'orders',
        resource_id: order_id,
        metadata: { reason: reason || 'admin_manual_revoke', admin_email: admin.email, ...revocation },
      }).then(({ error }) => { if (error) console.error('Audit log error:', error); });

      return NextResponse.json({ order_id, ...revocation });
    }

    if (action === 'restore_entitlements') {
      const { order_id, reason } = body as { order_id?: string; reason?: string };
      if (!isUuid(order_id)) return NextResponse.json({ error: 'A valid order_id is required' }, { status: 400 });
      const { data: order, error: orderError } = await sb.from('orders').select('id,status,fulfillment_status').eq('id', order_id).maybeSingle();
      if (orderError) throw orderError;
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const { data: orderItemRows, error: itemsError } = await sb.from('order_items').select('id').eq('order_id', order_id);
      if (itemsError) throw itemsError;
      const orderItemIds = (orderItemRows || []).map((row) => row.id);

      let restoredEntitlements = 0;
      if (orderItemIds.length) {
        const { data: restored, error: restoreError } = await sb
          .from('entitlements')
          .update({ status: 'active', revoked_at: null, revoke_reason: null })
          .in('source_order_item_id', orderItemIds)
          .eq('status', 'revoked')
          .select('id');
        if (restoreError) throw restoreError;
        restoredEntitlements = restored?.length || 0;
      }
      await sb.from('downloads').update({ revoked_at: null, updated_at: new Date().toISOString() })
        .eq('order_id', order_id).not('revoked_at', 'is', null);
      await sb.from('orders').update({ status: 'paid', fulfillment_status: 'fulfilled', failure_reason: null, updated_at: new Date().toISOString() })
        .eq('id', order_id);

      await sb.from('admin_audit').insert({
        action: 'order_access_restored',
        resource_type: 'orders',
        resource_id: order_id,
        metadata: { reason: reason || 'admin_manual_restore', admin_email: admin.email, restored_entitlements: restoredEntitlements },
      }).then(({ error }) => { if (error) console.error('Audit log error:', error); });

      return NextResponse.json({ order_id, restored_entitlements: restoredEntitlements });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin refunds POST failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'The request could not be completed.' }, { status: 500 });
  }
}

async function revokeOrderAccess(sb: ReturnType<typeof createServerClient>, orderId: string, reason: string) {
  const { data: orderItemRows, error: itemsError } = await sb.from('order_items').select('id').eq('order_id', orderId);
  if (itemsError) throw itemsError;
  const orderItemIds = (orderItemRows || []).map((row) => row.id);

  let revokedEntitlements = 0;
  if (orderItemIds.length) {
    const { data: revoked, error: revokeError } = await sb
      .from('entitlements')
      .update({ status: 'revoked', revoked_at: new Date().toISOString(), revoke_reason: reason.slice(0, 500) })
      .in('source_order_item_id', orderItemIds)
      .eq('status', 'active')
      .select('id');
    if (revokeError) throw revokeError;
    revokedEntitlements = revoked?.length || 0;
  }

  const { data: revokedDownloads, error: downloadsError } = await sb
    .from('downloads')
    .update({ revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .is('revoked_at', null)
    .select('id');
  if (downloadsError) throw downloadsError;

  return { revoked_entitlements: revokedEntitlements, revoked_downloads: revokedDownloads?.length || 0 };
}
