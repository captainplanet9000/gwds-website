import { notFound } from "next/navigation";
import { products, categories, getProduct } from "@/lib/products";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
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
      images: [{ url: `/images/products/${product.id}.png`, width: 800, height: 600 }],
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

  const cat = categories.find((c) => c.id === product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);

  return <ProductDetailClient product={product} category={cat || null} related={related} />;
}
