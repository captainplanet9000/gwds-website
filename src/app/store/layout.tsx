import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store — AI Trading Tools & Agents",
  description: "12 AI trading tools from $99. Dashboard templates, autonomous strategy agents (Darvas Box, Elliott Wave, VWAP, more), flash loan arbitrage, meme trading suite, and value bundles.",
  openGraph: {
    title: "GWDS Store — AI Trading Tools & Agents",
    description: "12 production-ready AI trading tools. Dashboard templates, 6 strategy agents, flash loan arbitrage, meme trading suite. From $99.",
    images: [{ url: "/images/og-store.png", width: 1200, height: 630, alt: "GWDS Store — AI Trading Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GWDS Store — AI Trading Tools & Agents",
    description: "12 AI trading tools from $99. Dashboard, agents, arbitrage, bundles.",
    images: ["/images/og-store.png"],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
