import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import Newsletter from './Newsletter';

const state = vi.hoisted(() => ({ status: 'idle', setStatus: vi.fn() }));
vi.mock('react', async original => ({
  ...await original<typeof import('react')>(),
  useRef: () => ({ current: null }),
  useState: (initial: string) => initial === '' ? ['owner@example.test', vi.fn()] : [state.status, state.setStatus],
}));
vi.mock('framer-motion', () => ({ motion: { div: 'div' }, useInView: () => true }));
vi.mock('./WaveCanvas', () => ({ default: () => null }));

type Element = ReactElement<{ children?: unknown; onSubmit?: (event: { preventDefault: () => void }) => Promise<void>; role?: string }>;
function find(node: unknown, predicate: (element: Element) => boolean): Element | undefined {
  if (Array.isArray(node)) return node.map(child => find(child, predicate)).find(Boolean);
  if (!node || typeof node !== 'object' || !('props' in node)) return;
  const element = node as Element;
  return predicate(element) ? element : find(element.props.children, predicate);
}
afterEach(() => { vi.unstubAllGlobals(); state.setStatus.mockClear(); state.status = 'idle'; });
describe('newsletter form submission', () => {
  it.each(['http', 'network', 'success'])('handles %s responses honestly', async kind => {
    const fetch = vi.fn();
    if (kind === 'network') fetch.mockRejectedValue(new Error('offline'));
    else fetch.mockResolvedValue({ ok: kind === 'success' });
    vi.stubGlobal('fetch', fetch);
    const form = find(Newsletter(), element => element.type === 'form');
    await form!.props.onSubmit!({ preventDefault: vi.fn() });
    expect(state.setStatus.mock.calls.map(call => call[0])).toEqual(['sending', kind === 'success' ? 'done' : 'error']);
  });
  it('keeps a retryable form and announces the error after failure', () => {
    state.status = 'error'; const tree = Newsletter();
    expect(find(tree, element => element.props.role === 'alert')).toBeDefined();
    expect(find(tree, element => element.type === 'form')).toBeDefined();
  });
});
