import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const url = new URL(req.url);

    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const action = url.searchParams.get('action') || '';
    const entity = url.searchParams.get('entity') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const offset = (page - 1) * limit;

    // Fetch audit logs with filtering and pagination
    let auditQuery = sb.from('admin_audit').select('*', { count: 'exact' });

    if (action) {
      auditQuery = auditQuery.eq('action', action);
    }
    if (entity) {
      // admin_audit's real column is resource_type (see src/migrations/005_secure_commerce.sql)
      auditQuery = auditQuery.eq('resource_type', entity);
    }
    if (startDate) {
      auditQuery = auditQuery.gte('created_at', startDate);
    }
    if (endDate) {
      auditQuery = auditQuery.lte('created_at', endDate);
    }

    const { data: auditLogs, error: auditError, count: auditCount } = await auditQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (auditError) throw auditError;

    // Fetch recent stripe events (last 20)
    const { data: stripeEvents, error: stripeError } = await sb
      .from('stripe_events')
      .select('id, type, processed, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (stripeError) throw stripeError;

    // Fetch email outbox status (last 50)
    const { data: emailOutbox, error: emailError } = await sb
      .from('email_outbox')
      .select('id, to_email, subject, status, sent_at, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (emailError) throw emailError;

    // admin_audit's real columns are resource_type/resource_id/metadata; map to the
    // entity/entity_id/meta shape this page's UI already reads (src/app/admin/audit/page.tsx).
    const mappedLogs = (auditLogs || []).map((log: any) => ({
      ...log,
      entity: log.resource_type ?? null,
      entity_id: log.resource_id ?? null,
      meta: log.metadata ?? null,
    }));

    return NextResponse.json({
      auditLogs: mappedLogs,
      auditCount: auditCount || 0,
      stripeEvents: stripeEvents || [],
      emailOutbox: emailOutbox || [],
      pagination: {
        page,
        limit,
        total: auditCount || 0,
        totalPages: Math.ceil((auditCount || 0) / limit)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
