'use client';

import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import type { FundingNetworkConfig } from '@/lib/hyperliquid-funding';
import { buildApproveAgentRequest } from '@/lib/hyperliquid-agent';
import { requestJson } from './api';
import { friendlyWalletError, shortAddress, signatureToRsv, type ActionGate } from './funding-helpers';
import { useEnsureChain } from './use-ensure-chain';
import { buttonRow, Callout, card, label, mono, muted, StatusLine, type ActionStatus, type BusyProps } from './ui';

// Approving the trading key signs Hyperliquid's approveAgent in the customer's own wallet. The key
// is the workspace's agent (API) wallet; the relay checks it and forwards the signed action.
export default function TradingKeyCard({
  cfg, gate, agentApproved, apiWallet, agentName, subscriptionId, accessToken, onDone, busy, setBusy,
}: BusyProps & {
  cfg: FundingNetworkConfig;
  gate: ActionGate;
  agentApproved: boolean | null;
  apiWallet: string | null;
  agentName: string;
  subscriptionId: string;
  accessToken: string;
  onDone: () => Promise<void>;
}) {
  const ensureChain = useEnsureChain();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();
  const [status, setStatus] = useState<ActionStatus>({ kind: 'idle' });

  const approve = async () => {
    if (!apiWallet || !gate.allowed || busy !== null) return;
    setBusy('approve');
    try {
      const { action, nonce, typedData } = buildApproveAgentRequest(apiWallet as `0x${string}`, agentName, cfg.network);
      // Belt and braces: never sign for a different network than the workspace's. Hyperliquid would
      // reject it, or worse, approve the key on the wrong chain.
      if (
        action.hyperliquidChain !== cfg.hyperliquidChain
        || action.signatureChainId.toLowerCase() !== cfg.signatureChainId.toLowerCase()
        || typedData.domain.chainId !== cfg.chainId
      ) {
        throw new Error(`This site is set up for a different Hyperliquid network than your workspace (${cfg.hyperliquidChain}), so nothing was signed. Please contact support.`);
      }
      setStatus({ kind: 'working', text: `Switching your wallet to ${cfg.chainName}…` });
      await ensureChain(cfg.chainId);
      setStatus({ kind: 'working', text: 'Approve the trading key in your wallet…' });
      const signature = signatureToRsv(await signTypedDataAsync(typedData));
      setStatus({ kind: 'working', text: 'Sending the approval to Hyperliquid…' });
      await requestJson('/api/account/funding/approve-agent', accessToken, {
        body: { subscriptionId, action, nonce, signature },
      });
      setStatus({ kind: 'done', text: 'Trading key approved. Your agents can now place orders.' });
      await onDone();
    } catch (reason) {
      setStatus({ kind: 'error', text: friendlyWalletError(reason, cfg.chainName) });
    } finally {
      setBusy(null);
    }
  };

  const apiPage = `${cfg.hyperliquidApp}/API`;
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={label}>Trading key</div>
        {agentApproved === true && <span className="tag tag-accent-2">Approved</span>}
      </div>
      {!apiWallet ? (
        <p style={muted}>Your workspace doesn&apos;t have a trading key yet. It appears here when setup finishes.</p>
      ) : (
        <>
          {agentApproved === false && (
            <div style={{ marginTop: 10 }}>
              <Callout tone="warning" role="status" title="Your agents can't trade until you approve the trading key" />
            </div>
          )}
          {agentApproved === null && (
            <p style={muted}>We couldn&apos;t check the approval with Hyperliquid just now. If your agents aren&apos;t trading, approve it again.</p>
          )}
          <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 10 }}>
            Key: <span style={mono} title={apiWallet}>{shortAddress(apiWallet)}</span>
          </div>
          <p style={muted}>
            This key can place and cancel orders for your account, and trading can lose money. Hyperliquid does not let it
            withdraw or send your funds to another wallet. You can revoke it any time on{' '}
            <a href={apiPage} target="_blank" rel="noreferrer">Hyperliquid&apos;s API page</a>.
          </p>
          {agentApproved !== true && (
            <div style={buttonRow}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={approve}
                disabled={!gate.allowed || busy !== null}
              >
                {busy === 'approve' ? 'Waiting for your wallet…' : 'Approve trading key'}
              </button>
            </div>
          )}
          {agentApproved !== true && !gate.allowed && <p style={{ ...muted, fontSize: 13 }}>{gate.reason}</p>}
        </>
      )}
      <StatusLine status={status} />
    </div>
  );
}
