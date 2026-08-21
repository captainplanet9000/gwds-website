import { Product } from "@/lib/products";
import { STORE_SALES_ENABLED } from "@/lib/store-config";

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.civalsystems.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? `${siteUrl}${product.image}` : `${siteUrl}/images/og-image.png`,
    brand: {
      "@type": "Brand",
      name: "Cival Systems",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/store/${product.id}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: STORE_SALES_ENABLED ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Cival Systems",
      },
    },
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
