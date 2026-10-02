import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { GET } from './unsubscribe/route';
import { POST as broadcast } from '../admin/broadcast/route';
import { newsletterToken } from '@/lib/newsletter';

const mocks = vi.hoisted(() => ({ from: vi.fn(), send: vi.fn(), rate: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: mocks.from }) }));
vi.mock('resend', () => ({ Resend: class { emails = { send: mocks.send }; } }));
vi.mock('@/lib/admin-auth', () => ({ requireAdmin: mocks.admin, adminUnauthorized: () => new Response(null, { status: 401 }) }));
vi.mock('@/lib/commerce', async original => ({
  ...await original<typeof import('@/lib/commerce')>(), enforceRateLimit: mocks.rate,
}));

function request(path: string, body: unknown) {
  return new NextRequest(`https://example.test/api/${path}`, { method: 'POST', body: JSON.stringify(body) });
}
function database(error: unknown = null, data: unknown = []) {
  const query = { upsert: vi.fn().mockResolvedValue({ error }), update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error, data }) };
  mocks.from.mockReturnValue(query);
  return query;
}
function unsubscribe(token = newsletterToken('owner@example.test')) {
  return GET(new NextRequest(`https://example.test/api/newsletter/unsubscribe?email=owner@example.test&token=${token}`));
}
describe('newsletter delivery and unsubscribe failures', () => {
  beforeEach(() => {
    vi.clearAllMocks(); database(); mocks.send.mockResolvedValue({ error: null }); mocks.admin.mockResolvedValue(true);
    vi.stubEnv('RESEND_API_KEY', 'test-only'); vi.stubEnv('RESEND_FROM_EMAIL', 'store@example.test');
    vi.stubEnv('SUPPORT_EMAIL', 'owner@example.test'); vi.stubEnv('NEWSLETTER_SIGNING_SECRET', 'test-only-secret-with-at-least-32-characters');
  });
  afterEach(() => vi.unstubAllEnvs());
  it('normalizes and saves an opt-in and sends its signed welcome link', async () => {
    const query = database();
    expect((await POST(request('newsletter', { email: ' OWNER@example.test ' }))).status).toBe(200);
    expect(query.upsert).toHaveBeenCalledWith(expect.objectContaining({ email: 'owner@example.test', is_active: true }), { onConflict: 'email' });
    expect(mocks.send.mock.calls[0][0].text).toContain(encodeURIComponent(newsletterToken('owner@example.test')));
  });
  it('rejects invalid email without saving or sending', async () => {
    expect((await POST(request('newsletter', { email: 'invalid' }))).status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it('does not send a welcome when saving fails', async () => {
    database({ message: 'offline' });
    expect((await POST(request('newsletter', { email: 'owner@example.test' }))).status).toBe(503);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('reports a returned Resend error rather than success', async () => {
    mocks.send.mockResolvedValue({ error: { message: 'rejected' } });
    const response = await POST(request('newsletter', { email: 'owner@example.test' }));
    expect(response.status).toBe(503); expect((await response.json()).code).toBe('NEWSLETTER_WELCOME_FAILED');
  });
  it('reports a thrown delivery error rather than success', async () => {
    mocks.send.mockRejectedValue(new Error('offline'));
    expect((await POST(request('newsletter', { email: 'owner@example.test' }))).status).toBe(500);
  });
  it('deactivates the subscriber before showing unsubscribe success', async () => {
    const query = database(); expect((await unsubscribe()).status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
    expect(query.eq).toHaveBeenCalledWith('email', 'owner@example.test');
  });
  it('rejects invalid unsubscribe tokens without a database write', async () => {
    expect((await unsubscribe('invalid')).status).toBe(400); expect(mocks.from).not.toHaveBeenCalled();
  });
  it('does not claim unsubscribe success on database error', async () => {
    database({ message: 'offline' }); const response = await unsubscribe();
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('<h1>Unsubscribed');
  });
  it('handles thrown database errors', async () => {
    mocks.from.mockImplementation(() => { throw new Error('offline'); });
    expect((await unsubscribe()).status).toBe(503);
  });
  it('allows an owner preview without any active subscribers or database query', async () => {
    const response = await broadcast(request('admin/broadcast', { subject: 'Preview', html: '<p>Test</p>', test: true }));
    expect(response.status).toBe(200); expect((await response.json()).sent).toBe(1);
    expect(mocks.from).not.toHaveBeenCalled(); expect(mocks.send.mock.calls[0][0].to).toBe('owner@example.test');
  });
  it('still refuses a real campaign with zero subscribers', async () => {
    expect((await broadcast(request('admin/broadcast', { subject: 'Preview', html: 'Test' }))).status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('reports subscriber lookup failures without sending', async () => {
    database({ message: 'offline' });
    expect((await broadcast(request('admin/broadcast', { subject: 'Preview', html: 'Test' }))).status).toBe(503);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('requires admin authorization even for previews', async () => {
    mocks.admin.mockResolvedValue(false);
    expect((await broadcast(request('admin/broadcast', { subject: 'Preview', html: 'Test', test: true }))).status).toBe(401);
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
