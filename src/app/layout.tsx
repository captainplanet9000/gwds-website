import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import { LenisProvider } from "@/lib/lenis";

export const metadata: Metadata = {
  title: "GWDS — Gamma Waves Design Studio",
  description: "We design unusual digital products. AI templates, trading tools, animations, NFTs, and creative assets.",
  keywords: ["digital products", "design studio", "AI templates", "trading tools", "NFTs", "animations"],
  metadataBase: new URL("https://gwds.studio"),
  openGraph: {
    title: "GWDS — Gamma Waves Design Studio",
    description: "We design unusual digital products.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GWDS — Gamma Waves Design Studio",
    description: "We design unusual digital products.",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <CartProvider>
            <ScrollProgress />
            {children}
            <CartDrawer />
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
