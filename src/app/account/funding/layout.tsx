import type { ReactNode } from 'react';
import Web3Providers from '@/components/web3/Web3Providers';

export default function FundingLayout({ children }: { children: ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
