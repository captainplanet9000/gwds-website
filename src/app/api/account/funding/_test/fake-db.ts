// Test-only in-memory stand-in for the slice of the supabase-js query builder the funding routes
// use, so route tests exercise the REAL ownership and network resolution in
// src/lib/control-plane.ts instead of mocking it away. `client` is what a mocked
// createServerClient() returns; `.schema('control')` reads the same table map (table names do
// not collide between the two schemas).
type Row = Record<string, unknown>;
type Result = { data: unknown; error: { message: string } | null };

export function fakeDb(tables: Record<string, Row[]>) {
  const inserts: Array<{ table: string; row: Row }> = [];
  const failing = new Set<string>();

  function from(table: string) {
    const filters: Array<(row: Row) => boolean> = [];
    let sort: { column: string; ascending: boolean } | null = null;
    let max = Infinity;
    const run = (): { rows: Row[] | null; error: { message: string } | null } => {
      if (failing.has(table)) return { rows: null, error: { message: `${table} unavailable` } };
      let rows = (tables[table] ?? []).filter(row => filters.every(match => match(row)));
      if (sort) {
        const { column, ascending } = sort;
        rows = [...rows].sort((a, b) => (String(a[column]) < String(b[column]) ? -1 : 1) * (ascending ? 1 : -1));
      }
      return { rows: rows.slice(0, max), error: null };
    };
    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => { filters.push(row => row[column] === value); return builder; },
      neq: (column: string, value: unknown) => { filters.push(row => row[column] !== value); return builder; },
      order: (column: string, opts?: { ascending?: boolean }) => { sort = { column, ascending: opts?.ascending ?? true }; return builder; },
      limit: (n: number) => { max = n; return builder; },
      maybeSingle: async (): Promise<Result> => {
        const { rows, error } = run();
        return { data: rows?.[0] ?? null, error };
      },
      single: async (): Promise<Result> => {
        const { rows, error } = run();
        if (error) return { data: null, error };
        return rows!.length === 1 ? { data: rows![0], error: null } : { data: null, error: { message: 'expected one row' } };
      },
      insert: async (row: Row): Promise<Result> => {
        inserts.push({ table, row });
        return { data: null, error: null };
      },
      then: (resolve: (value: Result) => unknown, reject?: (reason: unknown) => unknown) => {
        const { rows, error } = run();
        return Promise.resolve({ data: rows, error }).then(resolve, reject);
      },
    };
    return builder;
  }

  return { from, inserts, failing, client: { from, schema: () => ({ from }) } };
}
