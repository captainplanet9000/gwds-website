export type HyperliquidAccountSummary = {
  abstraction: string;
  accountValueUsd: number;
  availableUsd: number;
  marginUsedUsd: number;
};

function finite(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function summarizeHyperliquidAccount(abstraction: unknown, perp: any, spot: any): HyperliquidAccountSummary {
  const mode = String(abstraction || 'disabled');
  const unified = mode === 'unifiedAccount' || mode === 'portfolioMargin';
  const perpValue = finite(perp?.marginSummary?.accountValue);
  const perpAvailable = finite(perp?.withdrawable);
  const perpMargin = finite(perp?.marginSummary?.totalMarginUsed);
  const usdc = (spot?.balances || []).find((balance: any) => balance?.coin === 'USDC') || {};
  const spotTotal = finite(usdc.total);
  const spotHold = finite(usdc.hold);

  return {
    abstraction: mode,
    accountValueUsd: unified ? spotTotal : perpValue + spotTotal,
    availableUsd: unified
      ? Math.max(0, spotTotal - spotHold)
      : Math.max(0, perpAvailable) + Math.max(0, spotTotal - spotHold),
    marginUsedUsd: unified ? spotHold : perpMargin + spotHold,
  };
}

async function info(apiUrl: string, body: unknown) {
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Hyperliquid info request failed (${response.status})`);
  return response.json();
}

export async function readHyperliquidAccount(apiUrl: string, address: `0x${string}`): Promise<HyperliquidAccountSummary | null> {
  try {
    const [abstraction, perp, spot] = await Promise.all([
      info(apiUrl, { type: 'userAbstraction', user: address }),
      info(apiUrl, { type: 'clearinghouseState', user: address }),
      info(apiUrl, { type: 'spotClearinghouseState', user: address }),
    ]);
    if (!perp?.marginSummary || !Array.isArray(spot?.balances)) return null;
    return summarizeHyperliquidAccount(abstraction, perp, spot);
  } catch {
    return null;
  }
}
