'use client';

import { useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getWagmiConfig } from '@/lib/wagmi-config';

// Scoped to just the /account/funding route segment so the rest of the storefront never pays
// for wagmi/viem in its bundle.
export default function FundingWeb3Providers({ children }: { children: ReactNode }) {
  const [config] = useState(() => getWagmiConfig());
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
