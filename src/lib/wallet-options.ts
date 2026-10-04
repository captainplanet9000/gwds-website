import type { Connector, CreateConnectorFn } from 'wagmi';

// Preserve EIP-6963 extension discovery instead of replacing it with an SDK QR flow.
export function keepBrowserWalletDiscovery(factory: CreateConnectorFn): CreateConnectorFn {
  return config => ({ ...factory(config), rdns: undefined });
}
export function walletProviderName(connector: Pick<Connector, 'name' | 'type'>): string {
  return connector.name === 'Injected' ? 'Browser wallet' : connector.name;
}
export function walletConnectionChoices(connectors: readonly Connector[], available: ReadonlySet<string>) {
  const installed = connectors.filter(c => c.type === 'injected' && available.has(c.uid));
  const named = installed.filter(c => c.name !== 'Injected');
  const browser = named.length ? named : installed;
  const names = new Set(browser.map(c => walletProviderName(c).toLowerCase()));
  const remote = connectors.filter(c => c.type !== 'injected' && !names.has(walletProviderName(c).toLowerCase()));
  return { browser, remote };
}
export function walletConnectionError(reason: unknown): string {
  const error = reason as { code?: number; message?: string; cause?: { code?: number } };
  const message = error?.message || '';
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001 || /rejected|denied|cancel/i.test(message)) return 'Connection cancelled. Choose your wallet to try again.';
  if (code === -32002 || /already pending|request pending/i.test(message)) return 'A connection request is already waiting in your wallet. Open the extension or app and respond to it.';
  if (/provider not found/i.test(message)) return 'This wallet is not available in this browser. Install its extension or open this page in its app browser.';
  return 'Could not connect. Unlock your selected wallet and check its pending requests, then try again.';
}
