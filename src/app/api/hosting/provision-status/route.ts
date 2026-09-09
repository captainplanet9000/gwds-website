import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

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
    return NextResponse.json({
      tenant: result?.tenant || null,
      command: result?.command || null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
