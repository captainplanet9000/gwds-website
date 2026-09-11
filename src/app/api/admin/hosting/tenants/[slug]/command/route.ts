import { NextRequest, NextResponse } from 'next/server';
import { adminForbidden, adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { createServerClient } from '@/lib/supabase';
import { cappedJsonArgs, controlClient, isTenantCommand, isValidTenantSlug, TENANT_COMMANDS } from '@/lib/control-plane';

export const runtime = 'nodejs';

// Enqueues INTENT into control.tenant_commands. This route never touches a tenant process --
// it cannot; Vercel has no path to a loopback-only port on the owner's workstation. A host-side
// agent polling this table is the only thing that ever performs the action. See
// src/lib/control-plane.ts and db/migrations/0013_tenant_commands.sql.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();

  try {
    const { slug } = await params;
    if (!isValidTenantSlug(slug)) return NextResponse.json({ error: 'Invalid tenant slug' }, { status: 400 });

    if (Number(req.headers.get('content-length') || '0') > 8_192) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;

    if (!isTenantCommand(payload.command)) {
      return NextResponse.json({ error: `command must be one of: ${TENANT_COMMANDS.join(', ')}` }, { status: 400 });
    }
    const command = payload.command;

    let args: Record<string, unknown>;
    try {
      args = cappedJsonArgs(payload.args);
    } catch (shapeError) {
      return NextResponse.json({ error: shapeError instanceof Error ? shapeError.message : 'Invalid args' }, { status: 400 });
    }

    // UNHALT IS THE SINGLE MOST DANGEROUS COMMAND IN THIS QUEUE (see the CLI's deliberate refusal
    // to have one at all, and db/migrations/0013's header). Three independent guards, not one:
    //
    //   1. Role: only 'owner' may request it. 'operator' can start/stop/suspend/resume/halt/
    //      provision/deprovision a tenant, but re-arming a halted trading engine is reserved
    //      further up the chain.
    //   2. Human confirmation: body.confirm must exactly equal the TENANT'S OWN SLUG -- naming
    //      the exact tenant being re-armed, not a generic "yes"/true that could be one reflexive
    //      click away from every other command in this list.
    //   3. Database confirmation: control.tenant_commands' own CHECK constraint additionally
    //      requires args.confirm = 'UNHALT' literally. That value is set HERE, from nothing the
    //      caller supplied, so this route is never the only thing standing between a mis-click
    //      and a live trading engine turning back on.
    if (command === 'unhalt') {
      if (admin.role !== 'owner') return adminForbidden();
      if (typeof payload.confirm !== 'string' || payload.confirm !== slug) {
        return NextResponse.json(
          { error: 'Un-halting requires confirm to exactly equal the tenant slug.' },
          { status: 400 },
        );
      }
      args.confirm = 'UNHALT';
    }

    const cp = controlClient();
    const { data: tenant, error: tenantError } = await cp
      .from('tenants')
      .select('id, slug, hosting_subscription_id')
      .eq('slug', slug)
      .maybeSingle();
    if (tenantError) throw tenantError;
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    // custody-6: 'provision' is the ONLY code path that ever sets a tenant's permanent
    // MAIN_WALLET_ADDRESS -- the address the customer's own /account/funding page then tells them
    // to send real USDC to (see provisionTenant(), C:/GWDS/hosting/services/tenant-runner/
    // src/provision.ts, and the invariant documented in that service's OWNERSHIP.md: "its value
    // must always trace back to the customer's own signed-ownership-proof ... never typed in
    // fresh"). Nothing previously enforced that invariant in code -- an admin (or a phished/
    // compromised admin session) could submit any well-formed 0x... string here and it would be
    // written as gospel, with the customer's funding page rendering it as "send USDC here" and no
    // on-chain way to recover a deposit sent to the wrong address.
    //
    // For a tenant created by the storefront's self-serve signup (hosting_subscription_id set --
    // see 0015_hosting_signup_provisioning.sql), the ONLY value this route will ever provision
    // with is the address the customer themselves proved ownership of via a signed challenge
    // (verify-wallet/route.ts writes it to hosting_onboarding.account_address). Whatever the
    // request body claims is discarded, not merely checked -- an admin typo or a malicious body
    // can influence nothing. Provisioning is refused outright if that customer has not verified an
    // address yet, rather than silently falling back to admin-supplied input.
    if (command === 'provision' && tenant.hosting_subscription_id) {
      const { data: onboarding, error: onboardingError } = await createServerClient()
        .from('hosting_onboarding')
        .select('account_address')
        .eq('subscription_id', tenant.hosting_subscription_id)
        .maybeSingle();
      if (onboardingError) throw onboardingError;

      const verifiedAddress = onboarding?.account_address;
      if (!verifiedAddress || !/^0x[a-fA-F0-9]{40}$/.test(verifiedAddress)) {
        return NextResponse.json(
          {
            error:
              'This tenant is linked to a paid subscription with no customer-verified wallet address yet. ' +
              'The customer must verify wallet ownership on their /account/funding page before provisioning can proceed.',
          },
          { status: 400 },
        );
      }
      args.mainWalletAddress = verifiedAddress;
    }

    const { data: created, error: insertError } = await cp
      .from('tenant_commands')
      .insert({
        tenant_id: tenant.id,
        command,
        args,
        // NEVER from the request body. requested_by is who requireAdmin authenticated, full stop
        // -- the same rule control.set_halt() and every other actor-bearing function in this
        // schema already enforces.
        requested_by: admin.email,
      })
      .select('id, tenant_id, host, command, args, requested_by, requested_at, status')
      .single();
    if (insertError) throw insertError;

    await createServerClient().from('admin_audit').insert({
      action: 'hosting_tenant.command_enqueued',
      resource_type: 'control_tenant_command',
      resource_id: created.id,
      metadata: { tenant_slug: tenant.slug, command, requested_by: admin.email },
    });

    return NextResponse.json({ command: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('Control-plane command enqueue failed', { error: message });
    // A CHECK-constraint rejection (e.g. a malformed unhalt row somehow reaching the insert) means
    // the database refused it on purpose -- that is a 400, not a 500.
    if (message.toLowerCase().includes('check constraint') || message.toLowerCase().includes('violates')) {
      return NextResponse.json(
        { error: "The command was rejected by the control plane's safety constraints." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'The command could not be enqueued.' }, { status: 500 });
  }
}
