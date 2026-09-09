import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { HOSTING_AGENT_IDS, normalizeHostingText, planExecutionMode } from '@/lib/hosting';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest) {
  try {
    if (Number(req.headers.get('content-length') || '0') > 16_384) throw new CommerceError('REQUEST_TOO_LARGE', 'The request is too large.', 413);
    const user = await requireVerifiedUser(req);
    const body = await req.json() as Record<string, unknown>;
    const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId : '';
    if (!/^[0-9a-f-]{36}$/i.test(subscriptionId)) throw new CommerceError('INVALID_SUBSCRIPTION', 'Choose a valid subscription.');

    const workspaceName = normalizeHostingText(body.workspaceName, 80, true);
    const region = typeof body.region === 'string' && ['iad1', 'sfo1', 'fra1', 'sin1'].includes(body.region) ? body.region : 'iad1';
    const riskProfile = typeof body.riskProfile === 'string' && ['conservative', 'balanced', 'custom'].includes(body.riskProfile) ? body.riskProfile : 'conservative';
    const requestedAgents = Array.isArray(body.requestedAgents)
      ? [...new Set(body.requestedAgents.filter((item): item is string => typeof item === 'string' && (HOSTING_AGENT_IDS as readonly string[]).includes(item)))].slice(0, HOSTING_AGENT_IDS.length)
      : [];
    if (!requestedAgents.length) throw new CommerceError('AGENT_REQUIRED', 'Choose at least one agent.');
    const drawdown = typeof body.maxDrawdownPct === 'number' ? body.maxDrawdownPct : null;
    const position = typeof body.maxPositionUsd === 'number' ? body.maxPositionUsd : null;
    if (drawdown !== null && (!Number.isFinite(drawdown) || drawdown <= 0 || drawdown > 100)) throw new CommerceError('INVALID_RISK_LIMIT', 'Maximum drawdown must be between 0 and 100%.');
    if (position !== null && (!Number.isFinite(position) || position <= 0 || position > 100_000_000)) throw new CommerceError('INVALID_RISK_LIMIT', 'Maximum position must be a positive amount.');

    const supabase = createServerClient();
    const { data: subscription, error: subscriptionError } = await supabase.from('hosting_subscriptions').select('id,status,plan_id').eq('id', subscriptionId).eq('user_id', user.id).maybeSingle();
    if (subscriptionError) throw new CommerceError('SUBSCRIPTION_UNAVAILABLE', 'Your subscription could not be checked. Please retry.', 503);
    if (!subscription || !['trialing', 'active', 'past_due', 'paused'].includes(subscription.status)) {
      throw new CommerceError('SUBSCRIPTION_NOT_ACTIVE', 'An active hosting subscription is required.', 409);
    }

    // `environment` was hardcoded to 'paper' here. That predated the tier redesign: Solo, Desk and
    // Fund now run LIVE agents against the customer's own Hyperliquid account, and only the free
    // Paper plan is simulated. Provisioning a paying customer's workspace as 'paper' records the
    // wrong thing about what they bought, in the column an operator reads before activating them.
    //
    // Derived from PRICE via planExecutionMode(), not from the plan's name or id — the same rule
    // /hosted renders by. A plan renamed away from "Paper" cannot accidentally arm live execution,
    // and a plan renamed TO "Paper" cannot silently disarm a paid one; only changing its price can
    // move it, which is the decision that should move it.
    //
    // Fails CLOSED. An unreadable plan row, a null price, or a subscription with no plan_id all
    // yield 'paper' — the safe value — rather than defaulting a workspace to live execution on
    // incomplete information.
    const { data: plan } = subscription.plan_id
      ? await supabase.from('hosting_plans').select('price_cents').eq('id', subscription.plan_id).maybeSingle()
      : { data: null };
    const priceCents = typeof plan?.price_cents === 'number' ? plan.price_cents : 0;
    const environment = planExecutionMode(priceCents) === 'live' ? 'live' : 'paper';
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('hosting_onboarding').update({
      // Wallet designation belongs to the signature-verification flow. Editing
      // workspace settings must not erase the proof needed by provisioning.
      workspace_name: workspaceName, environment, region,
      requested_agents: requestedAgents, risk_profile: riskProfile,
      max_drawdown_pct: drawdown, max_position_usd: position,
      customer_notes: normalizeHostingText(body.customerNotes, 2000),
      status: 'operator_review', submitted_at: now, updated_at: now,
    }).eq('subscription_id', subscriptionId).eq('user_id', user.id).select('id,status,submitted_at').maybeSingle();
    if (error || !data) throw new CommerceError('ONBOARDING_UPDATE_FAILED', 'Onboarding could not be submitted.', 503);
    await supabase.from('hosting_audit').insert({ user_id: user.id, subscription_id: subscriptionId, actor_type: 'customer', actor_id: user.id, action: 'onboarding_submitted' });
    return NextResponse.json({ onboarding: data });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
