'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  useConnect, useConnectors, useConnection, useDisconnect, useSignMessage, useSignTypedData,
  useSwitchChain, useChainId,
} from 'wagmi';
import { walletConnectAvailable } from '@/lib/wagmi-config';
import { buildApproveAgentRequest } from '@/lib/hyperliquid-agent';
import { arbitrumChainId } from '@/lib/hyperliquid-network';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// NON-CUSTODIAL funding + agent-approval workspace.
//
// This page never asks for a private key or seed phrase, never accepts one if pasted in, and
// never routes money anywhere the platform controls. Every signature (ownership proof, agent
// approval) is produced inside the customer's own connected wallet extension/app via wagmi. The
// server-side routes this page talks to are read-only or pure relays of an already-signed
// payload — see the comments in src/app/api/account/funding/*.
// ─────────────────────────────────────────────────────────────────────────────────────────────

type Network = {
  name: string; chain: string; chainId: number; settlementAsset: string;
  usdcContract: string; bridgeAddress: string | null;
};
type FundingData = {
  hasTenant: boolean;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  declaredAddress?: string | null;
  addressMismatch?: boolean;
  network?: Network;
  tenant: {
    slug: string; displayName: string | null; status: string;
    mainWalletAddress: string | null; apiWalletAddress: string | null;
  } | null;
  balances?: {
    arbitrumUsdc: number | null; arbitrumUsdcKnown: boolean;
    arbitrumGasEth: number | null; arbitrumGasEthKnown: boolean;
    hyperliquidAccountValueUsd: number | null; hyperliquidAccountValueKnown: boolean;
    fundsArrived: boolean;
  };
  message?: string;
};

const card: React.CSSProperties = {
  padding: 24,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-lg)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', wordBreak: 'break-all' };
const label: React.CSSProperties = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--color-neutral-600)' };

function short(addr?: string | null) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function useFundingStatus(token: string | undefined) {
  const [data, setData] = useState<FundingData | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/account/funding', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not load funding status');
      setData(body);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load funding status');
    }
  }, [token]);
  useEffect(() => {
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);
  return { data, error, reload: load };
}

function QrCode({ value, size = 176 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import('qrcode').then((mod) => {
      // Interop hazard: qrcode is a CJS module; depending on the bundler's interop, the
      // functions land either directly on the namespace or on `.default`. Handle both.
      type QrModule = { toDataURL: typeof import('qrcode').toDataURL };
      const namespace = mod as unknown as QrModule & { default?: QrModule };
      const QRCode = typeof namespace.toDataURL === 'function' ? namespace : namespace.default;
      if (!QRCode) throw new Error('qrcode module missing toDataURL');
      return QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#0a1410', light: '#eaf7f0' } });
    }).then((url) => { if (!cancelled) setSrc(url); }).catch(() => { if (!cancelled) setSrc(null); });
    return () => { cancelled = true; };
  }, [value, size]);
  if (!src) return <div style={{ width: size, height: size, background: 'var(--color-neutral-100)', borderRadius: 12 }} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`QR code for ${value}`} width={size} height={size} style={{ borderRadius: 12, display: 'block' }} />;
}

function WalletConnectPanel({
  fundingData, token, onVerified,
}: { fundingData: FundingData; token: string | undefined; onVerified: () => void }) {
  const connectors = useConnectors();
  const { mutateAsync: connectAsync, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useConnection();
  const chainId = useChainId();
  const { mutateAsync: switchChainAsync, isPending: switching } = useSwitchChain();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();

  const [verifyState, setVerifyState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [verifyError, setVerifyError] = useState('');
  const [approveState, setApproveState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [approveError, setApproveError] = useState('');

  const targetChainId = arbitrumChainId();
  const wrongChain = account.isConnected && chainId !== targetChainId;

  const verifyOwnership = async () => {
    if (!account.address || !token) return;
    setVerifyState('busy'); setVerifyError('');
    try {
      const challengeRes = await fetch('/api/account/funding/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address: account.address }),
      });
      const challenge = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challenge.error || 'Could not start verification');

      const signature = await signMessageAsync({ message: challenge.message });

      const verifyRes = await fetch('/api/account/funding/verify-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subscriptionId: fundingData.subscriptionId, address: account.address,
          message: challenge.message, token: challenge.token, signature,
        }),
      });
      const verifyBody = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyBody.error || 'Verification failed');
      setVerifyState('done');
      onVerified();
    } catch (reason) {
      setVerifyState('error');
      setVerifyError(reason instanceof Error ? reason.message : 'Verification failed');
    }
  };

  const approveAgent = async () => {
    const agentAddress = fundingData.tenant?.apiWalletAddress;
    if (!agentAddress || !token) return;
    setApproveState('busy'); setApproveError('');
    try {
      const { action, nonce, typedData } = buildApproveAgentRequest(
        agentAddress as `0x${string}`,
        fundingData.tenant?.displayName || fundingData.tenant?.slug || 'cival-agent',
      );
      const signature = await signTypedDataAsync(typedData);
      const relayRes = await fetch('/api/account/funding/approve-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscriptionId: fundingData.subscriptionId, action, nonce, signature }),
      });
      const relayBody = await relayRes.json();
      if (!relayRes.ok) throw new Error(relayBody.error || 'Hyperliquid rejected the approval');
      setApproveState('done');
    } catch (reason) {
      setApproveState('error');
      setApproveError(reason instanceof Error ? reason.message : 'Approval failed');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={card}>
        <div style={label}>Step 1 — connect the wallet you already control</div>
        {!account.isConnected ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            {connectors.map((c) => (
              <button
                key={c.uid}
                className="btn btn-secondary"
                disabled={connecting}
                onClick={() => connectAsync({ connector: c })}
              >
                {connecting ? 'Connecting…' : `Connect ${c.name}`}
              </button>
            ))}
            {!walletConnectAvailable && (
              <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', alignSelf: 'center' }}>
                WalletConnect is not configured on this deployment — browser extension wallets only.
              </span>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <div style={mono}>{account.address}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {wrongChain && (
                <button className="btn btn-secondary" disabled={switching} onClick={() => switchChainAsync({ chainId: targetChainId })}>
                  {switching ? 'Switching…' : 'Switch to Arbitrum'}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => disconnect()}>Disconnect</button>
            </div>
          </div>
        )}
        {connectError && <div style={{ color: '#ffb4b4', marginTop: 10, fontSize: 13 }}>{connectError.message}</div>}
      </div>

      <div style={card}>
        <div style={label}>Step 2 — prove you control it</div>
        <p style={{ color: 'var(--color-neutral-700)', fontSize: 14, marginTop: 8 }}>
          Signs a plain text message — no transaction, no gas, no funds move. This only proves your
          connected wallet holds the private key for the address it claims.
        </p>
        <button
          className="btn btn-primary"
          disabled={!account.isConnected || verifyState === 'busy'}
          onClick={verifyOwnership}
        >
          {verifyState === 'busy' ? 'Waiting for signature…' : verifyState === 'done' ? 'Verified ✓' : 'Sign to verify ownership'}
        </button>
        {verifyState === 'error' && <div style={{ color: '#ffb4b4', marginTop: 10, fontSize: 13 }}>{verifyError}</div>}
        {fundingData.addressMismatch && (
          <div style={{ color: '#e7d991', marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
            Your verified address does not match the trading wallet already provisioned for this
            tenant ({short(fundingData.tenant?.mainWalletAddress)}). We record what you verified, but
            cannot repoint your tenant&apos;s trading account from this page — that requires support,
            since it is the control plane&apos;s host-side provisioning agent that owns tenant identity,
            not this web app.
          </div>
        )}
      </div>

      <div style={card}>
        <div style={label}>Step 3 — approve your trading agent (trade-only, no withdrawal)</div>
        <p style={{ color: 'var(--color-neutral-700)', fontSize: 14, marginTop: 8 }}>
          Signs Hyperliquid&apos;s <code>approveAgent</code> action, authorizing agent wallet{' '}
          <span style={mono}>{short(fundingData.tenant?.apiWalletAddress)}</span> to place and manage
          orders for your account. This agent can never withdraw or transfer funds — Hyperliquid
          enforces that at the protocol level, not this app.
        </p>
        <button
          className="btn btn-primary"
          disabled={!account.isConnected || !fundingData.tenant?.apiWalletAddress || approveState === 'busy'}
          onClick={approveAgent}
        >
          {approveState === 'busy' ? 'Waiting for signature…' : approveState === 'done' ? 'Agent approved ✓' : 'Sign to approve trading agent'}
        </button>
        {approveState === 'error' && <div style={{ color: '#ffb4b4', marginTop: 10, fontSize: 13 }}>{approveError}</div>}
        {!fundingData.tenant?.apiWalletAddress && (
          <div style={{ color: 'var(--color-neutral-600)', marginTop: 10, fontSize: 13 }}>
            No agent wallet has been provisioned for this tenant yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function FundingPage() {
  const { user, session, loading: authLoading } = useAuth();
  const token = session?.access_token;
  const { data, error, reload } = useFundingStatus(token);
  const copiedRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const copyAddress = (addr: string) => {
    navigator.clipboard?.writeText(addr).then(() => {
      setCopied(true);
      if (copiedRef.current) window.clearTimeout(copiedRef.current);
      copiedRef.current = window.setTimeout(() => setCopied(false), 1800);
    });
  };

  const balances = data?.balances;

  if (authLoading || !user) {
    return (
      <div className="cival">
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: 180, textAlign: 'center' }}>
          {!authLoading && !user ? (
            <Link className="btn btn-primary" href="/account/login?next=/account/funding">Sign in to continue</Link>
          ) : 'Loading…'}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh', padding: '130px 24px 90px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span className="tag tag-accent">Non-custodial</span>
          <h1 style={{ fontSize: 'clamp(30px,4.5vw,46px)', margin: '16px 0 8px' }}>Fund your trading agent</h1>
          <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 28px', maxWidth: 640 }}>
            Cival never holds your funds and never asks for a private key or seed phrase. You fund
            your own Hyperliquid account, and you personally approve the trade-only agent wallet
            that runs your strategies.
          </p>

          {error && (
            <div style={{ padding: 16, border: '1px solid #783333', background: '#240d0d', borderRadius: 'var(--radius-md)', color: '#ffb4b4', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {!data ? (
            <div style={{ color: 'var(--color-neutral-600)' }}>Loading your funding status…</div>
          ) : !data.hasTenant || !data.tenant ? (
            <div style={card}>
              <p>{data.message}</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Link className="btn btn-primary" href="/hosted">View hosting plans</Link>
                <Link className="btn btn-secondary" href="/account/hosting">Go to your hosting account</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={card}>
                <div style={label}>Network</div>
                <div style={{ marginTop: 8, fontSize: 15 }}>{data.network?.chain} · chain id {data.network?.chainId}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div>
                    <div style={label}>Settlement asset</div>
                    <div style={{ marginTop: 4 }}>{data.network?.settlementAsset} (USDC)</div>
                    <div style={{ ...mono, fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 2 }}>{data.network?.usdcContract}</div>
                  </div>
                  <div>
                    <div style={label}>Hyperliquid deposit bridge</div>
                    {data.network?.bridgeAddress ? (
                      <div style={{ ...mono, fontSize: 12, marginTop: 4 }}>{data.network.bridgeAddress}</div>
                    ) : (
                      <div style={{ marginTop: 4, color: '#e7d991' }}>Not configured yet — contact support before depositing.</div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                <div>
                  <div style={label}>Your Hyperliquid trading account</div>
                  <div style={{ ...mono, fontSize: 15, marginTop: 8 }}>{data.tenant.mainWalletAddress || 'Not provisioned yet'}</div>
                  {data.tenant.mainWalletAddress && (
                    <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => copyAddress(data.tenant!.mainWalletAddress!)}>
                      {copied ? 'Copied ✓' : 'Copy address'}
                    </button>
                  )}
                  <p style={{ color: 'var(--color-neutral-700)', fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
                    Send USDC on {data.network?.chain} to this address, then bridge it into Hyperliquid
                    (deposit destination above). Only USDC on the exact network shown will be credited —
                    anything else, or the wrong network, is unrecoverable.
                  </p>
                </div>
                {data.tenant.mainWalletAddress && <QrCode value={data.tenant.mainWalletAddress} />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
                <div style={card}>
                  <div style={label}>USDC on Arbitrum</div>
                  <div style={{ fontSize: 22, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                    {balances?.arbitrumUsdcKnown ? `$${balances.arbitrumUsdc!.toFixed(2)}` : 'Unknown'}
                  </div>
                </div>
                <div style={card}>
                  <div style={label}>Gas (ETH)</div>
                  <div style={{ fontSize: 22, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                    {balances?.arbitrumGasEthKnown ? balances.arbitrumGasEth!.toFixed(5) : 'Unknown'}
                  </div>
                </div>
                <div style={card}>
                  <div style={label}>Hyperliquid account value</div>
                  <div style={{ fontSize: 22, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                    {balances?.hyperliquidAccountValueKnown ? `$${balances.hyperliquidAccountValueUsd!.toFixed(2)}` : 'Unknown'}
                  </div>
                  {balances?.fundsArrived && <span className="tag tag-accent-2" style={{ marginTop: 8, display: 'inline-block' }}>Funds confirmed</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={reload}>Refresh balances</button>
              </div>

              <WalletConnectPanel fundingData={data} token={token} onVerified={reload} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
