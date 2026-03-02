import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getProduct } from "@/lib/products";

const ORDERS_DIR = path.join(process.cwd(), "data", "orders");

export async function POST(req: NextRequest) {
  try {
    const { items, email, name } = await req.json();

    if (!items?.length || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = `GWDS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = getProduct(item.productId);
      return {
        productId: item.productId,
        productName: product?.name || item.productId,
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    const total = orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);

    const order = {
      orderId,
      email,
      name,
      items: orderItems,
      total,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    // Save order to JSON file
    await fs.mkdir(ORDERS_DIR, { recursive: true });
    await fs.writeFile(path.join(ORDERS_DIR, `${orderId}.json`), JSON.stringify(order, null, 2));

    // TODO: Send email receipt to customer

    return NextResponse.json({ orderId, total });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
