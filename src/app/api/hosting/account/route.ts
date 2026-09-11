import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { publicHostingConfig } from '@/lib/hosting';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const supabase = createServerClient();
    const { data: subscriptions, error } = await supabase.from('hosting_subscriptions')
      .select('id,plan_id,status,price_cents,currency,stripe_customer_id,cancel_at_period_end,current_period_start,current_period_end,trial_end,last_invoice_status,last_payment_at,created_at,updated_at')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw new CommerceError('HOSTING_ACCOUNT_UNAVAILABLE', 'Your hosting account could not be loaded.', 503);

    const subscriptionIds = (subscriptions || []).map((row) => row.id);
    const [{ data: plans }, { data: onboarding }, { data: instances }, { data: incidents }, { data: usage }, { data: audit }] = await Promise.all([
      supabase.from('hosting_plans').select('id,name,description,price_cents,billing_interval,agent_limit,agent_hours,workspace_limit,seat_limit,support_tier,features,is_active,launch_ready').order('sort_order'),
      subscriptionIds.length ? supabase.from('hosting_onboarding').select('subscription_id,workspace_name,environment,region,exchange,account_address,requested_agents,risk_profile,max_drawdown_pct,max_position_usd,status,customer_notes,submitted_at,reviewed_at,updated_at').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      subscriptionIds.length ? supabase.from('hosting_instances').select('id,subscription_id,plan_id,tenant_key,status,provider,region,deployment_url,release_version,health_status,last_heartbeat_at,backup_status,last_backup_at,last_recovery_test_at,activated_at,suspended_at,updated_at').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      subscriptionIds.length ? supabase.from('hosting_incidents').select('id,instance_id,title,description,severity,status,started_at,resolved_at,updated_at').eq('user_id', user.id).eq('customer_visible', true).order('started_at', { ascending: false }).limit(25) : Promise.resolve({ data: [] }),
      subscriptionIds.length ? supabase.from('hosting_usage_daily').select('subscription_id,usage_date,agent_hours,peak_agents,runtime_events').eq('user_id', user.id).order('usage_date', { ascending: false }).limit(62) : Promise.resolve({ data: [] }),
      subscriptionIds.length ? supabase.from('hosting_audit').select('id,subscription_id,instance_id,actor_type,action,metadata,created_at').eq('user_id', user.id).neq('actor_type', 'admin').order('created_at', { ascending: false }).limit(40) : Promise.resolve({ data: [] }),
    ]);

    return NextResponse.json({
      config: publicHostingConfig(), plans: plans || [], subscriptions: subscriptions || [],
      onboarding: onboarding || [], instances: instances || [], incidents: incidents || [],
      usage: usage || [], audit: audit || [],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
