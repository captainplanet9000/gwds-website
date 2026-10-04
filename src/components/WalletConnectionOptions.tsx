'use client';

import { useEffect, useRef, useState } from 'react';
import { type Connector, useConnect, useConnectors } from 'wagmi';
import { walletConnectAvailable } from '@/lib/wagmi-config';
import { walletConnectionChoices, walletConnectionError, walletProviderName } from '@/lib/wallet-options';

const otherWallets = [
  { name: 'Rabby', url: 'https://rabby.io/' },
  { name: 'Trust Wallet', url: 'https://trustwallet.com/' },
  { name: 'Rainbow', url: 'https://rainbow.me/' },
  { name: 'Phantom', url: 'https://phantom.com/' },
];

export default function WalletConnectionOptions() {
  const connectors = useConnectors();
  const { mutateAsync: connectAsync, isPending } = useConnect();
  const [available, setAvailable] = useState<Set<string>>(() => new Set());
  const [discovering, setDiscovering] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const lock = useRef(false);
  const fundingUrl = 'https://www.civalsystems.com/account/funding';

  useEffect(() => {
    let active = true;
    const check = async () => {
      const found = await Promise.all(connectors.filter(c => c.type === 'injected').map(async c => {
        try { return await c.getProvider() ? c.uid : null; } catch { return null; }
      }));
      if (active) { setAvailable(new Set(found.filter((uid): uid is string => uid !== null))); setDiscovering(false); }
    };
    void check();
    window.addEventListener('ethereum#initialized', check);
    window.addEventListener('focus', check);
    return () => { active = false; window.removeEventListener('ethereum#initialized', check); window.removeEventListener('focus', check); };
  }, [connectors]);

  const { browser, remote } = walletConnectionChoices(connectors, available);
  const busy = isPending || selected !== null;
  const connect = async (connector: Connector) => {
    if (lock.current) return;
    lock.current = true; setSelected(connector.uid); setError('');
    try {
      if (connector.type === 'injected' && !await connector.getProvider()) throw new Error('provider not found');
      await connectAsync({ connector });
    } catch (reason) { setError(walletConnectionError(reason)); }
    finally { lock.current = false; setSelected(null); }
  };

  const option = (connector: Connector, direct: boolean) => <button
    type="button" key={connector.uid} className="btn btn-secondary" disabled={busy}
    onClick={() => void connect(connector)} style={{ textAlign: 'left', display: 'grid', gap: 4, padding: '14px 16px' }}
  >
    <span>{selected === connector.uid ? `Connecting ${walletProviderName(connector)}…` : `Connect ${walletProviderName(connector)}`}</span>
    <span style={{ fontSize: 12, fontWeight: 400 }}>{direct ? 'Installed · connect directly' : connector.type === 'walletConnect' ? 'Choose a mobile wallet · app or QR' : 'Mobile app / extension fallback'}</span>
  </button>;

  return <div style={{ marginTop: 14, display: 'grid', gap: 18 }}>
    <section aria-label="Installed browser wallets">
      <strong>Choose your wallet</strong>
      <p style={{ margin: '6px 0 12px', fontSize: 14, color: 'var(--color-neutral-700)' }}>Installed extensions connect directly. No QR code is needed for a detected browser wallet.</p>
      {browser.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>{browser.map(c => option(c, true))}</div>
        : <p role="status" style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{discovering ? 'Checking for installed wallets…' : 'No wallet extension detected in this browser. Use a mobile option below, or install your preferred extension and refresh.'}</p>}
    </section>
    <section aria-label="Mobile wallet connections">
      <strong>Mobile & other connection methods</strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10, marginTop: 10 }}>{remote.map(c => option(c, false))}</div>
      <a className="btn btn-secondary" style={{ marginTop: 10 }}
        href={`https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(fundingUrl)}`}>
        Open in Trust Wallet app ↗
      </a>
      {!walletConnectAvailable && <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '10px 0 0' }}>Universal WalletConnect pairing is not configured yet. MetaMask and Coinbase have their own mobile connection flows. Other wallets can connect through their extension or built-in app browser.</p>}
    </section>
    <details>
      <summary style={{ cursor: 'pointer', fontSize: 14 }}>Use Rabby, Trust Wallet, Rainbow, Phantom or another wallet</summary>
      <p style={{ fontSize: 13, lineHeight: 1.6 }}>Install your chosen provider from its official site, then refresh this page. Detected Ethereum-compatible wallets appear above by name. On mobile, open this page in your wallet’s built-in browser and sign in to Cival. Use an Ethereum-compatible account for Arbitrum; a Solana-only account cannot sign this ownership proof.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>{otherWallets.map(wallet => <a key={wallet.name} href={wallet.url} target="_blank" rel="noopener noreferrer">{wallet.name} ↗</a>)}</div>
      <p style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{fundingUrl}</p>
      <button type="button" className="btn btn-secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(fundingUrl); setCopied(true); }
        catch { setError('Copy the funding link above and paste it into your wallet’s browser.'); }
      }}>{copied ? 'Funding link copied' : 'Copy funding link'}</button>
    </details>
    {busy && <p role="status" style={{ fontSize: 13, margin: 0 }}>Respond in your selected wallet. Connection does not transfer funds or approve trading.</p>}
    {error && <p role="alert" style={{ color: 'var(--color-neutral-900)', margin: 0 }}>{error}</p>}
    {copied && <span role="status" style={{ fontSize: 13 }}>Paste the link into your wallet’s browser to continue.</span>}
  </div>;
}
