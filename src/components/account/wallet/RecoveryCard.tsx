'use client';

import type { FundingNetworkConfig } from '@/lib/hyperliquid-funding';
import { card, label, mono, muted } from './ui';

export default function RecoveryCard({ cfg, wallet }: { cfg: FundingNetworkConfig; wallet: string | null }) {
  return (
    <div style={card}>
      <div style={label}>Your money, your keys</div>
      <p style={muted}>
        Your funds live in your own wallet&apos;s Hyperliquid account{wallet ? <> (<span style={mono}>{wallet}</span>)</> : null}.
        Cival never holds your seed phrase or private key.
      </p>
      <p style={muted}>
        If Cival disappears, you can still withdraw at{' '}
        <a href={cfg.hyperliquidApp} target="_blank" rel="noreferrer">{cfg.hyperliquidApp.replace('https://', '')}</a>{' '}
        by connecting the same wallet.
      </p>
      <p style={muted}>Keep your seed phrase offline. Cival will never ask for it.</p>
    </div>
  );
}
