// Fulfillment writes `paid`; `completed` is retained for legacy orders.
export function isPaidOrder(order: { status: string }): boolean {
  return order.status === 'paid' || order.status === 'completed';
}

interface Page<T> {
  data: T[] | null;
  error: unknown;
  count: number | null;
}

// Never present a truncated PostgREST response as an all-time financial total.
// Exact counts also detect a server row cap smaller than our requested page.
export async function readReportRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<Page<T>>,
  maxRows = 50000,
): Promise<T[]> {
  const rows: T[] = [];
  let expected: number | null = null;
  do {
    const page = await fetchPage(rows.length, rows.length + 499);
    if (page.error) throw page.error;
    if (page.count === null || page.count > maxRows) {
      throw new Error('Report requires a complete, bounded database result');
    }
    if (expected !== null && expected !== page.count) {
      throw new Error('Report data changed during pagination; retry');
    }
    expected = page.count;
    if (!page.data || (page.data.length === 0 && rows.length < expected)) {
      throw new Error('Incomplete report data');
    }
    rows.push(...page.data);
  } while (rows.length < expected);
  return rows;
}
