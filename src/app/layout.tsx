import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import { LenisProvider } from "@/lib/lenis";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GWDS — Gamma Waves Design Studio",
    template: "%s — GWDS",
  },
  description:
    "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets. Built by makers, powered by AI.",
  keywords: [
    "digital products",
    "AI templates",
    "trading dashboard",
    "trading tools",
    "NFTs",
    "animations",
    "design studio",
    "prompt packs",
    "wallpapers",
    "Next.js templates",
    "trading agents",
    "AI art",
    "claymation",
    "3D renders",
  ],
  authors: [{ name: "Gamma Waves Design Studio" }],
  creator: "Gamma Waves Design Studio",
  publisher: "Gamma Waves Design Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GWDS — Gamma Waves Design Studio",
    title: "GWDS — Gamma Waves Design Studio",
    description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "GWDS — Gamma Waves Design Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GWDS — Gamma Waves Design Studio",
    description: "We design unusual digital products.",
    images: ["/images/og-image.png"],
    creator: "@gwds_studio",
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
      description: "Digital products studio crafting AI templates, trading tools, animations, NFTs, and creative assets.",
      sameAs: [
        "https://twitter.com/gwds_studio",
        // Add other social profiles when available
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@gwds.studio",
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
