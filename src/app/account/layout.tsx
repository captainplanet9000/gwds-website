import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your Cival Systems account, view purchases, and download your products.',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
