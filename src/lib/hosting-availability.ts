import { hostingSalesEnabled } from '@/lib/hosting';
import { createServerClient } from '@/lib/supabase';

const RESERVED_STATUSES = ['pending_checkout', 'incomplete', 'trialing', 'active', 'past_due', 'unpaid', 'paused'];

/** Advisory customer-facing availability. The database admission trigger remains authoritative. */
export async function getHostingAvailability() {
  if (!hostingSalesEnabled()) return { available: false, reason: 'paused' as const };
  const supabase = createServerClient();
  const [capacity, reservations, hosts] = await Promise.all([
    supabase.from('hosting_capacity').select('max_subscriptions').eq('id', true).single(),
    supabase.from('hosting_subscriptions').select('id', { count: 'exact', head: true }).in('status', RESERVED_STATUSES),
    supabase.rpc('hosting_host_capacity'),
  ]);
  if (capacity.error || reservations.error || hosts.error || !capacity.data || !hosts.data) {
    console.error('Hosting availability could not be checked', {
      capacity: capacity.error?.code, reservations: reservations.error?.code, hosts: hosts.error?.code,
    });
    return { available: false, reason: 'unavailable' as const };
  }
  const subscriptionRoom = capacity.data.max_subscriptions > (reservations.count ?? 0);
  const hostRoom = (hosts.data as Array<{ admissions_enabled: boolean; available_slots: number }>).some(
    (host) => host.admissions_enabled && Number(host.available_slots) > 0,
  );
  return { available: subscriptionRoom && hostRoom, reason: subscriptionRoom && hostRoom ? 'open' as const : 'full' as const };
}
