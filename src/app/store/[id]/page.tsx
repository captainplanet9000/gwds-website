import { Metadata } from 'next';
import { products, getProduct, categories } from '@/lib/products';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return products.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return {};
  const cat = categories.find((c) => c.id === product.category);
  const priceStr = product.price > 0 ? `$${product.price}` : "Free";
  const title = `${product.name} — ${priceStr} | GWDS`;
  const desc = product.description.length > 160 ? product.description.slice(0, 157) + "..." : product.description;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: product.image || `/images/products/${product.id}.png`, width: 800, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.emoji} ${product.name} — ${priceStr}`,
      description: desc,
      images: [product.image || `/images/products/${product.id}.png`],
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "USD",
      "product:category": cat?.label || "",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const category = categories.find(c => c.id === product.category);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? `${siteUrl}${product.image}` : undefined,
    url: `${siteUrl}/store/${product.id}`,
    brand: { "@type": "Brand", name: "GWDS" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/store/${product.id}`,
      seller: { "@type": "Organization", name: "Gamma Waves Design Studio" },
    },
    category: category?.label || "Trading Tools",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} related={related} category={category} />
    </>
  );
}
