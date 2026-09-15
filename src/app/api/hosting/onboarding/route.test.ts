import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from './route';

const SUBSCRIPTION_ID = '11111111-1111-4111-8111-111111111111';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  plan: { price_cents: 4900, agent_limit: 2, included_product_id: null as string | null },
  subscriptionStatus: 'active',
  entitlements: [] as Array<{ product_id: string }>,
  onboardingPatch: null as Record<string, unknown> | null,
  audit: [] as Array<Record<string, unknown>>,
}));

vi.mock('@/lib/commerce', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
}));
vi.mock('@/lib/control-plane', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/control-plane')>(),
  controlClient: () => ({ rpc: mocks.rpc }),
}));
vi.mock('@/lib/supabase', () => ({
  createServerClient: () => ({
    from(table: string) {
      let patch: Record<string, unknown> | null = null;
      const single = async () => {
        if (table === 'hosting_subscriptions') return { data: { id: SUBSCRIPTION_ID, status: mocks.subscriptionStatus, plan_id: 'solo' }, error: null };
        if (table === 'hosting_plans') return { data: mocks.plan, error: null };
        if (table === 'hosting_onboarding') {
          mocks.onboardingPatch = patch;
          return { data: { id: 'onboarding-a', status: patch?.status }, error: null };
        }
        return { data: null, error: null };
      };
      const query = {
        select: () => query, eq: () => query, in: () => query,
        update: (values: Record<string, unknown>) => { patch = values; return query; },
        insert: async (values: Record<string, unknown>) => { mocks.audit.push(values); return { error: null }; },
        maybeSingle: single,
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({
          data: table === 'entitlements' ? mocks.entitlements : [], error: null,
        }).then(resolve),
      };
      return query;
    },
  }),
}));

function request(body: Record<string, unknown>) {
  return new NextRequest('https://example.test/api/hosting/onboarding', {
    method: 'PUT',
    body: JSON.stringify({ subscriptionId: SUBSCRIPTION_ID, workspaceName: 'Alpha desk', maxDrawdownPct: 5, ...body }),
  });
}

describe('onboarding submission', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.rpc.mockResolvedValue({ data: { synced: true, installed: ['darvas-indicator'] }, error: null });
    mocks.plan = { price_cents: 4900, agent_limit: 2, included_product_id: null };
    mocks.subscriptionStatus = 'active';
    mocks.entitlements = [{ product_id: 'darvas-indicator' }];
    mocks.onboardingPatch = null;
    mocks.audit.length = 0;
  });

  it('approves automatically inside the plan cap and entitlements, then syncs the loadout', async () => {
    const response = await PUT(request({ requestedAgents: ['darvas-box'] }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.decision).toEqual({ status: 'approved', reason: null });
    expect(body.loadout).toEqual({ synced: true, installed: ['darvas-indicator'] });
    expect(mocks.onboardingPatch).toMatchObject({ status: 'approved', environment: 'live' });
    expect(mocks.onboardingPatch?.reviewed_at).toEqual(expect.any(String));
    expect(mocks.audit).toContainEqual(expect.objectContaining({ actor_type: 'system', actor_id: 'system:auto-approve', action: 'onboarding_auto_approved' }));
    expect(mocks.rpc).toHaveBeenCalledWith('sync_tenant_loadout_from_onboarding', {
      p_hosting_subscription_id: SUBSCRIPTION_ID,
      p_requested_by: 'system:onboarding-auto-approve',
    });
  });

  it('holds an unmapped agent for operator review with the reason, and installs nothing', async () => {
    const response = await PUT(request({ requestedAgents: ['darvas-box', 'regime-coordinator'] }));
    const body = await response.json();
    expect(body.decision.status).toBe('operator_review');
    expect(body.decision.reason).toMatch(/regime-coordinator/);
    expect(mocks.onboardingPatch).toMatchObject({ status: 'operator_review' });
    expect(mocks.onboardingPatch).not.toHaveProperty('reviewed_at');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('never lets the browser set status or environment', async () => {
    mocks.plan = { price_cents: 0, agent_limit: 1, included_product_id: null };
    mocks.entitlements = [];
    await PUT(request({ requestedAgents: ['darvas-box'], status: 'approved', environment: 'live' }));
    expect(mocks.onboardingPatch).toMatchObject({ status: 'operator_review', environment: 'paper' });
  });

  it('reports a failed loadout sync without failing the save', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const response = await PUT(request({ requestedAgents: ['darvas-box'] }));
    expect(response.status).toBe(200);
    expect((await response.json()).loadout).toMatchObject({ synced: false });
  });
});
