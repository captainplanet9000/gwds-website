import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const SUBSCRIPTION_ID = '11111111-1111-4111-8111-111111111111';

const mocks = vi.hoisted(() => ({
  rpcResult: null as unknown,
  commandLookup: vi.fn(),
  deliver: vi.fn(),
}));

vi.mock('@/lib/commerce', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
}));
vi.mock('@/lib/supabase', () => ({
  createServerClient: () => ({ rpc: async () => ({ data: mocks.rpcResult, error: null }) }),
}));
vi.mock('@/lib/control-plane', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/control-plane')>(),
  controlClient: () => ({
    from: () => {
      const query = {
        select: () => query, eq: () => query, order: () => query, limit: () => query,
        maybeSingle: mocks.commandLookup,
      };
      return query;
    },
  }),
}));
vi.mock('@/lib/hosting-notifications', () => ({ deliverHostingNotification: mocks.deliver }));

function request() {
  return new NextRequest(`https://example.test/api/hosting/provision-status?subscriptionId=${SUBSCRIPTION_ID}`);
}

describe('provision status', () => {
  beforeEach(() => {
    mocks.commandLookup.mockReset();
    mocks.commandLookup.mockResolvedValue({ data: { error_code: 'host-agent.wallet_unverified' }, error: null });
    mocks.deliver.mockReset();
    mocks.deliver.mockResolvedValue({ checked: 0, sent: 0, failed: 0 });
  });

  it('reads the error code of a failed provision when the RPC does not carry it yet', async () => {
    mocks.rpcResult = { tenant: { id: 'tenant-a', status: 'provisioning' }, command: { status: 'failed', error: 'no proof' } };
    const body = await (await GET(request())).json();
    expect(body.command.errorCode).toBe('host-agent.wallet_unverified');
    expect(mocks.deliver).toHaveBeenCalledWith(SUBSCRIPTION_ID, 3);
  });

  it('uses the error code from the RPC once it is returned', async () => {
    mocks.rpcResult = { tenant: { id: 'tenant-a' }, command: { status: 'failed', error_code: 'provision.tenant_not_halted' } };
    const body = await (await GET(request())).json();
    expect(body.command.errorCode).toBe('provision.tenant_not_halted');
    expect(mocks.commandLookup).not.toHaveBeenCalled();
  });

  it('does not look up a code for a command that has not failed', async () => {
    mocks.rpcResult = { tenant: { id: 'tenant-a' }, command: { status: 'queued' } };
    const body = await (await GET(request())).json();
    expect(body.command.errorCode).toBeNull();
    expect(mocks.commandLookup).not.toHaveBeenCalled();
  });

  it('touches no outbox for a subscription the caller does not own', async () => {
    mocks.rpcResult = null;
    const body = await (await GET(request())).json();
    expect(body).toEqual({ tenant: null, command: null });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('never fails the status because an email could not be sent', async () => {
    mocks.rpcResult = { tenant: null, command: null };
    mocks.deliver.mockRejectedValue(new Error('resend down'));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
