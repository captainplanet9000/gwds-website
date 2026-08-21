import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store — Verified Source Releases",
  description: "Cival Core 2.0: a verified paper-trading operations dashboard source template with simulated orders, agent workspaces, risk views, and portable backups.",
  openGraph: {
    title: "Cival Systems Store — Verified Source Releases",
    description: "Cival Core 2.0 is a safe-by-default, paper-only operations dashboard source template.",
    images: [{ url: "/images/og-store.png", width: 1200, height: 630, alt: "Cival Systems Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cival Systems Store — Verified Source Releases",
    description: "Cival Core 2.0 is a safe-by-default, paper-only operations dashboard source template.",
    images: ["/images/og-store.png"],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
