// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Connector } from 'wagmi';
import WalletConnectionOptions from './WalletConnectionOptions';

const mocks = vi.hoisted(() => ({ connectors: [] as unknown[], connect: vi.fn() }));
vi.mock('wagmi', () => ({
  useConnectors: () => mocks.connectors,
  useConnect: () => ({ mutateAsync: mocks.connect, isPending: false }),
}));
vi.mock('@/lib/wagmi-config', () => ({ walletConnectAvailable: false }));

function connector(uid: string, name: string, type = 'injected', present = true) {
  return { uid, name, type, getProvider: vi.fn().mockResolvedValue(present ? {} : undefined) } as unknown as Connector;
}
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.connect.mockReset(); mocks.connect.mockResolvedValue(undefined);
  mocks.connectors = [connector('generic', 'Injected', 'injected', false), connector('sdk', 'MetaMask', 'metaMask'), connector('coinbase', 'Coinbase Wallet', 'coinbaseWallet')];
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
async function render() { await act(async () => root.render(<WalletConnectionOptions />)); }
function button(name: string) { return [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(name))!; }

describe('provider-specific wallet picker', () => {
  it('offers MetaMask and Coinbase mobile fallbacks when there is no extension', async () => {
    await render();
    expect(container.textContent).toContain('No wallet extension detected');
    expect(button('Connect MetaMask')).toBeDefined(); expect(button('Connect Coinbase Wallet')).toBeDefined();
    expect(container.textContent).toContain('Universal WalletConnect pairing is not configured yet');
  });
  it('connects the selected extension, not the MetaMask SDK or another installed wallet', async () => {
    const rabby = connector('rabby', 'Rabby');
    mocks.connectors.push(rabby, connector('trust', 'Trust Wallet'));
    await render();
    expect(button('Connect Rabby').textContent).toContain('Installed · connect directly');
    await act(async () => button('Connect Rabby').click());
    expect(mocks.connect).toHaveBeenCalledExactlyOnceWith({ connector: rabby });
  });
  it('prefers a detected MetaMask extension and hides its duplicate SDK fallback', async () => {
    const extension = connector('metamask-extension', 'MetaMask'); mocks.connectors.push(extension);
    await render();
    expect([...container.querySelectorAll('button')].filter(b => b.textContent?.startsWith('Connect MetaMask'))).toHaveLength(1);
    await act(async () => button('Connect MetaMask').click());
    expect(mocks.connect).toHaveBeenCalledWith({ connector: extension });
  });
  it('restores retry after customer rejects connection', async () => {
    mocks.connect.mockRejectedValue({ code: 4001 }); await render();
    await act(async () => button('Connect MetaMask').click());
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Connection cancelled');
    expect(button('Connect MetaMask').disabled).toBe(false);
  });
  it('explains an already-pending request without starting another connection', async () => {
    mocks.connect.mockRejectedValue({ code: -32002 }); await render();
    await act(async () => button('Connect Coinbase Wallet').click());
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('already waiting');
  });
  it('does not connect a provider that disappears before selection', async () => {
    const rabby = connector('rabby', 'Rabby'); mocks.connectors.push(rabby); await render();
    vi.mocked(rabby.getProvider).mockResolvedValue(undefined);
    await act(async () => button('Connect Rabby').click());
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('not available');
  });
});
