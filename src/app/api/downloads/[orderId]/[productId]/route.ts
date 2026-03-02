import { NextRequest, NextResponse } from 'next/server';
import { getDownloadsByOrder, consumeDownload } from '@/lib/store-db';
import { getProduct } from '@/lib/products';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string; productId: string }> }
) {
  const { orderId, productId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Download token required' }, { status: 400 });
  }

  // Verify token belongs to this order and product
  const downloads = await getDownloadsByOrder(orderId);
  const dl = downloads.find(d => d.token === token && d.product_slug === productId);

  if (!dl) {
    return NextResponse.json({ error: 'Invalid download token' }, { status: 403 });
  }

  if (dl.downloads_remaining <= 0) {
    return NextResponse.json({ error: 'Download limit reached (max 3 downloads)' }, { status: 403 });
  }

  if (new Date(dl.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Download link expired (7 day limit)' }, { status: 403 });
  }

  // Consume one download
  await consumeDownload(token);

  // Check for actual file
  const product = getProduct(productId);
  const fileName = `${productId}.zip`;
  const filePath = path.join(process.cwd(), 'products', fileName);

  try {
    const stat = await fs.stat(filePath);
    const file = await fs.readFile(filePath);
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${product?.name || productId}.zip"`,
        'Content-Length': stat.size.toString(),
      },
    });
  } catch {
    // No file yet — return a placeholder README
    const readme = `# ${product?.name || productId}\n\nThank you for your purchase!\n\nOrder: ${orderId}\n\nThis product is being prepared. You'll receive an updated download link when the files are ready.\n\nQuestions? Contact us at gammawavesdesign@gmail.com\n`;
    
    return new NextResponse(readme, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${product?.name || productId}-README.txt"`,
      },
    });
  }
}
