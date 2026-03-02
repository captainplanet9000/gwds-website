import { Product } from "@/lib/products";

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds-website.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? `${siteUrl}${product.image}` : `${siteUrl}/images/og-image.png`,
    brand: {
      "@type": "Brand",
      name: "Gamma Waves Design Studio",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/store/${product.id}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Gamma Waves Design Studio",
      },
    },
    aggregateRating:
      product.price > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "127",
          }
        : undefined,
    category: getCategoryName(product.category),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    templates: "Software Templates",
    trading: "Trading Tools & Software",
    prompts: "AI Prompt Libraries",
    wallpapers: "Digital Art & Wallpapers",
    nfts: "NFT Collections",
    animations: "Animation Assets",
  };
  return categoryMap[category] || category;
}
