import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string; productId: string }> }
) {
  try {
    const { orderId, productId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing download token" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify download token
    const { data: download, error } = await supabase
      .from("downloads")
      .select("*")
      .eq("download_token", token)
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .single();

    if (error || !download) {
      return NextResponse.json({ error: "Invalid download token" }, { status: 404 });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(download.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "Download link expired. Please contact support." },
        { status: 403 }
      );
    }

    // Check if max downloads exceeded
    if (download.downloaded_count >= download.max_downloads) {
      return NextResponse.json(
        { error: "Download limit exceeded. Please contact support for additional downloads." },
        { status: 403 }
      );
    }

    // Increment download count
    await supabase
      .from("downloads")
      .update({ downloaded_count: download.downloaded_count + 1 })
      .eq("id", download.id);

    // TODO: Replace with actual Supabase Storage URL or CDN link
    // For now, redirect to a placeholder
    const placeholderUrl = `https://placeholder.gwds.studio/downloads/${productId}.zip`;

    // Get product info for better placeholder
    const { data: product } = await supabase
      .from("products")
      .select("name, download_url")
      .eq("id", productId)
      .single();

    if (product?.download_url) {
      return NextResponse.redirect(product.download_url);
    }

    // Return JSON response with download info for now
    return NextResponse.json({
      message: "Download ready",
      productId,
      remainingDownloads: download.max_downloads - download.downloaded_count - 1,
      expiresAt: download.expires_at,
      // TODO: Replace with actual download URL
      downloadUrl: placeholderUrl,
      note: "Actual file delivery will be implemented with Supabase Storage",
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
