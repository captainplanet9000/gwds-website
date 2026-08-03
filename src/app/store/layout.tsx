import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store — Editions, Agents & Extensions",
  description: "3 editions from $99, 6 strategy agents at $49, and 2 extensions at $79. Core platform, autonomous agents (Darvas Box, Elliott Wave, VWAP, more), flash loan arbitrage, and meme trading suite.",
  openGraph: {
    title: "Cival Systems Store — Editions, Agents & Extensions",
    description: "3 editions from $99, 6 strategy agents, flash loan arbitrage, meme trading suite. The full AI agent hedge fund catalogue.",
    images: [{ url: "/images/og-store.png", width: 1200, height: 630, alt: "Cival Systems Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cival Systems Store — Editions, Agents & Extensions",
    description: "3 editions from $99. Core platform, agents, arbitrage, bundles.",
    images: ["/images/og-store.png"],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
