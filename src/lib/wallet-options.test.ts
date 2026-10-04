import { describe, expect, it } from 'vitest';
import type { Connector, CreateConnectorFn } from 'wagmi';
import { keepBrowserWalletDiscovery, walletConnectionChoices } from './wallet-options';

const wallet = (uid: string, name: string, type = 'injected') => ({ uid, name, type } as Connector);
describe('wallet routing', () => {
  it('keeps named providers separate and hides the ambiguous injected fallback', () => {
    const choices = walletConnectionChoices([wallet('generic','Injected'),wallet('a','Rabby'),wallet('b','Trust Wallet')],new Set(['generic','a','b']));
    expect(choices.browser.map(c => c.name)).toEqual(['Rabby','Trust Wallet']);
  });
  it('keeps SDK and extension paths independent during EIP-6963 discovery', () => {
    const factory = (() => ({ rdns:'io.metamask', name:'MetaMask', type:'metaMask' })) as unknown as CreateConnectorFn;
    const connector = keepBrowserWalletDiscovery(factory)({} as Parameters<CreateConnectorFn>[0]);
    expect(connector.rdns).toBeUndefined(); expect(connector.name).toBe('MetaMask');
  });
});
