'use client';

import { useEffect, useState } from 'react';
import { type Connector, useConnect, useConnectors } from 'wagmi';
import { walletConnectAvailable } from '@/lib/wagmi-config';

// Remote connectors create their provider on demand. Only injected connectors
// require an extension/app provider to exist before the user clicks Connect.
function WalletOption({ connector, busy, connect }: {
  connector: Connector; busy: boolean; connect: (connector: Connector) => Promise<void>;
}) {
  const [ready, setReady] = useState(connector.type !== 'injected');
  useEffect(() => {
    if (connector.type !== 'injected') return;
    let active = true;
    const check = () => {
      void connector.getProvider().then(provider => {
        if (active) setReady(Boolean(provider));
      }).catch(() => { if (active) setReady(false); });
    };
    check();
    window.addEventListener('ethereum#initialized', check);
    window.addEventListener('focus', check);
    return () => {
      active = false;
      window.removeEventListener('ethereum#initialized', check);
      window.removeEventListener('focus', check);
    };
  }, [connector]);
  if (!ready) return null;
  return <button className="btn btn-secondary" disabled={busy} onClick={() => void connect(connector)}>
    {busy ? 'Connecting…' : connector.type === 'injected' && connector.name === 'Injected'
      ? 'Connect browser wallet' : `Connect ${connector.name}`}
  </button>;
}

export default function WalletConnectionOptions() {
  const connectors = useConnectors();
  const { mutateAsync: connectAsync, isPending } = useConnect();
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fundingUrl = 'https://www.civalsystems.com/account/funding';
  const connect = async (connector: Connector) => {
    setError('');
    try {
      if (connector.type === 'injected' && !await connector.getProvider()) {
        setError('No wallet was detected. Open this page in your wallet’s browser, or a browser with your wallet extension installed.');
        return;
      }
      await connectAsync({ connector });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '';
      setError(/rejected|denied|4001/i.test(message)
        ? 'Connection cancelled in your wallet. You can try again when ready.'
        : /provider not found/i.test(message)
          ? 'Your wallet is not available in this browser. Open the funding link in your wallet’s browser or use your wallet extension.'
          : 'Could not connect. Unlock your wallet, check for a pending connection request, then try again.');
    }
  };
  return <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {connectors.map(connector => <WalletOption key={connector.uid} connector={connector} busy={isPending} connect={connect} />)}
    </div>
    <div style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
      <strong>Using a browser without a wallet?</strong>
      <p style={{ margin: '6px 0' }}>Open the funding link in your wallet app’s browser, or in Chrome, Edge or Firefox with your wallet extension installed. Sign in to Cival there and connect the same wallet you verified for this workspace.</p>
      {!walletConnectAvailable && <p style={{ margin: '6px 0' }}>QR wallet pairing is not available yet. Detected browser wallets appear above.</p>}
      <a href={fundingUrl} style={{ overflowWrap: 'anywhere' }}>{fundingUrl}</a>
      <div style={{ marginTop: 8 }}><button className="btn btn-secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(fundingUrl); setCopied(true); }
        catch { setError('Copy the funding link above and paste it into your wallet’s browser.'); }
      }}>{copied ? 'Funding link copied' : 'Copy funding link'}</button></div>
    </div>
    {error && <p role="alert" style={{ color: 'var(--color-neutral-900)', margin: 0 }}>{error}</p>}
    {copied && <span role="status" style={{ fontSize: 13 }}>Paste the link into your wallet’s browser to continue.</span>}
  </div>;
}
