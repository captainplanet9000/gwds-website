'use client';

import { useState } from 'react';
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from 'wagmi';
import { walletConnectAvailable } from '@/lib/wagmi-config';
import { friendlyWalletError, sameAddress } from './funding-helpers';
import { buttonRow, mono } from './ui';

// Connect / switch network / disconnect. Signing happens only inside the customer's wallet;
// nothing here ever sees a key.
export default function WalletConnectionControls({ expectedAddress, targetChainId, targetChainName }: {
  expectedAddress?: string | null;
  targetChainId?: number;
  targetChainName?: string;
}) {
  const connection = useConnection();
  const connectors = useConnectors();
  const { mutateAsync: connectAsync, isPending: connecting } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const { mutateAsync: switchChainAsync, isPending: switching } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  const run = async (task: () => Promise<unknown>) => {
    setError(null);
    try {
      await task();
    } catch (reason) {
      setError(friendlyWalletError(reason, targetChainName));
    }
  };

  const errorLine = error && (
    <div role="alert" style={{ color: '#ffb4b4', fontSize: 13, marginTop: 10 }}>{error}</div>
  );

  if (!connection.isConnected || !connection.address) {
    return (
      <div>
        <div style={buttonRow}>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              className="btn btn-secondary"
              disabled={connecting}
              onClick={() => run(() => connectAsync({ connector }))}
            >
              {connecting ? 'Connecting…' : `Connect ${connector.name === 'Injected' ? 'browser wallet' : connector.name}`}
            </button>
          ))}
        </div>
        {connectors.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 10 }}>
            No wallet was found. Install a browser wallet such as MetaMask or Rabby, or open this page in your wallet app&apos;s browser.
          </p>
        )}
        {!walletConnectAvailable && connectors.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 10 }}>
            Browser extension wallets only on this site. Mobile wallets can open this page in their built-in browser.
          </p>
        )}
        {errorLine}
      </div>
    );
  }

  const onTargetChain = !targetChainId || connection.chainId === targetChainId;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
        <span style={{ ...mono, fontSize: 14 }}>{connection.address}</span>
        {expectedAddress && (sameAddress(connection.address, expectedAddress)
          ? <span className="tag tag-accent-2">Trading account</span>
          : <span className="tag tag-neutral">Not your trading account</span>)}
      </div>
      <div style={buttonRow}>
        {!onTargetChain && targetChainId && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={switching}
            onClick={() => run(() => switchChainAsync({ chainId: targetChainId }))}
          >
            {switching ? 'Switching…' : `Switch to ${targetChainName || 'the right network'}`}
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={() => disconnect()}>Disconnect</button>
      </div>
      {!onTargetChain && (
        <p style={{ fontSize: 13, color: '#e7d991', marginTop: 10 }}>
          Your wallet is on a different network. Actions here switch it to {targetChainName || 'the right network'} first.
        </p>
      )}
      {errorLine}
    </div>
  );
}
