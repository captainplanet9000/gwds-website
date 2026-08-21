import { sendHostingEmail, type HostingEmailData } from '@/lib/email';
import { createServerClient } from '@/lib/supabase';

export async function deliverHostingNotification(subscriptionId: string) {
  const supabase = createServerClient();
  const { data: notification } = await supabase.from('hosting_notifications')
    .select('id,template,recipient_email,attempts,payload').eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'failed']).lt('attempts', 5).order('created_at').limit(1).maybeSingle();
  if (!notification) return;
  const { data: claimed } = await supabase.from('hosting_notifications')
    .update({ status: 'sending', attempts: (notification.attempts || 0) + 1, last_error: null })
    .eq('id', notification.id).in('status', ['pending', 'failed']).select('id').maybeSingle();
  if (!claimed) return;
  try {
    const { data: subscription } = await supabase.from('hosting_subscriptions').select('plan_id').eq('id', subscriptionId).single();
    const { data: plan } = await supabase.from('hosting_plans').select('name').eq('id', subscription?.plan_id || '').maybeSingle();
    const result = await sendHostingEmail(notification.recipient_email, {
      subscriptionId,
      planName: plan?.name || subscription?.plan_id || 'Managed Hosting',
      template: notification.template as HostingEmailData['template'],
      title: typeof notification.payload?.title === 'string' ? notification.payload.title : undefined,
      detail: typeof notification.payload?.detail === 'string' ? notification.payload.detail : undefined,
    });
    await supabase.from('hosting_notifications').update({ status: 'sent', provider_message_id: result?.id || null, sent_at: new Date().toISOString(), last_error: null }).eq('id', notification.id);
  } catch (error) {
    await supabase.from('hosting_notifications').update({ status: 'failed', last_error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email failure' }).eq('id', notification.id);
    throw error;
  }
}
