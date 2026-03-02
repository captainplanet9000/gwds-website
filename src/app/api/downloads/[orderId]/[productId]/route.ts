import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ORDERS_DIR = path.join(process.cwd(), "data", "orders");

export async function POST(_req: NextRequest, { params }: { params: Promise<{ orderId: string; productId: string }> }) {
  try {
    const { orderId, productId } = await params;

    // Verify order exists and contains product
    const orderPath = path.join(ORDERS_DIR, `${orderId}.json`);
    const orderData = JSON.parse(await fs.readFile(orderPath, "utf-8"));
    const item = orderData.items.find((i: { productId: string }) => i.productId === productId);

    if (!item) {
      return NextResponse.json({ error: "Product not found in order" }, { status: 404 });
    }

    // Placeholder: return a dummy zip file
    // TODO: Replace with actual file delivery from storage (S3, etc.)
    const content = `GWDS Digital Product: ${item.productName}\nOrder: ${orderId}\nThank you for your purchase!\n\nThis is a placeholder file. Actual product files will be delivered when the digital delivery system is connected.`;
    const buffer = Buffer.from(content, "utf-8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${productId}.zip"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
