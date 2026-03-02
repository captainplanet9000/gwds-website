import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ORDERS_DIR = path.join(process.cwd(), "data", "orders");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const filePath = path.join(ORDERS_DIR, `${orderId}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
