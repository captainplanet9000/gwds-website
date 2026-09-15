import { sendHostingEmail, type HostingEmailData } from '@/lib/email';
import { createServerClient } from '@/lib/supabase';

// The public.hosting_notifications outbox. A row is claimed (pending/failed -> sending) before it is
// sent, so two callers racing over the same row send it once; a send that throws marks it 'failed'
// and it is retried by the next caller until MAX_ATTEMPTS.

const MAX_ATTEMPTS = 5;
const COLUMNS = 'id,subscription_id,template,recipient_email,attempts,payload';

interface NotificationRow {
  id: string;
  subscription_id: string;
  template: string;
  recipient_email: string;
  attempts: number | null;
  payload: Record<string, unknown> | null;
}

type Client = ReturnType<typeof createServerClient>;

async function planNameFor(supabase: Client, subscriptionId: string, cache: Map<string, string>) {
  const cached = cache.get(subscriptionId);
  if (cached) return cached;
  const { data: subscription } = await supabase.from('hosting_subscriptions').select('plan_id').eq('id', subscriptionId).single();
  const { data: plan } = await supabase.from('hosting_plans').select('name').eq('id', subscription?.plan_id || '').maybeSingle();
  const name = plan?.name || subscription?.plan_id || 'Managed Hosting';
  cache.set(subscriptionId, name);
  return name;
}

/** Sends one row. Returns false when another caller claimed it first; throws when the send fails. */
async function deliverOne(supabase: Client, notification: NotificationRow, planNames: Map<string, string>): Promise<boolean> {
  const { data: claimed } = await supabase.from('hosting_notifications')
    .update({ status: 'sending', attempts: (notification.attempts || 0) + 1, last_error: null })
    .eq('id', notification.id).in('status', ['pending', 'failed']).select('id').maybeSingle();
  if (!claimed) return false;
  try {
    const result = await sendHostingEmail(notification.recipient_email, {
      notificationId: notification.id,
      subscriptionId: notification.subscription_id,
      planName: await planNameFor(supabase, notification.subscription_id, planNames),
      template: notification.template as HostingEmailData['template'],
      title: typeof notification.payload?.title === 'string' ? notification.payload.title : undefined,
      detail: typeof notification.payload?.detail === 'string' ? notification.payload.detail : undefined,
    });
    await supabase.from('hosting_notifications').update({ status: 'sent', provider_message_id: result?.id || null, sent_at: new Date().toISOString(), last_error: null }).eq('id', notification.id);
    return true;
  } catch (error) {
    await supabase.from('hosting_notifications').update({ status: 'failed', last_error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email failure' }).eq('id', notification.id);
    throw error;
  }
}

async function deliverRows(supabase: Client, rows: NotificationRow[]) {
  const planNames = new Map<string, string>();
  let sent = 0;
  let failed = 0;
  let firstError: unknown = null;
  // One failed message does not hold back the rest; each row is attempted once per call.
  for (const row of rows) {
    try {
      if (await deliverOne(supabase, row, planNames)) sent += 1;
    } catch (error) {
      failed += 1;
      firstError ??= error;
    }
  }
  return { checked: rows.length, sent, failed, firstError };
}

/**
 * Delivers every pending or retryable notification for one subscription, oldest first, at most
 * `maxMessages` per call. Throws the first send failure after attempting the rest, so a caller that
 * relies on a failure being visible (the Stripe webhook's retry) still sees it.
 */
export async function deliverHostingNotification(subscriptionId: string, maxMessages = 10) {
  const supabase = createServerClient();
  const { data } = await supabase.from('hosting_notifications')
    .select(COLUMNS).eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'failed']).lt('attempts', MAX_ATTEMPTS).order('created_at').limit(maxMessages);
  const { firstError, ...counts } = await deliverRows(supabase, (data || []) as NotificationRow[]);
  if (firstError) throw firstError;
  return counts;
}

/**
 * Drains the outbox across all subscriptions for the daily cron. Never throws on a send failure:
 * it reports counts, and the failed rows stay retryable for the next caller.
 */
export async function drainHostingNotifications(limit = 25) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('hosting_notifications')
    .select(COLUMNS).in('status', ['pending', 'failed']).lt('attempts', MAX_ATTEMPTS)
    .order('created_at').limit(limit);
  if (error) throw new Error('HOSTING_NOTIFICATIONS_UNAVAILABLE');
  const { checked, sent, failed } = await deliverRows(supabase, (data || []) as NotificationRow[]);
  return { checked, sent, failed };
}
