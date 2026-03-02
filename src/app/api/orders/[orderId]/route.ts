import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getDownloadsByOrder } from '@/lib/store-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const downloads = await getDownloadsByOrder(orderId);

  return NextResponse.json({
    ...order,
    downloads: downloads.map(d => ({
      product_slug: d.product_slug,
      token: d.token,
      downloads_remaining: d.downloads_remaining,
      expires_at: d.expires_at,
    })),
  });
}
