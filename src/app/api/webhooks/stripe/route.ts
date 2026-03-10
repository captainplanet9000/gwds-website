import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
import { incrementCouponUsage } from "@/lib/store-db";

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

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabase = createServerClient();

      const customerEmail = session.customer_email || session.metadata?.customer_email;
      const customerName = session.metadata?.customerName || session.metadata?.customer_name || null;

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

      // Check if a Supabase auth user exists with this email
      let authUserId: string | null = null;
      try {
        const { data: userList } = await supabase.auth.admin.listUsers();
        const matchedUser = userList?.users?.find(
          (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
        );
        if (matchedUser) authUserId = matchedUser.id;
      } catch { /* auth lookup is best-effort */ }

      // Try to find existing pending order (created during checkout)
      let order: any = null;
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_session_id", session.id)
        .single();

      if (existingOrder) {
        // Update existing order to completed
        const updateData: any = { status: "completed", total_cents: session.amount_total || 0 };
        if (authUserId) updateData.user_id = authUserId;
        const { data: updated } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", existingOrder.id)
          .select()
          .single();
        order = updated || existingOrder;
      } else {
        // No existing order — create one
        const insertData: any = {
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: customerName,
          total_cents: session.amount_total || 0,
          status: "completed",
        };
        if (authUserId) insertData.user_id = authUserId;
        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert(insertData)
          .select()
          .single();

        if (orderError || !newOrder) {
          console.error("Failed to create order:", orderError);
          return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }
        order = newOrder;
      }

      // Get line items from Stripe
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Check if order items already exist (from checkout route)
      const { data: existingItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      const downloadLinks: { productId: string; productName: string; downloadUrl: string }[] = [];

      // Only create items + tokens if they don't already exist
      if (!existingItems?.length) {
        for (let i = 0; i < lineItems.data.length; i++) {
          const item = lineItems.data[i];
          const productId = productIds[i] || `unknown-${i}`;

          await supabase.from("order_items").insert({
            order_id: order.id,
            product_id: productId,
            quantity: item.quantity || 1,
            price_cents: item.amount_total,
          });
        }
      }

      // Create download tokens (always — in case they don't exist yet)
      const { data: existingDownloads } = await supabase
        .from("downloads")
        .select("*")
        .eq("order_id", order.id);

      if (!existingDownloads?.length) {
        for (let i = 0; i < lineItems.data.length; i++) {
          const item = lineItems.data[i];
          const productId = productIds[i] || `unknown-${i}`;

          const dlToken = crypto.randomUUID();

          const { data: download } = await supabase
            .from("downloads")
            .insert({
              order_id: order.id,
              product_id: productId,
              download_token: dlToken,
              max_downloads: 999999,
              downloaded_count: 0,
              expires_at: null,
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
      } else {
        // Tokens exist — build links from them
        for (const dl of existingDownloads) {
          const productId = dl.product_id;
          const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/downloads/${order.id}/${productId}?token=${dl.download_token}`;
          const item = lineItems.data.find((_: any, idx: number) => productIds[idx] === productId);
          downloadLinks.push({
            productId,
            productName: item?.description || productId,
            downloadUrl,
          });
        }
      }

      // Increment coupon usage if one was applied
      if (session.metadata?.couponCode) {
        try {
          await incrementCouponUsage(session.metadata.couponCode);
        } catch (couponErr) {
          console.error("Failed to increment coupon usage:", couponErr);
        }
      }

      // Send confirmation email
      try {
        await sendOrderConfirmation(customerEmail, order, downloadLinks);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
