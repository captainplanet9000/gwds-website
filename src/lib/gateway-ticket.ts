/**
 * SIGNED DASHBOARD TICKET — storefront side.
 *
 * THIS FILE IS A DELIBERATE DUPLICATE of C:/GWDS/hosting/services/gateway/src/ticket.ts's
 * signTicket()/TicketPayload. It cannot be a shared import: this repo deploys to Vercel and the
 * gateway repo runs on the owner's own Windows box, and they are never the same build.
 *
 * That is the same call 0007_tenant_port_reachability.sql makes for FORBIDDEN_TENANT_ENV_KEYS —
 * "the TypeScript list protects the runner, this list protects the database from anything that is
 * not the runner" — restated across a deploy boundary instead of a schema one. If you change the
 * wire format (field names, TTL, the HMAC construction), change BOTH files and bump
 * `TICKET_VERSION` so a ticket minted by an old build of one side fails verification on a new
 * build of the other, instead of being silently misread.
 *
 * WHAT THIS BUYS: a customer's browser, sent from HERE (Vercel, already holding a verified
 * Supabase session) to a hostname the reverse-proxy gateway serves, carries proof — good for 60
 * seconds, usable exactly once — that a service-role-backed lookup on THIS side already confirmed
 * they own the tenant named in the ticket. The gateway never trusts a Supabase JWT directly; it
 * only ever trusts this ticket, signed with a secret this file and the gateway share and nothing
 * else does.
 */

import { createHmac, randomBytes } from 'node:crypto';

export const TICKET_VERSION = 1;
export const TICKET_TTL_SECONDS = 60;

export interface TicketInput {
  slug: string;
  tenantId: string;
  email: string;
}

function encode(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function sign(payloadB64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

/** Mints a one-time, 60-second dashboard-access ticket for `input.slug`. */
export function signDashboardTicket(input: TicketInput, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: TICKET_VERSION,
    typ: 'dash-ticket' as const,
    slug: input.slug,
    tenantId: input.tenantId,
    email: input.email.toLowerCase(),
    iat: now,
    exp: now + TICKET_TTL_SECONDS,
    nonce: randomBytes(16).toString('base64url'),
  };
  const payloadB64 = encode(payload);
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}
