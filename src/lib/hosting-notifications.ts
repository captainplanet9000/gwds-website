import { sendHostingEmail, type HostingEmailData } from '@/lib/email';
import { createServerClient } from '@/lib/supabase';

export async function deliverHostingNotification(subscriptionId: string, dedupKey?: string) {
  const supabase = createServerClient();
  let query = supabase.from('hosting_notifications')
    .select('id,template,recipient_email,attempts,payload').eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'failed']).lt('attempts', 5).order('created_at').limit(1);
  if (dedupKey) query = query.eq('dedup_key', dedupKey);
  const { data: notification } = await query.maybeSingle();
  if (!notification) return;
  const { data: claimed } = await supabase.from('hosting_notifications')
    .update({ status: 'sending', attempts: (notification.attempts || 0) + 1, last_error: null })
    .eq('id', notification.id).in('status', ['pending', 'failed']).select('id').maybeSingle();
  if (!claimed) return;
  try {
    const { data: subscription } = await supabase.from('hosting_subscriptions').select('plan_id,status,trial_end').eq('id', subscriptionId).single();
    const { data: plan } = await supabase.from('hosting_plans').select('name,price_cents,currency,billing_interval').eq('id', subscription?.plan_id || '').maybeSingle();
    const trialDetail = subscription?.status === 'trialing' && subscription.trial_end && plan
      ? `Your seven-day Solo trial ends ${new Date(subscription.trial_end).toUTCString()}. Afterward your saved payment method will be charged ${new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency || 'USD' }).format(plan.price_cents / 100)} per ${plan.billing_interval} unless you cancel before the trial ends. Open Account > Hosting > Manage billing to cancel. To create your dashboard, open Account > Hosting and connect and verify the wallet you want to use. No funds are transferred and trading is not enabled by verification. Trading capital is separate.` : undefined;
    const result = await sendHostingEmail(notification.recipient_email, {
      subscriptionId,
      deliveryId: notification.id,
      planName: plan?.name || subscription?.plan_id || 'Managed Hosting',
      template: notification.template as HostingEmailData['template'],
      title: typeof notification.payload?.title === 'string' ? notification.payload.title : notification.template === 'hosting_started' && trialDetail ? 'Your Solo trial has started' : undefined,
      detail: typeof notification.payload?.detail === 'string' ? notification.payload.detail : notification.template === 'hosting_started' ? trialDetail : undefined,
    });
    await supabase.from('hosting_notifications').update({ status: 'sent', provider_message_id: result?.id || null, sent_at: new Date().toISOString(), last_error: null }).eq('id', notification.id);
  } catch (error) {
    await supabase.from('hosting_notifications').update({ status: 'failed', last_error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email failure' }).eq('id', notification.id);
    throw error;
  }
}
