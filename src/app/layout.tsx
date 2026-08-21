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
import TrackingPixels from "@/components/TrackingPixels";
import { inlineThemeBootstrap } from "@design/theme-loader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.civalsystems.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cival Systems — Trading Systems, Shipped as Source",
    template: "%s — Cival Systems",
  },
  description:
    "Versioned trading-workspace source, reproducible strategy research, and focused market extensions. Inspect the code, start in paper mode, and deploy on your own terms.",
  keywords: [
    "AI trading dashboard",
    "trading agents",
    "trading source templates",
    "crypto trading tools",
    "algorithmic trading",
    "flash loan arbitrage",
    "meme coin trading",
    "strategy research source",
    "algorithmic trading template",
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
    title: "Cival Systems — Trading Systems, Shipped as Source",
    description: "Versioned trading-workspace source, reproducible strategy research, and focused market extensions. Inspect the code, start in paper mode, and deploy on your own terms.",
    images: [
      {
        url: "/brand/cival-og-1200x630-v1.png",
        width: 1200,
        height: 630,
        alt: "Cival Systems trading workspace source templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cival Systems — Trading Systems, Shipped as Source",
    description: "Versioned trading-workspace source, reproducible strategy research, and focused market extensions. Paper mode first.",
    images: ["/brand/cival-og-1200x630-v1.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/cival-social-avatar-512-v1.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/images/apple-touch-icon.png",
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
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/cival-social-avatar-512-v1.png`,
      },
      description: "Trading workspace and strategy source-code templates for developers to inspect, test, and adapt.",
      sameAs: [
        "https://github.com/captainplanet9000",
        "https://discord.gg/EZk6gTx57k",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        url: `${siteUrl}/contact`,
        contactType: "Customer Service",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Cival Systems",
      description: "Trading workspace and strategy templates, sold as source code.",
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
        {/* Rehydrate persisted theme name before first paint to avoid FOUC. */}
        <script dangerouslySetInnerHTML={{ __html: inlineThemeBootstrap() }} />
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
        <SpeedInsights />
        <GoogleAnalytics gaId="G-L49QGMVWDK" />
      </body>
    </html>
  );
}

