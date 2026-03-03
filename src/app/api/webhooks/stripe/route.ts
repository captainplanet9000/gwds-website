import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const supabase = createServerClient();

      // Extract metadata
      const customerEmail = session.customer_email || session.metadata?.customer_email;
      const customerName = session.metadata?.customerName || session.metadata?.customer_name || null;
      // Checkout stores items as JSON array: [{"productId":"trading-dashboard-template","quantity":1}]
      let productIds: string[] = [];
      try {
        if (session.metadata?.product_ids) {
          productIds = session.metadata.product_ids.split(",");
        } else if (session.metadata?.items) {
          const items = JSON.parse(session.metadata.items);
          productIds = items.map((i: any) => i.productId);
        }
      } catch { productIds = []; }

      if (!customerEmail) {
        console.error("No customer email in session");
        return NextResponse.json({ error: "No customer email" }, { status: 400 });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: customerName,
          total_cents: session.amount_total || 0,
          status: "completed",
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error("Failed to create order:", orderError);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      // Get line items from Stripe
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Create order items and download tokens
      const downloadLinks: { productId: string; productName: string; downloadUrl: string }[] = [];

      for (let i = 0; i < lineItems.data.length; i++) {
        const item = lineItems.data[i];
        const productId = productIds[i] || `unknown-${i}`;

        // Create order item
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: productId,
          quantity: item.quantity || 1,
          price_cents: item.amount_total,
        });

        // Create download token (expires in 7 days, max 5 downloads)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data: download } = await supabase
          .from("downloads")
          .insert({
            order_id: order.id,
            product_id: productId,
            expires_at: expiresAt.toISOString(),
            max_downloads: 5,
          })
          .select()
          .single();

        if (download) {
          const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/downloads/${order.id}/${productId}?token=${download.download_token}`;
          downloadLinks.push({
            productId,
            productName: item.description || productId,
            downloadUrl,
          });
        }
      }

      // Send confirmation email
      try {
        await sendOrderConfirmation(customerEmail, order, downloadLinks);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }

      return NextResponse.json({ received: true });
    }

    // Handle other event types if needed
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
