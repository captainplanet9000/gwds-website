import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (err: any) {
    console.error('Admin products GET failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Products could not be loaded.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();
  try {
    const body = await req.json();
    const {
      id, name, description, price_cents, category, badge, emoji, features,
      image_url, stripe_price_id, download_url, version, artifact_path,
      artifact_sha256, artifact_size_bytes,
    } = body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }
    if (price_cents === undefined || price_cents === null || Number.isNaN(Number(price_cents)) || Number(price_cents) < 0) {
      return NextResponse.json({ error: 'Missing or invalid required field: price_cents' }, { status: 400 });
    }

    // A brand new SKU can never be born active or artifact-ready — those must
    // be earned explicitly via a follow-up PATCH once the artifact is verified.
    // This prevents a customer from ever paying for a SKU that was created and
    // activated in the same breath, before anyone confirmed it can deliver.
    const is_active = false;
    const artifact_ready = false;

    const sb = createServerClient();
    const { data, error } = await sb
      .from('products')
      .insert({
        id: id.trim(),
        name: name.trim(),
        description: description || '',
        price_cents: Math.round(Number(price_cents)),
        category: category || null,
        badge: badge || null,
        emoji: emoji || '📦',
        features: Array.isArray(features) ? features : [],
        image_url: image_url || null,
        stripe_price_id: stripe_price_id || null,
        download_url: download_url || null,
        version: version || null,
        artifact_path: artifact_path || null,
        artifact_sha256: artifact_sha256 || null,
        artifact_size_bytes: artifact_size_bytes ? Number(artifact_size_bytes) : null,
        artifact_ready,
        is_active,
      })
      .select()
      .single();
    if (error) throw error;

    await sb.from('admin_audit').insert({
      action: 'product.create',
      resource_type: 'product',
      resource_id: data.id,
      metadata: { by: admin.email, name: data.name, price_cents: data.price_cents },
    });

    return NextResponse.json({ product: data });
  } catch (err: any) {
    if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
      return NextResponse.json({ error: 'A product with that ID already exists' }, { status: 409 });
    }
    console.error('Admin products POST failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'The product could not be created.' }, { status: 500 });
  }
}
