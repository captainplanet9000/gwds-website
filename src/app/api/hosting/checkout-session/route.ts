import { NextRequest, NextResponse } from "next/server";
import {
  CommerceError,
  errorResponseBody,
  requireVerifiedUser,
} from "@/lib/commerce";
import { createServerClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const body = await req.json();
    if (
      !["resume", "cancel"].includes(body.action) ||
      typeof body.subscriptionId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.subscriptionId)
    )
      throw new CommerceError(
        "INVALID_REQUEST",
        "Choose a valid checkout action.",
      );
    const db = createServerClient();
    const { data: row, error } = await db
      .from("hosting_subscriptions")
      .select("id,status,stripe_checkout_session_id")
      .eq("id", body.subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error)
      throw new CommerceError(
        "CHECKOUT_UNAVAILABLE",
        "Checkout status could not be loaded.",
        503,
      );
    if (!row || row.status !== "pending_checkout")
      throw new CommerceError(
        "CHECKOUT_NOT_PENDING",
        "This checkout is no longer pending. Refresh your account to see the current status.",
        409,
      );
    if (!row.stripe_checkout_session_id)
      throw new CommerceError(
        "CHECKOUT_NOT_READY",
        "Checkout is still being prepared. Please retry shortly.",
        409,
      );
    let checkout = await getStripe().checkout.sessions.retrieve(
      row.stripe_checkout_session_id,
    );
    if (checkout.status === "complete")
      throw new CommerceError(
        "CHECKOUT_COMPLETED",
        "Checkout is complete. Your account will update when Stripe confirms activation.",
        409,
      );
    if (body.action === "resume" && checkout.status === "open" && checkout.url)
      return NextResponse.json({ url: checkout.url });
    if (checkout.status === "open")
      checkout = await getStripe().checkout.sessions.expire(checkout.id);
    if (checkout.status !== "expired")
      throw new CommerceError(
        "CHECKOUT_NOT_EXPIRED",
        "Checkout could not be canceled. Please retry.",
        409,
      );
    const { error: updateError } = await db
      .from("hosting_subscriptions")
      .update({
        status: "incomplete_expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("user_id", user.id)
      .eq("status", "pending_checkout");
    if (updateError)
      throw new CommerceError(
        "CHECKOUT_RECONCILIATION_PENDING",
        "Checkout expired; please refresh your account shortly.",
        503,
      );
    return NextResponse.json({
      ok: true,
      message: "Checkout has expired. Choose a plan to start again.",
    });
  } catch (error) {
    return NextResponse.json(errorResponseBody(error), {
      status: error instanceof CommerceError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
