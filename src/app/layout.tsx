import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import { LenisProvider } from "@/lib/lenis";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrganizationJsonLd } from "@/components/JsonLd";
import TrackingPixels from "@/components/TrackingPixels";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GWDS — Gamma Waves Design Studio",
    template: "%s — GWDS",
  },
  description:
    "AI trading tools and autonomous agents. 12 production-ready products — dashboard templates, strategy agents, flash loan arbitrage, and bundles. Built for crypto traders who automate.",
  keywords: [
    "AI trading dashboard",
    "trading agents",
    "autonomous trading",
    "crypto trading tools",
    "algorithmic trading",
    "flash loan arbitrage",
    "meme coin trading",
    "Darvas Box agent",
    "Elliott Wave AI",
    "VWAP breakout",
    "trading automation",
    "Hyperliquid",
    "DeFi tools",
    "Next.js trading dashboard",
  ],
  authors: [{ name: "Gamma Waves Design Studio" }],
  creator: "Gamma Waves Design Studio",
  publisher: "Gamma Waves Design Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GWDS — AI Trading Tools",
    title: "GWDS — AI Trading Tools & Autonomous Agents",
    description: "12 production-ready AI trading tools. Dashboard templates, strategy agents, flash loan arbitrage, and bundles. From $99.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "GWDS — AI Trading Tools & Autonomous Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GWDS — AI Trading Tools & Autonomous Agents",
    description: "12 production-ready AI trading tools. Dashboard templates, strategy agents, flash loan arbitrage. From $99.",
    images: ["/images/og-image.png"],
    creator: "@GWDSofficial",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Gamma Waves Design Studio",
      alternateName: "GWDS",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
      description: "AI trading tools and autonomous agents. 12 production-ready products for crypto traders who automate.",
      sameAs: [
        "https://x.com/GWDSofficial",
        "https://github.com/captainplanet9000",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "gammawavesdesign@gmail.com",
        contactType: "Customer Service",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "GWDS — Gamma Waves Design Studio",
      description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/store?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="noise-overlay scanlines">
        <LenisProvider>
          <AuthProvider>
            <CartProvider>
              <ScrollProgress />
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </LenisProvider>
        <TrackingPixels />
        <Analytics />
          <OrganizationJsonLd />
        <SpeedInsights />
      </body>
    </html>
  );
}

