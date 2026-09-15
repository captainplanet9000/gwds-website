'use client';

import { useState } from 'react';
import { useConnection, useSignMessage } from 'wagmi';
import { requestJson } from './api';
import { friendlyWalletError, sameAddress, shortAddress } from './funding-helpers';
import WalletConnectionControls from './WalletConnectionControls';
import { buttonRow, card, label, muted, StatusLine, type ActionStatus, type BusyProps } from './ui';

// Proves the customer controls the wallet that will hold their funds: the server issues a
// challenge, the wallet signs it as plain text (no transaction, no gas), and verify-wallet records
// the proof that provisioning requires before it adopts the wallet as the trading account.
export default function VerifyWalletCard({
  accessToken, subscriptionId, verifiedAddress, prominent, onVerified, busy, setBusy,
}: BusyProps & {
  accessToken: string;
  subscriptionId: string;
  verifiedAddress: string | null;
  prominent: boolean;
  onVerified: () => Promise<void>;
}) {
  const connection = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<ActionStatus>({ kind: 'idle' });
  const alreadyVerified = sameAddress(connection.address, verifiedAddress);

  const verify = async () => {
    const address = connection.address;
    if (!address) return;
    setBusy('verify');
    try {
      setStatus({ kind: 'working', text: 'Preparing a message to sign…' });
      const challenge = await requestJson<{ message: string; token: string }>(
        '/api/account/funding/challenge', accessToken, { body: { address } },
      );
      setStatus({ kind: 'working', text: 'Sign the message in your wallet. It costs nothing and moves no funds.' });
      const signature = await signMessageAsync({ message: challenge.message });
      setStatus({ kind: 'working', text: 'Checking your signature…' });
      await requestJson('/api/account/funding/verify-wallet', accessToken, {
        body: { subscriptionId, address, message: challenge.message, token: challenge.token, signature },
      });
      setStatus({ kind: 'done', text: `Verified ${shortAddress(address)}. Setup continues automatically.` });
      await onVerified();
    } catch (reason) {
      setStatus({ kind: 'error', text: friendlyWalletError(reason) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={prominent ? { ...card, border: '1px solid var(--color-accent)' } : card}>
      <div style={label}>{prominent ? 'Required to finish setup' : 'Wallet verification'}</div>
      <h3 style={{ margin: '8px 0 0', fontSize: prominent ? 20 : 17 }}>
        Connect and verify the wallet that will hold your funds{prominent ? ' (required to finish setup)' : ''}
      </h3>
      <p style={muted}>
        Use the wallet you will trade with. Your funds stay in that wallet&apos;s own Hyperliquid account, and it becomes
        your trading account when setup finishes. Verifying signs a plain text message: no transaction, no gas, and no
        funds move.
      </p>
      <p style={{ ...muted, fontSize: 13 }}>
        Never type a seed phrase or private key into any website. Cival will never ask for it.
      </p>
      <WalletConnectionControls />
      <div style={buttonRow}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!connection.address || busy !== null}
          onClick={verify}
        >
          {busy === 'verify' ? 'Waiting for your wallet…' : alreadyVerified ? 'Verify again' : 'Sign to verify this wallet'}
        </button>
        {alreadyVerified && <span className="tag tag-accent-2">This wallet is verified</span>}
      </div>
      <StatusLine status={status} />
    </div>
  );
}
