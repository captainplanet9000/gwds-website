'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Wallet verification, deposits, withdrawals and trading-key approval now live in the wallet panel
// on /account/hosting. Emails and older pages still link here, so forward to it. The Supabase
// session lives in the browser, so a client-side replace keeps the customer signed in; the hosting
// page sends a signed-out visitor to login and back.
export default function FundingRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/account/hosting#wallet');
  }, [router]);

  return (
    <div className="cival">
      <main style={{ minHeight: '100vh', paddingTop: 180, textAlign: 'center' }}>
        <p>Taking you to your wallet…</p>
        <Link href="/account/hosting#wallet">Continue to your wallet</Link>
      </main>
    </div>
  );
}
