import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { getProduct } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { items, email, name } = await req.json();

    if (!items?.length || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get product data (try Supabase first, fallback to local)
    const supabase = createServerClient();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const productIds: string[] = [];

    for (const item of items) {
      // Try to get from Supabase
      const { data: dbProduct } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .single();

      // Fallback to local products.ts
      const localProduct = getProduct(item.productId);
      const product = dbProduct || localProduct;

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      const priceInCents = dbProduct ? product.price_cents : product.price * 100;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity || 1,
      });

      productIds.push(item.productId);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/store`,
      customer_email: email,
      metadata: {
        customer_email: email,
        customer_name: name || "",
        product_ids: productIds.join(","),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
