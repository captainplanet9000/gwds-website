import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, productId } = await req.json();

    if (!orderId || !productId) {
      return NextResponse.json({ error: 'Missing orderId or productId' }, { status: 400 });
    }

    // Verify the order belongs to this user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email')
      .eq('id', orderId)
      .eq('customer_email', user.email)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate new download token
    const newToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Check if a download record exists
    const { data: existing } = await supabase
      .from('downloads')
      .select('id')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('downloads')
        .update({
          download_token: newToken,
          expires_at: expiresAt.toISOString(),
          downloaded_count: 0,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Failed to update download:', updateError);
        return NextResponse.json({ error: 'Failed to regenerate download' }, { status: 500 });
      }
    } else {
      // Create new download record
      const { error: insertError } = await supabase.from('downloads').insert({
        order_id: orderId,
        product_id: productId,
        download_token: newToken,
        expires_at: expiresAt.toISOString(),
        downloaded_count: 0,
        max_downloads: 5,
      });

      if (insertError) {
        console.error('Failed to create download:', insertError);
        return NextResponse.json({ error: 'Failed to regenerate download' }, { status: 500 });
      }
    }

    const downloadUrl = `/api/downloads/${orderId}/${productId}?token=${newToken}`;

    return NextResponse.json({ downloadUrl, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Regenerate download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
