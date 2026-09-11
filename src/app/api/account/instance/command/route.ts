import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { cappedJsonArgs, controlClient, resolveOwnedTenant, TenantOwnershipError } from '@/lib/control-plane';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Enqueues INTENT into control.tenant_commands for the CALLER'S OWN tenant, and only that tenant
// -- ownership is re-resolved from the authenticated session on every request via
// resolveOwnedTenant(), never taken from anything the client sends. Like every other route that
// writes into this queue, this route never touches a tenant process directly: Vercel has no path
// to a loopback-only port on the owner's box, so a host-side agent polling control.tenant_commands
// is the only thing that ever performs the action. See src/lib/control-plane.ts's header comment
// and db/migrations/0013_tenant_commands.sql.
//
// SCOPE IS DELIBERATELY NARROWER THAN THE ADMIN COMMAND ROUTE
// (src/app/api/admin/hosting/tenants/[slug]/command/route.ts): a customer may halt or resume
// (un-halt) THEIR OWN trading and nothing else. start/stop/suspend/provision/deprovision stay
// operator-only lifecycle actions -- a customer's own click has no path to them, by not being
// accepted here at all, not by a role check that could be gotten wrong.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';

const CUSTOMER_COMMANDS = ['halt', 'unhalt'] as const;
type CustomerCommand = (typeof CUSTOMER_COMMANDS)[number];

function isCustomerCommand(value: unknown): value is CustomerCommand {
  return typeof value === 'string' && (CUSTOMER_COMMANDS as readonly string[]).includes(value);
}

function requireReason(value: unknown): string {
  if (typeof value !== 'string') {
    throw new CommerceError('REASON_REQUIRED', 'A short reason is required.', 400);
  }
  const reason = value.trim().slice(0, 500);
  if (!reason) throw new CommerceError('REASON_REQUIRED', 'A short reason is required.', 400);
  return reason;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);

    if (Number(req.headers.get('content-length') || '0') > 4_096) {
      throw new CommerceError('REQUEST_TOO_LARGE', 'Request too large.', 413);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new CommerceError('INVALID_JSON', 'Invalid JSON body.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new CommerceError('INVALID_BODY', 'Request body must be an object.', 400);
    }
    const payload = body as Record<string, unknown>;

    if (!isCustomerCommand(payload.command)) {
      throw new CommerceError('INVALID_COMMAND', `command must be one of: ${CUSTOMER_COMMANDS.join(', ')}`, 400);
    }
    const command = payload.command;
    const reason = requireReason(payload.reason);

    const cp = controlClient();
    const tenant = await resolveOwnedTenant(cp, user.email!);
    if (tenant.status === 'archived') {
      throw new CommerceError('TENANT_ARCHIVED', 'This workspace has been retired.', 409);
    }

    // UN-HALTING IS ONLY OFFERED ON AN ACTIVE WORKSPACE — the same gate
    // src/app/api/account/dashboard-link/route.ts already applies, for a reason that is specific
    // to this direction of the switch.
    //
    // 'suspended'/'paused' is an OPERATOR'S decision, and suspendTenant()
    // (C:/GWDS/hosting/services/tenant-runner/src/lifecycle.ts) implements it as three things at
    // once: halt, disable the schedule, stop the process. Its counterpart resumeTenant() is
    // documented as restoring those "in reverse, MINUS the halt" and reports `still_halted` back
    // to the operator, precisely so that bringing a workspace back up is never the same act as
    // re-arming its trading.
    //
    // Without this check a customer could clear that halt WHILE suspended. Nothing trades at that
    // moment (control.due_tenants() only schedules status='active' tenants), so it looks harmless
    // — but it silently disarms one leg of the operator's suspension, and the next 'resume' then
    // starts live trading on the following cycle instead of waiting for a deliberate unhalt. The
    // halt a customer may clear is their own; the halt that is part of a suspension is not.
    //
    // 'halt' stays available in every non-archived state on purpose: stopping new trades is the
    // fail-closed direction, and a customer must never be unable to reach for it.
    if (command === 'unhalt' && tenant.status !== 'active') {
      throw new CommerceError(
        'TENANT_NOT_ACTIVE',
        `Your workspace is currently ${tenant.status}, so trading cannot be resumed from here. Contact support.`,
        409,
      );
    }

    const args = cappedJsonArgs({ reason });

    // BOTH DIRECTIONS OF THIS SWITCH ARE MONEY-AFFECTING, SO BOTH REQUIRE TYPED CONFIRMATION.
    // Un-halting starts real trading -- the same rule the platform holds admins to
    // (src/app/api/admin/hosting/tenants/[slug]/command/route.ts), applied to the customer whose
    // own money is at stake. Halting stops a live engine outright, which is just as serious in the
    // other direction: with resolveOwnedTenant() as the only gate standing between a request and a
    // tenant, requiring the caller to type the EXACT tenant slug back means an identity-resolution
    // mistake alone (a bug, not merely a stolen session) is not enough to touch a stranger's
    // trading -- the caller also has to already know the specific workspace name, which is not
    // handed out anywhere an attacker can reach without first being that tenant's own customer.
    // Guards, none of them a checkbox:
    //   1. Typed confirmation: `confirm` must exactly equal the tenant's OWN slug, naming the
    //      exact workspace being acted on rather than a generic yes/true.
    //   2. args.confirm = 'UNHALT' is set HERE, from nothing the caller supplied, for 'unhalt'.
    //   3. control.tenant_commands' own CHECK constraint (0013) refuses any 'unhalt' row that
    //      does not carry that literal value, independent of this route ever existing.
    if (typeof payload.confirm !== 'string' || payload.confirm !== tenant.slug) {
      throw new CommerceError(
        'CONFIRMATION_REQUIRED',
        command === 'unhalt'
          ? 'Resuming trading requires typing your workspace name to confirm.'
          : 'Halting trading requires typing your workspace name to confirm.',
        400,
      );
    }
    if (command === 'unhalt') {
      args.confirm = 'UNHALT';
    }

    const { data: created, error: insertError } = await cp
      .from('tenant_commands')
      .insert({
        tenant_id: tenant.id,
        command,
        args,
        // NEVER from the request body -- who asked is whoever requireVerifiedUser authenticated.
        requested_by: user.email,
      })
      .select('id, command, status, requested_at')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ command: created }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof TenantOwnershipError) {
      const status = error.code === 'AMBIGUOUS_TENANT' ? 409 : 404;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const message = error instanceof Error ? error.message : 'unknown';
    if (!(error instanceof CommerceError)) {
      console.error('Customer instance command failed', { error: message });
    }
    if (message.toLowerCase().includes('violates') || message.toLowerCase().includes('check constraint')) {
      return NextResponse.json(
        { error: "That command was rejected by the control plane's safety constraints." },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
