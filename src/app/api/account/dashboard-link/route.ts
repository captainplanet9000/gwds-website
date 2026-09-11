import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { controlClient, resolveOwnedTenant, TenantOwnershipError } from '@/lib/control-plane';
import { signDashboardTicket } from '@/lib/gateway-ticket';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Mints a one-time link onto the CUSTOMER'S OWN tenant dashboard, served by the reverse-proxy
// gateway in C:/GWDS/hosting/services/gateway (component 5 / "routing"). This route performs the
// one authorization step that gateway cannot do itself: proving, with a service-role read this
// customer's browser could never forge, that the Supabase-authenticated caller owns the tenant
// named in the ticket it is about to sign.
//
// NOT the same surface as /api/hosting/* (see the comment atop
// src/app/api/admin/hosting/tenants/route.ts for why that naming collision already exists once in
// this repo): /api/hosting/* is the self-serve billing product backed by public.hosting_instances,
// a Vercel-project-per-tenant system with its own tenant_key convention
// (`^cival-[a-z0-9-]{8,64}$`). This route resolves a DIFFERENT tenant identity — a row in the
// `control` schema owned by C:/GWDS/hosting, keyed by control.tenants.slug, running as a process on
// the owner's own box. The two systems are not yet linked (see HOSTING-PLAN.md); this route works
// today for any control.tenants row whose owner_email matches the signed-in customer, independent
// of whichever billing product eventually provisions that row.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';

function ticketSecret(): string {
  const secret = process.env.GATEWAY_TICKET_SECRET;
  if (!secret || secret.length < 32) {
    throw new CommerceError('DASHBOARD_LINK_UNAVAILABLE', 'The live dashboard is temporarily unavailable.', 503);
  }
  return secret;
}

function baseDomain(): string {
  const domain = process.env.GATEWAY_BASE_DOMAIN;
  if (!domain) {
    throw new CommerceError('DASHBOARD_LINK_UNAVAILABLE', 'The live dashboard is temporarily unavailable.', 503);
  }
  return domain;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);

    const cp = controlClient();
    // Ownership lookup goes through the shared resolveOwnedTenant() helper (see
    // src/lib/control-plane.ts) instead of re-implementing the query here. That helper is the
    // one place the owner_email match (.eq() against the citext column, never .ilike()) and the
    // "ambiguous match refused, not guessed" rule live -- keeping this route on it means a future
    // fix there (e.g. F1's ILIKE-wildcard fix) can never be silently bypassed by this file having
    // its own, possibly-stale copy of the same lookup.
    const tenant = await resolveOwnedTenant(cp, user.email!);
    if (tenant.status !== 'active') {
      return NextResponse.json(
        { error: `Your workspace is currently ${tenant.status}.`, code: 'TENANT_NOT_ACTIVE' },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const ticket = signDashboardTicket({ slug: tenant.slug, tenantId: tenant.id, email: user.email! }, ticketSecret());
    const url = `https://${tenant.slug}.${baseDomain()}/__auth?ticket=${encodeURIComponent(ticket)}`;
    return NextResponse.json({ url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof TenantOwnershipError) {
      // Same NO_TENANT/AMBIGUOUS_TENANT codes src/app/api/account/instance/route.ts returns for
      // the identical resolveOwnedTenant() failure modes, so callers of either route can share
      // one handling path.
      const status = error.code === 'AMBIGUOUS_TENANT' ? 409 : 404;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
