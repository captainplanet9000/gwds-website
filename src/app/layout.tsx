import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
// CursorLerp removed
import ScrollProgress from "@/components/ScrollProgress";
import { LenisProvider } from "@/lib/lenis";

export const metadata: Metadata = {
  title: "GWDS — Gamma Waves Design Studio",
  description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets. Built by makers, powered by AI.",
  keywords: ["digital products", "AI templates", "trading dashboard", "NFTs", "animations", "design studio"],
  metadataBase: new URL("https://gwds.studio"),
  openGraph: {
    title: "GWDS — Gamma Waves Design Studio",
    description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GWDS — Gamma Waves Design Studio",
    description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay scanlines">
        <LenisProvider>
          <CartProvider>
            <ScrollProgress />
            {/* CursorLerp removed */}
            {children}
            <CartDrawer />
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
