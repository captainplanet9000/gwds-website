import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Managed Hosting Account',
  description: 'Manage Cival Systems managed-hosting plans, onboarding, billing, runtime health, backups, usage and incidents.',
};

export default function HostingAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
