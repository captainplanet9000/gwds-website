import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET } from './route';
const mocks = vi.hoisted(() => ({ allowed: true, failed: '', from: vi.fn(), auth: vi.fn() }));
vi.mock('@/lib/admin-auth', () => ({ requireAdmin: async (...args: unknown[]) => { mocks.auth(...args); return mocks.allowed; },
  adminUnauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
}));
vi.mock('@/lib/control-plane', () => ({ controlClient: () => ({ from: mocks.from }) }));
beforeEach(() => {
  mocks.allowed = true; mocks.failed = ''; mocks.from.mockReset(); mocks.auth.mockReset();
  mocks.from.mockImplementation((table: string) => ({ select: () => ({ order: async () => ({
    error: mocks.failed === table ? { message: 'offline' } : null,
    data: table === 'host_registry' ? [
      { host: 'primary', admissions_enabled: true, max_tenants: 5, note: null },
      { host: 'recovery', admissions_enabled: false, max_tenants: 0, note: 'Recovery only' },
    ] : [{ host: 'primary', observed_at: new Date().toISOString(), metrics: {} }],
  }) }) }));
});
const request = () => new NextRequest('https://example.test/api/admin/servers');
it('includes a registered recovery host even when it has never reported telemetry', async () => {
  const response = await GET(request()); const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.inventory.map((h: { host: string }) => h.host)).toEqual(['primary', 'recovery']);
  expect(body.hosts).toHaveLength(1);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(mocks.auth.mock.calls[0][1]).toEqual(['owner', 'operator', 'auditor']);
});
it.each(['host_registry', 'host_telemetry'])('does not report partial inventory as successful when %s fails', async table => {
  mocks.failed = table; expect((await GET(request())).status).toBe(503);
});
it('denies anonymous access before reading host records', async () => {
  mocks.allowed = false; expect((await GET(request())).status).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});
