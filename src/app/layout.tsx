import type { Metadata } from "next";
import "./globals.css";
import "./cival-theme.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import { LenisProvider } from "@/lib/lenis";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { OrganizationJsonLd } from "@/components/JsonLd";
import TrackingPixels from "@/components/TrackingPixels";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cival Systems — AI Agent Hedge Fund, Ready to Deploy",
    template: "%s — Cival Systems",
  },
  description:
    "A complete AI trading hedge fund starting point — dashboard, execution layer, risk engine, and six autonomous agents on Hyperliquid. Full TypeScript source. Editions from $99.",
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
  authors: [{ name: "Cival Systems" }],
  creator: "Cival Systems",
  publisher: "Cival Systems",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cival Systems",
    title: "Cival Systems — AI Agent Hedge Fund, Ready to Deploy",
    description: "Dashboard, execution layer, risk engine, and six autonomous agents on Hyperliquid. Full TypeScript source. Editions from $99.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cival Systems — AI Agent Hedge Fund, Ready to Deploy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cival Systems — AI Agent Hedge Fund, Ready to Deploy",
    description: "Dashboard, execution layer, risk engine, and six autonomous agents on Hyperliquid. Editions from $99.",
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
    google: "Q1fT2kRSqfGdA6iKoESkeknzmNt9Vi8ckNvCuHnJ_zg",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Cival Systems",
      alternateName: "GWDS",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
      description: "Trading infrastructure and autonomous agents, sold as source. An AI agent hedge fund starting point for Hyperliquid.",
      sameAs: [
        "https://x.com/GWDSofficial",
        "https://github.com/captainplanet9000",
        "https://discord.gg/EZk6gTx57k",
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
      name: "Cival Systems",
      description: "Trading infrastructure and autonomous agents, sold as source.",
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
        <GoogleAnalytics gaId="G-L49QGMVWDK" />
      </body>
    </html>
  );
}

