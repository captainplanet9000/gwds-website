'use client';

import type { FundingNetworkConfig } from '@/lib/hyperliquid-funding';
import { formatUsd, toAmount, type HistoryItem } from './funding-helpers';
import { card, label, muted } from './ui';

const cell = { padding: '10px 14px 10px 0', borderTop: '1px solid var(--color-divider)', whiteSpace: 'nowrap' as const };
const head = { ...cell, borderTop: 'none', fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-600)', textAlign: 'left' as const };

export default function HistoryTable({ cfg, items, error }: {
  cfg: FundingNetworkConfig;
  items: HistoryItem[] | null;
  error: string | null;
}) {
  return (
    <div style={card}>
      <div style={label}>History</div>
      {error ? (
        <p role="alert" style={{ ...muted, color: '#ffb4b4' }}>{error}</p>
      ) : items === null ? (
        <p style={muted}>Loading your deposits and withdrawals…</p>
      ) : items.length === 0 ? (
        <p style={muted}>No deposits or withdrawals yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Deposits and withdrawals on your Hyperliquid account
            </caption>
            <thead>
              <tr>
                <th scope="col" style={head}>Date</th>
                <th scope="col" style={head}>Type</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>Amount</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>Fee</th>
                <th scope="col" style={head}><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Link</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const amount = toAmount(item.usdc);
                const fee = toAmount(item.fee);
                return (
                  <tr key={`${item.hash}-${item.time}`}>
                    <td style={cell}>{new Date(item.time).toLocaleString()}</td>
                    <td style={cell}>
                      <span className={item.type === 'deposit' ? 'tag tag-accent-2' : 'tag tag-neutral'}>
                        {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{amount === null ? '—' : formatUsd(Math.abs(amount))}</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fee === null ? '—' : formatUsd(fee)}</td>
                    <td style={cell}>
                      {item.hash && (
                        <a href={`${cfg.hyperliquidApp}/explorer/tx/${item.hash}`} target="_blank" rel="noreferrer">
                          View<span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}> {item.type} on the Hyperliquid explorer</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
