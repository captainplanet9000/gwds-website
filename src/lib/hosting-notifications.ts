import { prepareHostingEmail, sendPreparedHostingEmail, type HostingEmailData } from '@/lib/email';
import { createServerClient } from '@/lib/supabase';

export async function deliverHostingNotification(subscriptionId: string, dedupKey?: string) {
  const supabase = createServerClient();
  let query = supabase.from('hosting_notifications')
    .select('id,template,recipient_email,attempts,payload,prepared_email').eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'failed', 'sending']).eq('requires_review',false).lte('next_attempt_at',new Date().toISOString()).order('created_at').limit(1);
  if (dedupKey) query = query.eq('dedup_key', dedupKey);
  const { data: notification, error: readError } = await query.maybeSingle();
  if (readError) throw new Error('Notification queue unavailable');
  if (!notification) return;
  let lease: string | null=null;
  try {
    let prepared = notification.prepared_email;
    if (!prepared) {
    const { data: subscription, error: subscriptionError } = await supabase.from('hosting_subscriptions').select('plan_id,status,trial_end').eq('id', subscriptionId).single();
    const { data: plan, error: planError } = await supabase.from('hosting_plans').select('name,price_cents,currency,billing_interval').eq('id', subscription?.plan_id || '').maybeSingle();
    if(subscriptionError || planError || !subscription || !plan) throw new Error('Subscription details unavailable for notification');
    const trialDetail = subscription?.status === 'trialing' && subscription.trial_end && plan
      ? `Your seven-day Solo trial ends ${new Date(subscription.trial_end).toUTCString()}. Afterward your saved payment method will be charged ${new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency || 'USD' }).format(plan.price_cents / 100)} per ${plan.billing_interval} unless you cancel before the trial ends. Open Account > Hosting > Manage billing to cancel. To create your dashboard, open Account > Hosting and connect and verify the wallet you want to use. No funds are transferred and trading is not enabled by verification. Trading capital is separate.` : undefined;
    prepared = prepareHostingEmail(notification.recipient_email, {
      subscriptionId,
      deliveryId: notification.id,
      planName: plan?.name || subscription?.plan_id || 'Managed Hosting',
      template: notification.template as HostingEmailData['template'],
      title: typeof notification.payload?.title === 'string' ? notification.payload.title : notification.template === 'hosting_started' && trialDetail ? 'Your Solo trial has started' : undefined,
      detail: typeof notification.payload?.detail === 'string' ? notification.payload.detail : notification.template === 'hosting_started' ? trialDetail : undefined,
    });
    }
    const {data:claimed,error:claimError}=await supabase.rpc('claim_hosting_notification',{p_id:notification.id,p_email:prepared});
    if(claimError)throw new Error('Notification claim failed');
    if(!claimed)return;
    lease=claimed.lease_token;
    const result=await sendPreparedHostingEmail(claimed.prepared_email,notification.id);
    const {error:saveError}=await supabase.rpc('finish_hosting_notification',{p_id:notification.id,p_lease:lease,p_provider_id:result.id,p_error:null});
    if(saveError)throw new Error('Provider accepted email; notification state requires reconciliation');
  } catch(error) {
    if(lease) await supabase.rpc('finish_hosting_notification',{p_id:notification.id,p_lease:lease,p_provider_id:null,p_error:error instanceof Error?error.message.slice(0,500):'Email acknowledgement unavailable'});
    throw error;
  }
}
