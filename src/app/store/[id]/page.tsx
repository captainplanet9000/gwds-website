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
  return {
    title: `${product.name} — GWDS`,
    description: product.description,
    openGraph: {
      title: `${product.name} — GWDS`,
      description: product.description,
      images: [{ url: product.image || `/images/products/${product.id}.png`, width: 800, height: 600 }],
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

  return <ProductDetailClient product={product} related={related} category={category} />;
}
