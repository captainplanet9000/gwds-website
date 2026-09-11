import { isPaidOrder, readReportRows } from '@/lib/reporting';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

// Status vocabulary as actually written by supabase/rpc (create_store_checkout,
// fulfill_store_order, apply_store_order_status_event — see src/app/api/webhooks/stripe/route.ts).
// Mirrors the categorization used by /api/admin/refunds for consistency.
const REFUNDED_STATUSES = ['refunded', 'partially_refunded'];
const DISPUTED_STATUSES = ['disputed', 'dispute_lost'];
const FAILED_STATUSES = ['payment_failed'];
const ABANDONED_STATUSES = ['expired'];
const ALLOWED_PERIOD_DAYS = [7, 30, 90, 180, 365];
const STALE_PENDING_MS = 60 * 60 * 1000; // an order still "pending" past this is treated as abandoned, not in-flight

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  total_cents: number | null;
  subtotal_cents: number | null;
  discount_cents: number | null;
  coupon_code: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type ItemRow = { order_id: string; product_id: string; quantity: number | null; price_cents: number | null };

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function dollars(cents: number): number {
  return round2((cents || 0) / 100);
}

// Revenue date = when money actually landed (paid_at). Falls back to created_at
// only for rows where paid_at somehow wasn't stamped, so nothing silently drops.
function revenueDate(order: OrderRow): Date {
  return new Date(order.paid_at || order.created_at);
}

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7);
}

function buildDaily(completed: OrderRow[], numDays: number, now: Date) {
  const buckets: { date: string; label: string; revenue: number; orders: number }[] = [];
  const byDay = new Map<string, { revenueCents: number; orders: number }>();
  for (const o of completed) {
    const key = dayKey(revenueDate(o));
    const cur = byDay.get(key) || { revenueCents: 0, orders: 0 };
    cur.revenueCents += o.total_cents || 0;
    cur.orders += 1;
    byDay.set(key, cur);
  }
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(utcDayStart(now).getTime() - i * 86400000);
    const key = dayKey(d);
    const bucket = byDay.get(key);
    buckets.push({
      date: key,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      revenue: dollars(bucket?.revenueCents || 0),
      orders: bucket?.orders || 0,
    });
  }
  return buckets;
}

function buildWeekly(completed: OrderRow[], numWeeks: number, now: Date) {
  const todayStart = utcDayStart(now);
  const weeks: { weekStart: string; weekEnd: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekEnd = new Date(todayStart.getTime() - i * 7 * 86400000);
    const weekStart = new Date(weekEnd.getTime() - 6 * 86400000);
    const weekEndExclusive = new Date(weekEnd.getTime() + 86400000);
    let revenueCents = 0;
    let orders = 0;
    for (const o of completed) {
      const t = revenueDate(o).getTime();
      if (t >= weekStart.getTime() && t < weekEndExclusive.getTime()) {
        revenueCents += o.total_cents || 0;
        orders += 1;
      }
    }
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    weeks.push({
      weekStart: dayKey(weekStart),
      weekEnd: dayKey(weekEnd),
      label: `${fmt(weekStart)}–${fmt(weekEnd)}`,
      revenue: dollars(revenueCents),
      orders,
    });
  }
  return weeks;
}

function buildMonthly(completed: OrderRow[], numMonths: number, now: Date) {
  const months: { month: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = monthKey(d);
    let revenueCents = 0;
    let orders = 0;
    for (const o of completed) {
      if (monthKey(revenueDate(o)) === key) {
        revenueCents += o.total_cents || 0;
        orders += 1;
      }
    }
    months.push({
      month: key,
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      revenue: dollars(revenueCents),
      orders,
    });
  }
  return months;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();

  try {
    const sb = createServerClient();
    const url = new URL(req.url);
    const requestedDays = Number(url.searchParams.get('days'));
    const days = ALLOWED_PERIOD_DAYS.includes(requestedDays) ? requestedDays : 30;
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 86400000);

    const [orders, items] = await Promise.all([
      readReportRows<OrderRow>((from, to) => sb.from('orders')
        .select('id,user_id,customer_email,customer_name,total_cents,subtotal_cents,discount_cents,coupon_code,status,paid_at,created_at,updated_at', { count: 'exact' })
        .order('created_at').order('id').range(from, to)),
      readReportRows<ItemRow>((from, to) => sb.from('order_items')
        .select('order_id,product_id,quantity,price_cents', { count: 'exact' })
        .order('id').range(from, to)),
    ]);

    // Non-critical lookups degrade to empty rather than failing the whole report.
    const [productsRes, couponsRes, customersRes, refundReqRes] = await Promise.all([
      sb.from('products').select('id,name').then((r) => r, () => ({ data: [], error: null })),
      sb.from('gwds_coupons').select('code,description,discount_type,discount_value,used_count,is_active,max_uses,expires_at').then((r) => r, () => ({ data: [], error: null })),
      sb.from('customers').select('id,user_id,email,name,order_count,total_spent,last_order_at,created_at').then((r) => r, () => ({ data: [], error: null })),
      sb.from('refund_requests').select('id,order_id,status,created_at,updated_at').then((r) => r, () => ({ data: [], error: null })),
    ]);

    const productName = new Map<string, string>((productsRes.data || []).map((p: any) => [p.id, p.name]));
    const coupons = (couponsRes.data || []) as any[];
    const customers = (customersRes.data || []) as any[];
    const refundRequests = (refundReqRes.data || []) as any[];

    const completed = orders.filter(isPaidOrder);
    const itemsByOrder = new Map<string, ItemRow[]>();
    for (const it of items) {
      const arr = itemsByOrder.get(it.order_id) || [];
      arr.push(it);
      itemsByOrder.set(it.order_id, arr);
    }

    // ---------- Top-line revenue cards: always fresh, independent of the period selector ----------
    const sinceMs = (ms: number) => completed
      .filter((o) => revenueDate(o).getTime() >= now.getTime() - ms)
      .reduce((s, o) => s + (o.total_cents || 0), 0);
    const todayStart = utcDayStart(now);
    const todayCents = completed
      .filter((o) => revenueDate(o).getTime() >= todayStart.getTime())
      .reduce((s, o) => s + (o.total_cents || 0), 0);

    const revenueSummary = {
      today: dollars(todayCents),
      last7Days: dollars(sinceMs(7 * 86400000)),
      last30Days: dollars(sinceMs(30 * 86400000)),
      last90Days: dollars(sinceMs(90 * 86400000)),
      allTime: dollars(completed.reduce((s, o) => s + (o.total_cents || 0), 0)),
    };

    const trend = {
      daily: buildDaily(completed, 30, now),
      weekly: buildWeekly(completed, 12, now),
      monthly: buildMonthly(completed, 12, now),
    };

    // ---------- Period-scoped slices ----------
    // "Started" = checkout attempts opened in the period (by created_at) — the funnel base.
    const startedInPeriod = orders.filter((o) => new Date(o.created_at).getTime() >= periodStart.getTime());
    const completedInPeriod = startedInPeriod.filter(isPaidOrder);
    const failedInPeriod = startedInPeriod.filter((o) => FAILED_STATUSES.includes(o.status));
    const expiredInPeriod = startedInPeriod.filter((o) => ABANDONED_STATUSES.includes(o.status));
    const stillPendingInPeriod = startedInPeriod.filter((o) => o.status === 'pending' && now.getTime() - new Date(o.created_at).getTime() <= STALE_PENDING_MS);
    const stalePendingInPeriod = startedInPeriod.filter((o) => o.status === 'pending' && now.getTime() - new Date(o.created_at).getTime() > STALE_PENDING_MS);
    const disputedInPeriod = startedInPeriod.filter((o) => DISPUTED_STATUSES.includes(o.status));

    const periodRevenueCents = completedInPeriod.reduce((s, o) => s + (o.total_cents || 0), 0);
    const periodAov = completedInPeriod.length ? periodRevenueCents / completedInPeriod.length / 100 : 0;
    const conversionRatePct = startedInPeriod.length ? round2((completedInPeriod.length / startedInPeriod.length) * 100) : 0;

    // ---------- Top products (period, by units and by revenue) ----------
    const productAgg = new Map<string, { units: number; revenueCents: number }>();
    for (const o of completedInPeriod) {
      for (const it of itemsByOrder.get(o.id) || []) {
        const cur = productAgg.get(it.product_id) || { units: 0, revenueCents: 0 };
        cur.units += it.quantity || 1;
        cur.revenueCents += (it.price_cents || 0) * (it.quantity || 1);
        productAgg.set(it.product_id, cur);
      }
    }
    const productRows = Array.from(productAgg.entries()).map(([productId, agg]) => ({
      productId,
      productName: productName.get(productId) || productId,
      units: agg.units,
      revenue: dollars(agg.revenueCents),
    }));
    const byRevenue = [...productRows].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const byUnits = [...productRows].sort((a, b) => b.units - a.units).slice(0, 10);

    // ---------- Coupons: period redemptions + discount given, plus an all-time leaderboard ----------
    const couponAgg = new Map<string, { redemptions: number; discountCents: number }>();
    for (const o of completedInPeriod) {
      if (!o.coupon_code) continue;
      const cur = couponAgg.get(o.coupon_code) || { redemptions: 0, discountCents: 0 };
      cur.redemptions += 1;
      cur.discountCents += o.discount_cents || 0;
      couponAgg.set(o.coupon_code, cur);
    }
    const couponInfo = new Map(coupons.map((c) => [c.code, c]));
    const couponBreakdown = Array.from(couponAgg.entries()).map(([code, agg]) => {
      const info = couponInfo.get(code);
      return {
        code,
        redemptions: agg.redemptions,
        discountGiven: dollars(agg.discountCents),
        description: info?.description || null,
        discountType: info?.discount_type || null,
        discountValue: info?.discount_value ?? null,
      };
    }).sort((a, b) => b.discountGiven - a.discountGiven);

    const couponLeaderboard = [...coupons]
      .sort((a, b) => (b.used_count || 0) - (a.used_count || 0))
      .map((c) => ({
        code: c.code,
        usedCount: c.used_count || 0,
        isActive: !!c.is_active,
        maxUses: c.max_uses ?? null,
        expiresAt: c.expires_at ?? null,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        description: c.description || null,
      }));

    // ---------- New vs returning customers (period) ----------
    const firstOrderAtByUser = new Map<string, number>();
    for (const o of completed) {
      if (!o.user_id) continue;
      const t = revenueDate(o).getTime();
      const cur = firstOrderAtByUser.get(o.user_id);
      if (cur === undefined || t < cur) firstOrderAtByUser.set(o.user_id, t);
    }
    let newCustomerRevenueCents = 0;
    let returningCustomerRevenueCents = 0;
    const newCustomerIds = new Set<string>();
    const returningCustomerIds = new Set<string>();
    for (const o of completedInPeriod) {
      if (!o.user_id) continue;
      const firstAt = firstOrderAtByUser.get(o.user_id);
      const isNew = firstAt !== undefined && firstAt >= periodStart.getTime();
      if (isNew) {
        newCustomerRevenueCents += o.total_cents || 0;
        newCustomerIds.add(o.user_id);
      } else {
        returningCustomerRevenueCents += o.total_cents || 0;
        returningCustomerIds.add(o.user_id);
      }
    }
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter((c) => (c.order_count || 0) > 1).length;

    // ---------- Refunds ----------
    const disputedAll = orders.filter((o) => DISPUTED_STATUSES.includes(o.status));
    const refundedAll = orders.filter((o) => REFUNDED_STATUSES.includes(o.status));
    const refundedAmountAllCents = refundedAll.reduce((s, o) => s + (o.total_cents || 0), 0);
    const paidOrRefundedAll = completed.length + refundedAll.length;
    const refundRatePct = paidOrRefundedAll ? round2((refundedAll.length / paidOrRefundedAll) * 100) : 0;

    const refundEventsInPeriod = orders.filter((o) => REFUNDED_STATUSES.includes(o.status) && new Date(o.updated_at).getTime() >= periodStart.getTime());
    const refundedAmountPeriodCents = refundEventsInPeriod.reduce((s, o) => s + (o.total_cents || 0), 0);
    const requestsByStatus: Record<string, number> = {};
    for (const r of refundRequests) requestsByStatus[r.status] = (requestsByStatus[r.status] || 0) + 1;
    const openRequests = refundRequests.filter((r) => r.status === 'requested' || r.status === 'reviewing').length;

    return NextResponse.json({
      generatedAt: now.toISOString(),
      period: {
        days,
        label: `Last ${days} days`,
        startDate: periodStart.toISOString(),
        endDate: now.toISOString(),
      },
      revenue: {
        summary: revenueSummary, // always current — today / 7d / 30d / 90d / all-time, ignores the period selector
        trend, // fixed windows: last 30 days / last 12 weeks / last 12 months, by paid date
        period: {
          revenue: dollars(periodRevenueCents),
          completedOrders: completedInPeriod.length,
          averageOrderValue: round2(periodAov),
        },
      },
      orders: {
        period: {
          started: startedInPeriod.length,
          completed: completedInPeriod.length,
          inFlight: stillPendingInPeriod.length,
          abandoned: expiredInPeriod.length + stalePendingInPeriod.length,
          failed: failedInPeriod.length,
          disputed: disputedInPeriod.length,
          conversionRatePct,
        },
      },
      topProducts: {
        period: { byRevenue, byUnits },
      },
      coupons: {
        period: {
          redemptions: couponBreakdown.reduce((s, c) => s + c.redemptions, 0),
          discountGiven: round2(couponBreakdown.reduce((s, c) => s + c.discountGiven, 0)),
          breakdown: couponBreakdown,
        },
        allTime: {
          leaderboard: couponLeaderboard,
          activeCount: coupons.filter((c) => c.is_active).length,
        },
      },
      customers: {
        period: {
          newCustomers: newCustomerIds.size,
          returningCustomers: returningCustomerIds.size,
          newCustomerRevenue: dollars(newCustomerRevenueCents),
          returningCustomerRevenue: dollars(returningCustomerRevenueCents),
        },
        allTime: {
          totalCustomers,
          repeatCustomers,
          repeatRatePct: totalCustomers ? round2((repeatCustomers / totalCustomers) * 100) : 0,
        },
      },
      refunds: {
        allTime: {
          completedOrders: completed.length,
          refundedOrders: refundedAll.length,
          disputedOrders: disputedAll.length,
          refundedAmount: dollars(refundedAmountAllCents),
          refundRatePct,
        },
        period: {
          refundEventsIssued: refundEventsInPeriod.length,
          refundedAmount: dollars(refundedAmountPeriodCents),
          openRequests,
          requestsByStatus,
        },
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('Admin analytics failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Analytics could not be loaded.' }, { status: 500 });
  }
}
