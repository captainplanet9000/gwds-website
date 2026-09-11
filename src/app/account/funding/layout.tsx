import type { ReactNode } from 'react';
import FundingWeb3Providers from './providers';

export default function FundingLayout({ children }: { children: ReactNode }) {
  return <FundingWeb3Providers>{children}</FundingWeb3Providers>;
}
