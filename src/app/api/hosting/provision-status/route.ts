import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { controlClient } from '@/lib/control-plane';
import { deliverHostingNotification } from '@/lib/hosting-notifications';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

// public.hosting_provision_status is gaining error_code in a concurrent migration. Until that lands
// on every database, the code is read from the latest provision command directly. Only a failed
// command carries a code worth the extra round trip, and a failed lookup reports "unknown" (null)
// rather than failing the status the customer is waiting on.
async function provisionErrorCode(
  command: Record<string, unknown>,
  tenant: Record<string, unknown> | null,
): Promise<string | null> {
  if ('errorCode' in command) return typeof command.errorCode === 'string' ? command.errorCode : null;
  if ('error_code' in command) return typeof command.error_code === 'string' ? command.error_code : null;
  if (command.status !== 'failed' || typeof tenant?.id !== 'string') return null;
  try {
    const { data } = await controlClient().from('tenant_commands').select('error_code')
      .eq('tenant_id', tenant.id).eq('command', 'provision')
      .order('requested_at', { ascending: false }).limit(1).maybeSingle();
    return typeof data?.error_code === 'string' ? data.error_code : null;
  } catch {
    return null;
  }
}

// Real provisioning progress for the customer onboarding page — never a spinner. Reads
// control.tenant_commands (the actual queue the host agent claims and performs work from) through
// public.hosting_provision_status(), a SECURITY DEFINER function that checks ownership itself
// (see C:/GWDS/hosting/db/migrations/0015_hosting_signup_provisioning.sql). The subscription id
// comes from the query string but ownership is re-verified server-side by that function against
// the authenticated user's own id — a customer cannot read another customer's tenant by guessing
// a subscription id.
export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const subscriptionId = req.nextUrl.searchParams.get('subscriptionId') || '';
    if (!/^[0-9a-f-]{36}$/i.test(subscriptionId)) {
      throw new CommerceError('INVALID_SUBSCRIPTION', 'Choose a valid subscription.');
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('hosting_provision_status', {
      p_hosting_subscription_id: subscriptionId,
      p_user_id: user.id,
    });
    if (error) throw new CommerceError('PROVISION_STATUS_UNAVAILABLE', 'Provisioning status is temporarily unavailable.', 503);

    // NULL means either the subscription does not belong to this user, or the RPC itself has not
    // been deployed yet — either way this is "nothing to report", not an error the customer needs
    // to see. tenant === null (row exists, no tenant yet) is the honest "not started" state; a
    // command with status 'failed' is surfaced as-is, including the error text, rather than folded
    // into a generic failure message.
    const result = (data || null) as { tenant: Record<string, unknown> | null; command: Record<string, unknown> | null } | null;
    const tenant = result?.tenant || null;
    const command = result?.command
      ? { ...result.command, errorCode: await provisionErrorCode(result.command, tenant) }
      : null;

    // The page polls this route while setup runs, which makes it a cheap, frequent chance to send
    // any queued email for this subscription (a wallet reminder, "workspace ready"). Only after the
    // RPC above proved ownership, bounded to a few messages, and never able to fail the response.
    if (result) await deliverHostingNotification(subscriptionId, 3).catch(() => {});

    return NextResponse.json({ tenant, command }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
