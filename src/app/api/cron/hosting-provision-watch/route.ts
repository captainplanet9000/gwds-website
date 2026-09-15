import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createServerClient } from '@/lib/supabase';
import { deliverHostingNotification, drainHostingNotifications } from '@/lib/hosting-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const configured = process.env.CRON_SECRET;
  const supplied = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!configured || !supplied) return false;
  const left = Buffer.from(configured);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

interface ProvisionFailure {
  hosting_subscription_id: string;
  tenant_id: string;
  slug: string;
  command_id: string;
  error: string | null;
  finished_at: string | null;
}

// "Payment succeeded but provisioning failed" must alert someone and must be resumable — never a
// silently swallowed state (see the component brief). This polls
// public.hosting_provision_failures() — every paid-signup tenant whose real control-plane
// 'provision' command (control.tenant_commands) has failed — and queues exactly one operator email
// per failed command, deduplicated by command id so a retried cron tick never re-alerts on the same
// failure. It does not retry the provisioning itself: a failed provision is an operator action
// (control-plane admin panel re-enqueues it once someone has read WHY it failed), by the same
// design as admin_fleet_enqueue_command — see C:/GWDS/hosting/db/migrations/0016_hosting_provision_failures.sql.
//
// It then drains the notification outbox across every subscription, so a customer email whose
// inline delivery failed (or that was queued by the database, with no request to send it) still
// goes out. The drain runs even when the failure check could not.
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('hosting_provision_failures');

  const failures = (error ? [] : data || []) as ProvisionFailure[];
  const opsEmail = (process.env.HOSTING_OPS_ALERT_EMAIL || process.env.SUPPORT_EMAIL || '').trim();

  let alerted = 0;
  if (opsEmail) {
    for (const failure of failures) {
      const { error: insertError } = await supabase.from('hosting_notifications').insert({
        subscription_id: failure.hosting_subscription_id,
        template: 'hosting_provisioning_failed',
        recipient_email: opsEmail,
        dedup_key: `hosting-provision-failed-${failure.command_id}`,
        payload: {
          title: `Provisioning failed for ${failure.slug}`,
          detail: `Tenant ${failure.slug} (${failure.tenant_id}) provisioning failed: ${failure.error || 'no error recorded'}. Subscription ${failure.hosting_subscription_id} was charged. Re-enqueue provisioning from the fleet admin panel once the cause is fixed.`,
        },
      }).select('id').maybeSingle();
      // A unique-violation on dedup_key means this failure was already queued by an earlier tick —
      // that is success, not an error, so it is not counted or surfaced.
      if (!insertError) alerted += 1;
      await deliverHostingNotification(failure.hosting_subscription_id).catch(() => {});
    }
  }

  const drained = await drainHostingNotifications(25).catch(() => null);
  const result = { checked: failures.length, alerted, drained };
  const headers = { 'Cache-Control': 'no-store' };
  if (error) return NextResponse.json({ ...result, error: 'PROVISION_FAILURES_UNAVAILABLE' }, { status: 503, headers });
  if (failures.length && !opsEmail) return NextResponse.json({ ...result, error: 'NO_ALERT_RECIPIENT_CONFIGURED' }, { status: 503, headers });
  return NextResponse.json(result, { headers });
}
