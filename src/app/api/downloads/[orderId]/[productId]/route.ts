import { NextRequest, NextResponse } from 'next/server';
import { getDownloadsByOrder, consumeDownload } from '@/lib/store-db';
import { getProduct } from '@/lib/products';

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
  const dl = downloads.find(d => d.download_token === token && d.product_id === productId);

  if (!dl) {
    return NextResponse.json({ error: 'Invalid download token' }, { status: 403 });
  }

  if (dl.downloads_remaining <= 0) {
    return NextResponse.json({ error: 'Download limit reached (max 5 downloads)' }, { status: 403 });
  }

  if (new Date(dl.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Download link expired (7 day limit)' }, { status: 403 });
  }

  // Consume one download
  await consumeDownload(dl.download_token);

  const product = getProduct(productId);

  // If product has a downloadUrl, generate a signed Supabase Storage URL
  if (product?.downloadUrl) {
    try {
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();

      // Generate a signed URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('downloads')
        .createSignedUrl(product.downloadUrl.replace('downloads/', ''), 3600);

      if (error || !data?.signedUrl) {
        console.error('Signed URL error:', error);
        return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
      }

      // Redirect to the signed URL
      return NextResponse.redirect(data.signedUrl);
    } catch (err: any) {
      console.error('Download error:', err.message);
      return NextResponse.json({ error: 'Download service error' }, { status: 500 });
    }
  }

  // No download file available yet
  const readme = `# ${product?.name || productId}\n\nThank you for your purchase!\n\nOrder: ${orderId}\n\nThis product is being prepared. You'll receive an updated download link when the files are ready.\n\nQuestions? Contact us at gammawavesdesign@gmail.com\n`;

  return new NextResponse(readme, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${product?.name || productId}-README.txt"`,
    },
  });
}
