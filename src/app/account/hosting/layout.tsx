import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Managed Hosting Account',
  description: 'Manage Cival Systems hosting plans, onboarding, billing, credentials, runtime health, usage and incidents.',
};

export default function HostingAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
