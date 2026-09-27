import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const mocks = vi.hoisted(() => ({ from: vi.fn(), filters: [] as unknown[][], proof: null as unknown, error: null as unknown }));
const address = '0x1111111111111111111111111111111111111111';
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/commerce', async original => ({ ...await original<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'owner', email: 'owner@example.test' }),
}));
vi.mock('@/lib/control-plane', () => ({
  controlClient: () => ({ from: () => {
    const q = { select: () => q, eq: () => q, single: async () => ({ data: {
      slug: 'tenant', status: 'running', main_wallet_address: '0x1111111111111111111111111111111111111111', api_wallet_address: null,
    } }) }; return q;
  } }), resolveOwnedTenant: async () => ({ id: 'tenant' }), TenantOwnershipError: class extends Error {},
}));
vi.mock('viem', async original => ({ ...await original<typeof import('viem')>(),
  createPublicClient: () => ({ readContract: async () => BigInt(0), getBalance: async () => BigInt(0) }),
}));
vi.mock('@/lib/hyperliquid-account', () => ({ readHyperliquidAccount: async () => null, readAgentApproval: async () => null }));

beforeEach(() => {
  mocks.proof = null; mocks.error = null; mocks.filters = [];
  mocks.from.mockImplementation((table: string) => {
    const q = { select: () => q,
      eq: (...args: unknown[]) => { if (table === 'hosting_audit') mocks.filters.push(args); return q; },
      contains: (...args: unknown[]) => { mocks.filters.push(args); return q; },
      order: () => table === 'hosting_subscriptions' ? Promise.resolve({ data: [] }) : q,
      limit: () => q, maybeSingle: async () => ({ data: mocks.proof, error: mocks.error }),
    }; return q;
  });
});
async function status() { return (await GET(new NextRequest('https://example.test/api/account/funding'))).json(); }
it('restores only owner-scoped signed evidence for the provisioned wallet', async () => {
  mocks.proof = { created_at: '2026-09-27T00:00:00Z' };
  expect((await status()).walletVerification).toEqual({ address, verifiedAt: '2026-09-27T00:00:00Z', status: 'verified' });
  expect(mocks.filters).toEqual(expect.arrayContaining([
    ['user_id', 'owner'], ['actor_id', 'owner'], ['actor_type', 'customer'],
    ['action', 'funding_wallet_verified'], ['metadata', { address }],
  ]));
});
it('does not treat a provisioned address as signed proof', async () => {
  expect((await status()).walletVerification.status).toBe('unverified');
});
it('distinguishes proof lookup failure from missing verification', async () => {
  mocks.error = { message: 'offline' };
  expect((await status()).walletVerification.status).toBe('unavailable');
});
