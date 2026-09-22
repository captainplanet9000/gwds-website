import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store — Source Editions & Strategy Add-ons",
  description: "Compare Cival self-hosted source editions and strategy add-ons, review setup requirements, and access version-specific installation guidance.",
  openGraph: {
    title: "Cival Systems Store — Source Editions & Strategy Add-ons",
    description: "Source editions, strategy add-ons, installation guides and managed hosting options.",
    images: [{ url: "/images/og-store.png", width: 1200, height: 630, alt: "Cival Systems Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cival Systems Store — Source Editions & Strategy Add-ons",
    description: "Source editions, strategy add-ons, installation guides and managed hosting options.",
    images: ["/images/og-store.png"],
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
