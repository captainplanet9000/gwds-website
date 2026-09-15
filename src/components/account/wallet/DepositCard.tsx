'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPublicClient, erc20Abi, http, parseUnits } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { useConnection, useWriteContract } from 'wagmi';
import { USDC_DECIMALS, type FundingNetworkConfig } from '@/lib/hyperliquid-funding';
import {
  checkDeposit, depositCredited, friendlyWalletError, type ActionGate, type HistoryItem,
} from './funding-helpers';
import { useEnsureChain } from './use-ensure-chain';
import { buttonRow, Callout, card, field, label, mono, muted, StatusLine, type ActionStatus, type BusyProps } from './ui';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A deposit is a plain ERC-20 transfer to Hyperliquid's bridge, signed and sent by the customer's
// own wallet. The bridge credits the SENDING address, which is why the gate only allows it from
// the trading account's own wallet.
export default function DepositCard({
  cfg, gate, minDeposit, walletUsdc, gasEth, refreshHistory, onDone, busy, setBusy,
}: BusyProps & {
  cfg: FundingNetworkConfig;
  gate: ActionGate;
  minDeposit: number;
  walletUsdc: number | null;
  gasEth: number | null;
  refreshHistory: () => Promise<HistoryItem[]>;
  onDone: () => Promise<void>;
}) {
  const ensureChain = useEnsureChain();
  const connection = useConnection();
  const { mutateAsync: writeContractAsync } = useWriteContract();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ActionStatus>({ kind: 'idle' });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const publicClient = useMemo(
    () => createPublicClient({ chain: cfg.network === 'mainnet' ? arbitrum : arbitrumSepolia, transport: http(cfg.rpcUrl) }),
    [cfg.network, cfg.rpcUrl],
  );

  const check = checkDeposit(input, { minDeposit, walletBalance: walletUsdc, symbol: cfg.usdcSymbol, chainName: cfg.chainName });
  const tracking = status.kind === 'working';
  const disabled = !gate.allowed || busy !== null || tracking;

  const deposit = async () => {
    if (disabled || !check.amount || check.problem) return;
    const amount = check.amount;
    // Pin the account the gate just validated, BEFORE the switchChain await below can give the
    // wallet a window to change its active account. Without this, wagmi resolves the sender from
    // whatever account is live at send time (connection.accounts[0]), not the one checked here, and
    // the bridge credits whichever address actually sends -- silently, since a raw transfer has no
    // signer-recovery check on the other end the way the signed withdraw/approve actions do.
    const account = connection.address;
    if (!account) return;
    const since = Date.now();
    let link: { href: string; label: string } | undefined;
    setBusy('deposit');
    try {
      setStatus({ kind: 'working', text: `Switching your wallet to ${cfg.chainName}…` });
      await ensureChain(cfg.chainId);
      setStatus({ kind: 'working', text: 'Confirm the transfer in your wallet…' });
      const hash = await writeContractAsync({
        address: cfg.usdc,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [cfg.bridge, parseUnits(amount, USDC_DECIMALS)],
        chainId: cfg.chainId,
        account,
      });
      link = { href: `${cfg.explorer}/tx/${hash}`, label: 'View transaction' };
      setStatus({ kind: 'working', text: `Waiting for ${cfg.chainName} to confirm…` });
      const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 });
      if (receipt.status !== 'success') throw new Error(`The transfer failed on ${cfg.chainName}. No funds moved.`);
      setInput('');
      setBusy(null);
      setStatus({ kind: 'working', text: 'Confirmed. Hyperliquid usually credits a deposit within a minute…' });

      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline && mounted.current) {
        await sleep(6000);
        const items = await refreshHistory();
        if (depositCredited(items, { since, amount })) {
          await onDone();
          if (mounted.current) setStatus({ kind: 'done', text: `${amount} ${cfg.usdcSymbol} is now in your trading account.`, link });
          return;
        }
      }
      await onDone();
      if (mounted.current) {
        setStatus({
          kind: 'done',
          text: `Your transfer is confirmed on ${cfg.chainName}. Hyperliquid hasn't shown the credit yet; it will appear in your history shortly.`,
          link,
        });
      }
    } catch (reason) {
      if (mounted.current) setStatus({ kind: 'error', text: friendlyWalletError(reason, cfg.chainName), link });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={card}>
      <div style={label}>Deposit</div>
      <p style={muted}>
        Send {cfg.usdcSymbol} from your wallet on {cfg.chainName} to Hyperliquid&apos;s bridge. It is credited to your
        trading account, usually within a minute.
      </p>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 10 }}>
        In your wallet: {walletUsdc === null ? 'unknown' : `${walletUsdc.toFixed(2)} ${cfg.usdcSymbol}`}
      </div>
      {gasEth === 0 && (
        <div style={{ marginTop: 10 }}>
          <Callout tone="warning">You need a little ETH on {cfg.chainName} to pay the network fee before you can deposit.</Callout>
        </div>
      )}
      <label htmlFor="wallet-deposit-amount" style={{ display: 'block', marginTop: 14, fontSize: 13 }}>
        Amount ({cfg.usdcSymbol})
      </label>
      <input
        id="wallet-deposit-amount"
        inputMode="decimal"
        autoComplete="off"
        placeholder={`Minimum ${minDeposit}`}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(check.problem)}
        aria-describedby="wallet-deposit-help"
        style={{ ...field, marginTop: 6 }}
      />
      {check.problem && <div role="alert" style={{ color: '#ffb4b4', fontSize: 13, marginTop: 8 }}>{check.problem}</div>}
      <div style={buttonRow}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={deposit}
          disabled={disabled || !check.amount || Boolean(check.problem)}
        >
          {busy === 'deposit' ? 'Waiting for your wallet…' : 'Deposit'}
        </button>
      </div>
      {!gate.allowed && <p style={{ ...muted, fontSize: 13 }}>{gate.reason}</p>}
      <p id="wallet-deposit-help" style={{ ...muted, fontSize: 12 }}>
        Deposits under {minDeposit} {cfg.usdcSymbol} are never credited by Hyperliquid and are lost, so they are blocked
        here.{cfg.network === 'testnet' && ` Testnet uses Hyperliquid's test token (${cfg.usdcSymbol}), not Circle's test USDC.`}
      </p>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 10 }}>
        Hyperliquid bridge:{' '}
        <a href={`${cfg.explorer}/address/${cfg.bridge}`} target="_blank" rel="noreferrer" style={mono}>{cfg.bridge}</a>
        . Only deposit with this button from your own wallet: the bridge credits whichever address sends, so a transfer
        from an exchange would be lost.
      </div>
      <StatusLine status={status} />
    </div>
  );
}
