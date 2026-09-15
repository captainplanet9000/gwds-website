'use client';

import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import {
  WITHDRAW_PRIMARY_TYPE, WITHDRAW_TYPES, withdrawDomain, type FundingNetworkConfig,
} from '@/lib/hyperliquid-funding';
import { requestJson } from './api';
import {
  checkWithdraw, formatUsd, friendlyWalletError, maxWithdrawAmount, receiveAfterFee, shortAddress,
  signatureToRsv, toAmount, type ActionGate,
} from './funding-helpers';
import { useEnsureChain } from './use-ensure-chain';
import { buttonRow, card, field, label, mono, muted, StatusLine, type ActionStatus, type BusyProps } from './ui';

// A withdrawal is Hyperliquid's withdraw3, signed by the customer's own wallet. The destination is
// always the trading account's own wallet; the server only relays what the wallet signed.
export default function WithdrawCard({
  cfg, gate, fee, withdrawable, mainWallet, accessToken, onDone, busy, setBusy,
}: BusyProps & {
  cfg: FundingNetworkConfig;
  gate: ActionGate;
  fee: number;
  withdrawable: string | null;
  mainWallet: string;
  accessToken: string;
  onDone: () => Promise<void>;
}) {
  const ensureChain = useEnsureChain();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ActionStatus>({ kind: 'idle' });

  const available = toAmount(withdrawable);
  const max = maxWithdrawAmount(withdrawable);
  const check = checkWithdraw(input, { fee, withdrawable: available });
  const disabled = !gate.allowed || busy !== null;

  const withdraw = async () => {
    if (disabled || !check.amount || check.problem) return;
    const amount = check.amount;
    setBusy('withdraw');
    try {
      setStatus({ kind: 'working', text: `Switching your wallet to ${cfg.chainName}…` });
      await ensureChain(cfg.chainId);
      setStatus({ kind: 'working', text: 'Sign the withdrawal in your wallet…' });
      const time = Date.now();
      // Hyperliquid signs the destination as a string, so it must be exactly what is sent: lowercase.
      const destination = mainWallet.toLowerCase();
      const signature = signatureToRsv(await signTypedDataAsync({
        domain: withdrawDomain(cfg),
        types: WITHDRAW_TYPES,
        primaryType: WITHDRAW_PRIMARY_TYPE,
        message: { hyperliquidChain: cfg.hyperliquidChain, destination, amount, time: BigInt(time) },
      }));
      const action = {
        type: 'withdraw3',
        hyperliquidChain: cfg.hyperliquidChain,
        signatureChainId: cfg.signatureChainId,
        destination,
        amount,
        time,
      };
      setStatus({ kind: 'working', text: 'Sending to Hyperliquid…' });
      const result = await requestJson<{ ok?: boolean; error?: string }>(
        '/api/account/funding/withdraw', accessToken, { body: { action, nonce: time, signature } },
      );
      if (result.ok !== true) throw new Error(result.error || 'Hyperliquid did not accept the withdrawal.');
      setInput('');
      setStatus({
        kind: 'done',
        text: `Withdrawal of ${amount} USDC submitted. Hyperliquid sends it, minus the $${fee} fee, to ${shortAddress(mainWallet)} on ${cfg.chainName}. It usually arrives within about 5 minutes.`,
      });
      await onDone();
    } catch (reason) {
      setStatus({ kind: 'error', text: friendlyWalletError(reason, cfg.chainName) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={card}>
      <div style={label}>Withdraw</div>
      <p style={muted}>
        Sends USDC back to your own wallet on {cfg.chainName}. It can&apos;t be sent anywhere else.
      </p>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 10 }}>
        To: <span style={mono}>{mainWallet}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 6 }}>
        Available: {available === null ? 'unknown' : formatUsd(available)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <label htmlFor="wallet-withdraw-amount" style={{ fontSize: 13 }}>Amount (USDC)</label>
        {max && available !== null && available > fee && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 32, padding: '0 14px', fontSize: 12 }}
            onClick={() => setInput(max)}
            disabled={disabled}
            aria-label={`Withdraw the maximum, ${max} USDC`}
          >
            Max
          </button>
        )}
      </div>
      <input
        id="wallet-withdraw-amount"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(check.problem)}
        style={{ ...field, marginTop: 6 }}
      />
      {check.problem && <div role="alert" style={{ color: '#ffb4b4', fontSize: 13, marginTop: 8 }}>{check.problem}</div>}
      {check.amount && !check.problem && (
        <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 8 }}>
          You receive about {formatUsd(receiveAfterFee(check.amount, fee))} after Hyperliquid&apos;s ${fee} fee.
        </div>
      )}
      <div style={buttonRow}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={withdraw}
          disabled={disabled || !check.amount || Boolean(check.problem)}
        >
          {busy === 'withdraw' ? 'Waiting for your wallet…' : 'Sign & withdraw'}
        </button>
      </div>
      {!gate.allowed && <p style={{ ...muted, fontSize: 13 }}>{gate.reason}</p>}
      <StatusLine status={status} />
    </div>
  );
}
