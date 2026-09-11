import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

// "Payment succeeded, provisioning failed" must be visible to an operator without anyone running a
// CLI (see the component brief this route was built for). public.hosting_provision_failures()
// (C:/GWDS/hosting/db/migrations/0015 + 0016 + 0018) already exists and is already polled by the
// storefront's own ops-alert cron (src/app/api/cron/hosting-provision-watch) -- this route is the
// SAME function, read for the admin hosting console instead of for an email, so a human looking at
// the dashboard sees exactly the same set an operator email would have named. It is scoped to
// failures that will NOT resolve themselves: a failure still inside its automatic retry window
// (see control.retry_failed_hosting_provisions()) is deliberately excluded there, not here -- this
// route has no opinion of its own about what counts as an alert.
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const { data, error } = await createServerClient().rpc('hosting_provision_failures');
    if (error) throw error;
    const alerts = Array.isArray(data) ? data : [];
    return NextResponse.json({ alerts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Provisioning alert list failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Provisioning alerts could not be loaded.' }, { status: 503 });
  }
}
