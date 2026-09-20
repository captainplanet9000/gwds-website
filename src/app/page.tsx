import HomeContent from './home-content';
import { createServerClient } from '@/lib/supabase';
import { hostingSalesEnabled, SOLO_TRIAL_DAYS } from '@/lib/hosting';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data, error } = await createServerClient()
    .from('hosting_plans')
    .select('id,name,price_cents,currency,billing_interval,agent_limit,launch_ready')
    .eq('is_active', true)
    .gt('price_cents', 0)
    .order('sort_order');

  return <HomeContent hostingPlans={error ? [] : data || []} hostingSales={hostingSalesEnabled()} trialDays={SOLO_TRIAL_DAYS} />;
}
