import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store — GWDS",
  description: "Browse AI templates, trading tools, prompt packs, wallpapers, NFTs, and animations. All battle-tested digital products.",
  openGraph: {
    title: "Store — GWDS",
    description: "Browse our collection of AI-powered digital products — templates, trading tools, creative assets and more.",
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
