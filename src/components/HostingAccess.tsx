'use client';

import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const HostingAccessContext = createContext(false);

// Signed-in customers always enter through their account. Eligibility and billing
// are checked there; the public page never needs to fetch private account records.
export function HostingAccessProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  return <HostingAccessContext.Provider value={!loading && !user}>{children}</HostingAccessContext.Provider>;
}

export function HostingAccessButton({ children }: { children: ReactNode }) {
  const visitor = useContext(HostingAccessContext);
  return <Link className="btn btn-primary" href="/account/hosting">{visitor ? children : 'Open hosting account'}</Link>;
}

export function HostingTrialCopy({ children }: { children: ReactNode }) {
  const visitor = useContext(HostingAccessContext);
  return visitor ? <>{children}</> : null;
}
