import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Instance',
  description: 'Status, trading halt control, agent wallet and strategy-agent loadout for your live Cival Systems instance.',
};

export default function InstanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
