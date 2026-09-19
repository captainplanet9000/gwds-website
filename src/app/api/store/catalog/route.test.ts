import { afterEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ data: [] as unknown[], error: null as unknown }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: () => ({ select: () => ({ in: async () => state }) }) }) }));
import { GET } from './route';
afterEach(() => { state.data = []; state.error = null; vi.unstubAllEnvs(); });
describe('public release availability', () => {
  it('does not mistake an uploaded archive for an accepted release', async () => {
    vi.stubEnv('NEXT_PUBLIC_STORE_SALES_ENABLED', 'true');
    state.data = [{ id: 'trading-dashboard-template', is_active: true, artifact_ready: true, artifact_sha256: 'hash', artifact_size_bytes: 123, price_cents: 9900, stripe_price_id_live: 'price_1U09vdLLyk0oaesNmjX9ZSDL', version: '2.1.0', artifact_path: 'private.zip' }];
    const response = await GET();
    const body = await response.json();
    expect(body.products.find((p: {id: string}) => p.id === 'trading-dashboard-template').available).toBe(false);
    expect(JSON.stringify(body)).not.toContain('private.zip');
    expect(JSON.stringify(body)).not.toContain('artifact_sha256');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('fails closed when catalog access fails, without exposing database errors', async () => {
    state.error = { message: 'private database detail' };
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private database detail');
  });
});
