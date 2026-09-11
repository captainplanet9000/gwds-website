import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { controlClient } from '@/lib/control-plane';

export const runtime = 'nodejs';

// Fleet-wide command history: every row ever written to control.tenant_commands, newest first,
// with an outcome. Lives as a static /commands segment alongside the dynamic /[slug] route --
// Next.js resolves the static segment first, so this never gets swallowed by [slug].
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const url = new URL(req.url);
    const rawLimit = Number(url.searchParams.get('limit') || '100');
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, Math.round(rawLimit))) : 100;

    const rawStatus = url.searchParams.get('status');
    const statusFilter = rawStatus && ['queued', 'claimed', 'done', 'failed'].includes(rawStatus) ? rawStatus : null;

    const cp = controlClient();
    let query = cp
      .from('tenant_commands')
      .select('id, tenant_id, host, command, args, requested_by, requested_at, status, claimed_at, claimed_by, finished_at, result, error, tenants:tenant_id(slug, display_name)')
      .order('requested_at', { ascending: false })
      .limit(limit);
    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (error) throw error;

    const commands = (data || []).map((row: any) => {
      const tenant = Array.isArray(row.tenants) ? row.tenants[0] : row.tenants;
      return {
        id: row.id,
        tenantId: row.tenant_id,
        tenantSlug: tenant?.slug ?? null,
        tenantDisplayName: tenant?.display_name ?? null,
        host: row.host,
        command: row.command,
        args: row.args,
        requestedBy: row.requested_by,
        requestedAt: row.requested_at,
        status: row.status,
        claimedAt: row.claimed_at,
        claimedBy: row.claimed_by,
        finishedAt: row.finished_at,
        result: row.result,
        error: row.error,
      };
    });

    return NextResponse.json({ commands }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Control-plane command history failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Command history could not be loaded.' }, { status: 503 });
  }
}
