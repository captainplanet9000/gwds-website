'use client';

// Deposit & Withdraw for a hosted workspace. NON-CUSTODIAL: the customer's funds sit in their own
// wallet's Hyperliquid account. Verification, deposits, withdrawals and the trading-key approval
// are all signed inside the customer's own wallet via wagmi; this panel never sees a private key or
// seed phrase, and the server only relays what the wallet already signed.
//
// Everything is driven by GET /api/account/funding (state, network config, balances), refreshed
// after every action and every 20 seconds while the page is visible.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useConnection } from 'wagmi';
import Web3Providers from '@/components/web3/Web3Providers';
import { ApiError, requestJson } from './wallet/api';
import {
  actionGate, formatUsd, resolveState, shortAddress, tenantWallets, toAmount,
  type FundingResponse, type HistoryItem,
} from './wallet/funding-helpers';
import DepositCard from './wallet/DepositCard';
import HistoryTable from './wallet/HistoryTable';
import RecoveryCard from './wallet/RecoveryCard';
import TradingKeyCard from './wallet/TradingKeyCard';
import VerifyWalletCard from './wallet/VerifyWalletCard';
import WalletConnectionControls from './wallet/WalletConnectionControls';
import WithdrawCard from './wallet/WithdrawCard';
import { autoGrid, BalanceTile, Callout, card, label, mono, muted, type BusyKey } from './wallet/ui';

type Props = { accessToken: string; subscriptionId: string; onChanged?: () => void };

const root: CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 'clamp(16px, 4vw, 26px)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-lg)',
  marginBottom: 18,
  minWidth: 0,
  scrollMarginTop: 110,
};

function formatEth(value: number | null): string {
  if (value === null) return 'Unknown';
  if (value === 0) return '0 ETH';
  return value < 0.00001 ? '<0.00001 ETH' : `${value.toFixed(5)} ETH`;
}

function useFundingStatus(accessToken: string, subscriptionId: string) {
  const [data, setData] = useState<FundingResponse | null>(null);
  const [error, setError] = useState<{ message: string; code: string | null } | null>(null);
  // Polls can overlap a manual refresh; only the newest response may land.
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    try {
      const body = await requestJson<FundingResponse>(
        `/api/account/funding?subscriptionId=${encodeURIComponent(subscriptionId)}`, accessToken,
      );
      if (request !== latest.current) return;
      setData(body);
      setError(null);
    } catch (reason) {
      if (request !== latest.current) return;
      setError({
        message: reason instanceof Error ? reason.message : 'Your wallet status could not be loaded.',
        code: reason instanceof ApiError ? reason.code : null,
      });
    }
  }, [accessToken, subscriptionId]);

  useEffect(() => {
    load();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    const timer = window.setInterval(refreshIfVisible, 20_000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [load]);

  return { data, error, reload: load };
}

export default function HostingWalletPanel(props: Props) {
  return (
    <Web3Providers>
      <WalletPanel {...props} />
    </Web3Providers>
  );
}

function WalletPanel({ accessToken, subscriptionId, onChanged }: Props) {
  const { data, error, reload } = useFundingStatus(accessToken, subscriptionId);
  const connection = useConnection();
  const [busy, setBusy] = useState<BusyKey | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);

  const state = error?.code === 'NETWORK_UNKNOWN' ? 'network_unknown' : resolveState(data?.state);
  const cfg = data?.config ?? null;
  const { mainWallet, apiWallet } = tenantWallets(data?.tenant);
  const ready = state === 'ready';

  const loadHistory = useCallback(async (): Promise<HistoryItem[]> => {
    try {
      const body = await requestJson<{ items?: HistoryItem[] }>('/api/account/funding/history', accessToken);
      const items = Array.isArray(body.items) ? body.items : [];
      setHistory(items);
      setHistoryError(null);
      return items;
    } catch (reason) {
      setHistoryError(reason instanceof Error ? reason.message : 'Your history is unavailable right now.');
      return [];
    }
  }, [accessToken]);

  // History follows every status refresh while the workspace is ready.
  useEffect(() => {
    if (ready) loadHistory();
  }, [ready, data, loadHistory]);

  // /account/funding redirects to /account/hosting#wallet; the anchor only exists once this
  // client-only panel has loaded, so bring it into view here.
  useEffect(() => {
    if (!data || scrolled.current) return;
    scrolled.current = true;
    if (window.location.hash === '#wallet') rootRef.current?.scrollIntoView({ block: 'start' });
  }, [data]);

  const onDone = useCallback(async () => {
    await reload();
    onChanged?.();
  }, [reload, onChanged]);

  const busyProps = { busy, setBusy };
  const gateInput = { state: state ?? 'network_unknown', hasConfig: Boolean(cfg), mainWallet, connectedAddress: connection.address } as const;
  const fundsGate = actionGate({ ...gateInput, purpose: 'funds' });
  const approveGate = actionGate({ ...gateInput, purpose: 'approve' });
  const agentName = data?.tenant?.displayName || data?.tenant?.slug || 'cival-agent';
  const balances = data?.balances ?? null;
  const walletUsdc = toAmount(balances?.walletUsdc);
  const gasEth = toAmount(balances?.gasEth);
  const accountValue = toAmount(balances?.accountValue);
  const withdrawable = toAmount(balances?.withdrawable);
  const keyNeedsApproval = Boolean(apiWallet) && data?.agentApproved !== true;

  const tradingKeyCard = cfg && (
    <TradingKeyCard
      cfg={cfg}
      gate={approveGate}
      agentApproved={data?.agentApproved ?? null}
      apiWallet={apiWallet}
      agentName={agentName}
      subscriptionId={subscriptionId}
      accessToken={accessToken}
      onDone={onDone}
      {...busyProps}
    />
  );

  return (
    <div ref={rootRef} style={root}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px' }}>Deposit &amp; withdraw</h2>
          <p style={{ ...muted, margin: 0 }}>
            Your funds stay in your own wallet&apos;s Hyperliquid account. Every deposit and withdrawal is signed by you.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {cfg && state !== 'network_unknown' && (cfg.network === 'testnet'
            ? <span className="tag tag-neutral">Testnet — not real money</span>
            : <span className="tag tag-accent-2">Mainnet</span>)}
          {data && (
            <button type="button" className="btn btn-secondary" onClick={() => reload()} disabled={busy !== null}>
              Refresh
            </button>
          )}
        </div>
      </div>

      {error && data && state !== 'network_unknown' && (
        <p role="status" style={{ ...muted, margin: 0, color: '#e7d991', fontSize: 13 }}>
          Couldn&apos;t refresh just now ({error.message}). Showing the last status we loaded.
        </p>
      )}

      {!data && !error && <p style={{ ...muted, margin: 0 }}>Loading your wallet…</p>}

      {!data && error && state !== 'network_unknown' && (
        <Callout tone="error" role="alert" title="Your wallet status could not be loaded">
          {error.message}
          <div style={{ marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => reload()}>Try again</button>
          </div>
        </Callout>
      )}

      {data && state === null && (
        <Callout tone="error" role="alert" title="Your wallet status couldn't be read">
          Refresh the page, and <Link href="/contact">contact support</Link> if it keeps happening.
        </Callout>
      )}

      {state === 'no_tenant' && (
        <p style={{ ...muted, margin: 0 }}>
          Funding opens once your payment is confirmed. You&apos;ll then verify the wallet that holds your funds, and
          deposits and withdrawals will appear here.
        </p>
      )}

      {state === 'awaiting_wallet' && (
        <>
          <VerifyWalletCard
            accessToken={accessToken}
            subscriptionId={subscriptionId}
            verifiedAddress={data?.verifiedAddress ?? null}
            prominent
            onVerified={onDone}
            {...busyProps}
          />
          <p style={{ ...muted, margin: 0, fontSize: 13 }}>Deposits and withdrawals open here once setup finishes.</p>
        </>
      )}

      {state === 'provisioning' && (
        <>
          <Callout
            tone="info"
            role="status"
            title={data?.verifiedAddress
              ? <>Your trading account will be <span style={mono}>{data.verifiedAddress}</span>.</>
              : 'Your workspace is being set up.'}
          >
            Setup finishes automatically. Deposits and withdrawals stay off until then, so your first deposit lands in
            the account your agents trade.
          </Callout>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              Verified the wrong wallet? Verify the right one before setup finishes.
            </summary>
            <div style={{ marginTop: 12 }}>
              <VerifyWalletCard
                accessToken={accessToken}
                subscriptionId={subscriptionId}
                verifiedAddress={data?.verifiedAddress ?? null}
                prominent={false}
                onVerified={onDone}
                {...busyProps}
              />
            </div>
          </details>
          {cfg && <RecoveryCard cfg={cfg} wallet={data?.verifiedAddress ?? null} />}
        </>
      )}

      {state === 'network_unknown' && (
        <>
          <Callout tone="warning" role="status" title="We can't confirm which Hyperliquid network your workspace uses">
            To keep your funds safe, nothing can be signed here until support confirms it.{' '}
            <Link href="/contact">Contact support</Link>
            {data?.tenant?.slug ? ` and mention workspace ${data.tenant.slug}` : ''}. Your funds are not affected: they
            stay in your own wallet&apos;s Hyperliquid account.
          </Callout>
          {mainWallet && (
            <div style={card}>
              <div style={label}>Trading account</div>
              <div style={{ ...mono, marginTop: 8 }}>{mainWallet}</div>
            </div>
          )}
        </>
      )}

      {ready && data && (!cfg || !mainWallet) && (
        <Callout tone="error" role="alert" title="Your trading account details are incomplete">
          Nothing can be signed until this is fixed. <Link href="/contact">Contact support</Link>.
        </Callout>
      )}

      {ready && data && cfg && mainWallet && (
        <>
          {data.addressMismatch && (
            <Callout tone="warning" title="The wallet you verified isn't your trading account">
              You verified {shortAddress(data.verifiedAddress)}, but your workspace trades for {shortAddress(mainWallet)}.
              Deposits and withdrawals always use the trading account. To change it, <Link href="/contact">contact support</Link>.
            </Callout>
          )}

          {keyNeedsApproval && tradingKeyCard}

          <div style={autoGrid(150)}>
            <BalanceTile title="Trading account value" value={accountValue === null ? 'Unknown' : formatUsd(accountValue)} />
            <BalanceTile title="Available to withdraw" value={withdrawable === null ? 'Unknown' : formatUsd(withdrawable)} />
            <BalanceTile
              title={`In your wallet (${cfg.usdcSymbol})`}
              value={walletUsdc === null ? 'Unknown' : walletUsdc.toFixed(2)}
              note={`On ${cfg.chainName}`}
            />
            <BalanceTile title="Gas" value={formatEth(gasEth)} note={gasEth === 0 ? 'Needed to deposit' : `On ${cfg.chainName}`} />
          </div>

          <div style={card}>
            <div style={label}>Your wallet</div>
            {!connection.address && (
              <p style={muted}>Connect your trading account&apos;s wallet ({shortAddress(mainWallet)}) to deposit or withdraw.</p>
            )}
            <WalletConnectionControls expectedAddress={mainWallet} targetChainId={cfg.chainId} targetChainName={cfg.chainName} />
          </div>

          <div style={autoGrid(280)}>
            <DepositCard
              cfg={cfg}
              gate={fundsGate}
              minDeposit={data.minDepositUsdc}
              walletUsdc={walletUsdc}
              gasEth={gasEth}
              refreshHistory={loadHistory}
              onDone={onDone}
              {...busyProps}
            />
            <WithdrawCard
              cfg={cfg}
              gate={fundsGate}
              fee={data.withdrawFeeUsdc}
              withdrawable={balances?.withdrawable ?? null}
              mainWallet={mainWallet}
              accessToken={accessToken}
              onDone={onDone}
              {...busyProps}
            />
          </div>

          <HistoryTable cfg={cfg} items={history} error={historyError} />

          {!keyNeedsApproval && tradingKeyCard}

          <RecoveryCard cfg={cfg} wallet={mainWallet} />
        </>
      )}
    </div>
  );
}
