import { redirect } from 'next/navigation';

export default function LegacyReceiptPage() {
  // Account access tokens live in the browser Supabase session. Keep receipts
  // inside the authenticated account UI instead of rendering order data from a
  // guessable URL or trying to authenticate a Server Component with localStorage.
  redirect('/account');
}
