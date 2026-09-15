'use client';

import { useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getWagmiConfig } from '@/lib/wagmi-config';

// wagmi + react-query for the non-custodial wallet flows. Mounted only where a wallet is used (the
// /account/funding route segment, and the hosting wallet panel, which is loaded with ssr: false)
// so the rest of the storefront never pays for wagmi/viem in its bundle.
export function Web3Providers({ children }: { children: ReactNode }) {
  const [config] = useState(() => getWagmiConfig());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Providers;
