import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WalletConnectionOptions from './WalletConnectionOptions';

vi.mock('wagmi', () => ({
  useConnectors: () => [
    { uid: 'browser', type: 'injected', name: 'Injected' },
    { uid: 'mobile', type: 'metaMask', name: 'MetaMask' },
  ],
  useConnect: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/lib/wagmi-config', () => ({ walletConnectAvailable: false }));

describe('wallet connection without an installed extension', () => {
  it('keeps the mobile connector available rather than leaving a blank first step', () => {
    const html = renderToStaticMarkup(<WalletConnectionOptions />);
    expect(html).toContain('Connect MetaMask');
    expect(html).toContain('Mobile pairing is available through MetaMask');
    expect(html).not.toContain('QR wallet pairing is not available yet');
  });
});
