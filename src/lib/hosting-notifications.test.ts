import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deliverHostingNotification, drainHostingNotifications } from '@/lib/hosting-notifications';

interface OutboxRow {
  id: string;
  subscription_id: string;
  template: string;
  recipient_email: string;
  attempts: number;
  payload: null;
  status: string;
  created_at: string;
}

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  rows: [] as OutboxRow[],
  limits: [] as number[],
}));
vi.mock('@/lib/email', () => ({ sendHostingEmail: mocks.send }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => fakeClient() }));

// A small in-memory stand-in for the PostgREST builder, covering exactly the calls the outbox makes:
// list (select/eq/in/lt/order/limit), claim (update/eq/in/select/maybeSingle), settle (update/eq).
function fakeClient() {
  return {
    from(table: string) {
      const filters: Array<[string, string, unknown]> = [];
      let patch: Record<string, unknown> | null = null;
      let limit = Infinity;
      const matches = () => mocks.rows.filter((row) => filters.every(([kind, column, value]) => {
        const cell = (row as unknown as Record<string, unknown>)[column];
        if (kind === 'eq') return cell === value;
        if (kind === 'in') return (value as unknown[]).includes(cell);
        return (cell as number) < (value as number);
      }));
      const other = () => ({
        data: table === 'hosting_subscriptions' ? { plan_id: 'solo' } : table === 'hosting_plans' ? { name: 'Solo' } : null,
        error: null,
      });
      const query = {
        select: () => query,
        update: (values: Record<string, unknown>) => { patch = values; return query; },
        eq: (column: string, value: unknown) => { filters.push(['eq', column, value]); return query; },
        in: (column: string, value: unknown[]) => { filters.push(['in', column, value]); return query; },
        lt: (column: string, value: number) => { filters.push(['lt', column, value]); return query; },
        order: () => query,
        limit: (count: number) => { limit = count; mocks.limits.push(count); return query; },
        single: async () => other(),
        maybeSingle: async () => {
          if (table !== 'hosting_notifications') return other();
          const hit = matches()[0];
          if (hit && patch) Object.assign(hit, patch);
          return { data: hit ? { id: hit.id } : null, error: null };
        },
        then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => {
          let result: unknown;
          if (patch) {
            for (const row of matches()) Object.assign(row, patch);
            result = { error: null };
          } else {
            result = { data: matches().sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(0, limit), error: null };
          }
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

function row(id: string, overrides: Partial<OutboxRow> = {}): OutboxRow {
  return {
    id, subscription_id: 'sub-a', template: 'hosting_started', recipient_email: 'a@example.test',
    attempts: 0, payload: null, status: 'pending', created_at: `2026-09-15T00:00:${id.padStart(2, '0')}Z`,
    ...overrides,
  };
}

describe('hosting notification outbox', () => {
  beforeEach(() => {
    mocks.rows.length = 0;
    mocks.limits.length = 0;
    mocks.send.mockReset();
    mocks.send.mockResolvedValue({ id: 'resend-id' });
  });

  it('delivers every queued message for the subscription, each keyed by its own row id', async () => {
    mocks.rows.push(
      row('1'),
      row('2', { status: 'failed', attempts: 2, template: 'hosting_wallet_needed' }),
      row('3', { subscription_id: 'sub-b' }),
      row('4', { status: 'sent' }),
    );
    await expect(deliverHostingNotification('sub-a')).resolves.toEqual({ checked: 2, sent: 2, failed: 0 });
    expect(mocks.send.mock.calls.map(([, message]) => message.notificationId)).toEqual(['1', '2']);
    expect(mocks.rows.map((item) => item.status)).toEqual(['sent', 'sent', 'pending', 'sent']);
    expect(mocks.send.mock.calls[0][1]).toMatchObject({ subscriptionId: 'sub-a', planName: 'Solo', template: 'hosting_started' });
  });

  it('keeps going after a failed send, then reports the failure', async () => {
    mocks.rows.push(row('1'), row('2'));
    mocks.send.mockRejectedValueOnce(new Error('resend down'));
    await expect(deliverHostingNotification('sub-a')).rejects.toThrow('resend down');
    expect(mocks.rows.map((item) => [item.status, item.attempts])).toEqual([['failed', 1], ['sent', 1]]);
  });

  it('never retries a message that has used its five attempts', async () => {
    mocks.rows.push(row('1', { status: 'failed', attempts: 5 }));
    await deliverHostingNotification('sub-a');
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('is bounded per call', async () => {
    for (let index = 1; index <= 12; index += 1) mocks.rows.push(row(String(index)));
    await deliverHostingNotification('sub-a');
    expect(mocks.send).toHaveBeenCalledTimes(10);
    expect(mocks.limits).toEqual([10]);
  });

  it('drains across subscriptions without throwing, and reports counts', async () => {
    mocks.rows.push(row('1'), row('2', { subscription_id: 'sub-b' }), row('3', { subscription_id: 'sub-c' }));
    mocks.send.mockResolvedValueOnce({ id: 'x' }).mockRejectedValueOnce(new Error('bounced')).mockResolvedValueOnce({ id: 'y' });
    await expect(drainHostingNotifications()).resolves.toEqual({ checked: 3, sent: 2, failed: 1 });
    expect(mocks.limits).toEqual([25]);
    expect(mocks.rows.map((item) => item.status)).toEqual(['sent', 'failed', 'sent']);
  });
});
