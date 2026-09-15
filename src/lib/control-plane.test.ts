import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeDb } from '@/app/api/account/funding/_test/fake-db';
import { controlClient, resolveOwnedTenant, resolveTenantNetwork, TenantOwnershipError } from './control-plane';

const mocks = vi.hoisted(() => ({ db: null as unknown as ReturnType<typeof fakeDb> }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => mocks.db.client }));

const email = 'a@example.test';
const tenant = (id: string, status: string, sub: string | null) =>
  ({ id, slug: id, status, owner_email: email, hosting_subscription_id: sub });

async function ownershipCode(promise: Promise<unknown>) {
  const err = await promise.catch(e => e);
  expect(err).toBeInstanceOf(TenantOwnershipError);
  return (err as TenantOwnershipError).code;
}

describe('resolveTenantNetwork', () => {
  beforeEach(() => {
    mocks.db = fakeDb({ tenant_env: [], env_key_policy: [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }] });
  });

  it('uses the fleet default when the tenant has no override', async () => {
    expect(await resolveTenantNetwork(controlClient(), 't1')).toBe('testnet');
  });

  it('lets the tenant override win over the fleet default', async () => {
    mocks.db = fakeDb({
      tenant_env: [{ tenant_id: 't1', key: 'HYPERLIQUID_NETWORK', value: 'mainnet' }],
      env_key_policy: [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }],
    });
    expect(await resolveTenantNetwork(controlClient(), 't1')).toBe('mainnet');
    expect(await resolveTenantNetwork(controlClient(), 't2')).toBe('testnet');
  });

  it.each([
    ['no policy row', { tenant_env: [], env_key_policy: [] }],
    ['a value the dashboard would refuse', { tenant_env: [], env_key_policy: [{ key: 'HYPERLIQUID_NETWORK', default_value: 'Mainnet' }] }],
  ])('refuses to guess with %s', async (_label, tables) => {
    mocks.db = fakeDb(tables);
    await expect(resolveTenantNetwork(controlClient(), 't1')).rejects.toMatchObject({ code: 'NETWORK_UNKNOWN', status: 409 });
  });

  it('reports a database failure as unavailable, not as an unknown network', async () => {
    mocks.db.failing.add('env_key_policy');
    await expect(resolveTenantNetwork(controlClient(), 't1')).rejects.toMatchObject({ code: 'NETWORK_LOOKUP_FAILED', status: 503 });
  });
});

describe('resolveOwnedTenant', () => {
  it('still refuses two email matches when no user id is given', async () => {
    mocks.db = fakeDb({ tenants: [tenant('old', 'suspended', 'sub-old'), tenant('new', 'active', 'sub-new')] });
    expect(await ownershipCode(resolveOwnedTenant(controlClient(), email))).toBe('AMBIGUOUS_TENANT');
  });

  it("prefers the tenant on the customer's open subscription over an old suspended one", async () => {
    mocks.db = fakeDb({
      tenants: [tenant('old', 'suspended', 'sub-old'), tenant('new', 'provisioning', 'sub-new')],
      hosting_subscriptions: [{ id: 'sub-old', user_id: 'u1', status: 'canceled' }, { id: 'sub-new', user_id: 'u1', status: 'active' }],
    });
    const owned = await resolveOwnedTenant(controlClient(), email, { userId: 'u1' });
    expect(owned).toEqual({ id: 'new', slug: 'new', status: 'provisioning', hostingSubscriptionId: 'sub-new' });
    const old = await resolveOwnedTenant(controlClient(), email, { userId: 'u1', subscriptionId: 'sub-old' });
    expect(old.id).toBe('old');
  });

  it("prefers the customer's own purchase over an operator-created tenant with the same email", async () => {
    mocks.db = fakeDb({
      tenants: [tenant('ops', 'active', null), tenant('mine', 'active', 'sub-1')],
      hosting_subscriptions: [{ id: 'sub-1', user_id: 'u1', status: 'active' }],
    });
    expect((await resolveOwnedTenant(controlClient(), email, { userId: 'u1' })).id).toBe('mine');
  });

  it("refuses a tenant bought by a different user even though owner_email matches", async () => {
    mocks.db = fakeDb({
      tenants: [tenant('theirs', 'active', 'sub-x')],
      hosting_subscriptions: [{ id: 'sub-x', user_id: 'someone-else', status: 'active' }],
    });
    expect(await ownershipCode(resolveOwnedTenant(controlClient(), email, { userId: 'u1' }))).toBe('NOT_OWNER');
  });

  it('stays ambiguous when two open purchases cannot be told apart', async () => {
    mocks.db = fakeDb({
      tenants: [tenant('a', 'active', 'sub-a'), tenant('b', 'active', 'sub-b')],
      hosting_subscriptions: [{ id: 'sub-a', user_id: 'u1', status: 'active' }, { id: 'sub-b', user_id: 'u1', status: 'active' }],
    });
    expect(await ownershipCode(resolveOwnedTenant(controlClient(), email, { userId: 'u1' }))).toBe('AMBIGUOUS_TENANT');
  });
});
