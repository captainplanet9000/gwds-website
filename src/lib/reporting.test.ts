import { describe, expect, it } from 'vitest';
import { isPaidOrder, readReportRows } from './reporting';

describe('financial reporting', () => {
  it('includes fulfillment paid status and legacy completed, excluding reversals', () => {
    const statuses = ['paid', 'completed', 'pending', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'dispute_lost'];
    expect(statuses.filter(status => isPaidOrder({ status }))).toEqual(['paid', 'completed']);
  });

  it('reads beyond server row caps without dropping revenue rows', async () => {
    const source = Array.from({ length: 1101 }, (_, id) => ({ id }));
    const rows = await readReportRows(async (from) => ({
      data: source.slice(from, from + 100), error: null, count: source.length,
    }));
    expect(rows).toEqual(source);
  });

  it('rejects errors, truncated responses and counts changing during reads', async () => {
    await expect(readReportRows(async () => ({ data: [], count: 1, error: null }))).rejects.toThrow('Incomplete');
    await expect(readReportRows(async () => ({ data: [], count: 0, error: new Error('offline') }))).rejects.toThrow('offline');
    await expect(readReportRows(async () => ({ data: [], count: 50001, error: null }))).rejects.toThrow('bounded');
    await expect(readReportRows(async from => ({ data: [from], count: from ? 3 : 2, error: null }))).rejects.toThrow('changed');
  });
});
