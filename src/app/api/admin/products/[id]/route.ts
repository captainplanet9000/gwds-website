import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

const EDITABLE_FIELDS = [
  'name', 'description', 'price_cents', 'category', 'badge', 'emoji', 'features',
  'image_url', 'stripe_price_id', 'download_url', 'is_active', 'version',
  'artifact_path', 'artifact_sha256', 'artifact_size_bytes', 'artifact_ready',
] as const;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const { id } = await params;
    const sb = createServerClient();
    const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();
  try {
    const { id } = await params;
    const body = await req.json();
    const sb = createServerClient();

    const { data: existing, error: fetchError } = await sb
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // ---------------------------------------------------------------------
    // CRITICAL GUARD: never let a product go live without a ready artifact.
    // If this SKU is (or is being made) active, artifact_ready must be (or
    // stay) true — otherwise a customer pays via Stripe and then hits a 500
    // trying to download something that was never actually staged.
    // Evaluated against the MERGED state so this can't be bypassed by
    // omitting one of the two fields from the request body.
    // ---------------------------------------------------------------------
    const effectiveIsActive = 'is_active' in body ? Boolean(body.is_active) : existing.is_active;
    const effectiveArtifactReady = 'artifact_ready' in body ? Boolean(body.artifact_ready) : existing.artifact_ready;
    if (effectiveIsActive && !effectiveArtifactReady) {
      return NextResponse.json(
        {
          error: 'ARTIFACT_NOT_READY',
          message: `Cannot activate "${existing.name}": artifact_ready is false. A customer would pay and then get a failed download. Mark the artifact ready (verified upload + checksum) before activating this product.`,
        },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) updates[field] = body[field];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }
    if ('price_cents' in updates) {
      const cents = Number(updates.price_cents);
      if (Number.isNaN(cents) || cents < 0) {
        return NextResponse.json({ error: 'price_cents must be a non-negative number' }, { status: 400 });
      }
      updates.price_cents = Math.round(cents);
    }
    if ('features' in updates && !Array.isArray(updates.features)) {
      return NextResponse.json({ error: 'features must be an array' }, { status: 400 });
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await sb
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const action = 'is_active' in updates
      ? (updates.is_active ? 'product.activate' : 'product.deactivate')
      : 'product.update';

    await sb.from('admin_audit').insert({
      action,
      resource_type: 'product',
      resource_id: id,
      metadata: {
        by: admin.email,
        changes: updates,
        previous: Object.fromEntries(Object.keys(updates).map((k) => [k, (existing as any)[k]])),
      },
    });

    return NextResponse.json({ product: data });
  } catch (err: any) {
    if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
      return NextResponse.json({ error: 'A product with that Stripe price ID or ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, ['owner']);
  if (!admin) return adminUnauthorized();
  try {
    const { id } = await params;
    const sb = createServerClient();

    const { data: existing, error: fetchError } = await sb
      .from('products')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) {
      // order_items/downloads reference products with ON DELETE RESTRICT —
      // a product with sales history physically cannot be deleted.
      if (error.message?.includes('violates foreign key') || error.message?.includes('restrict')) {
        return NextResponse.json(
          { error: 'This product has order or download history and cannot be deleted. Deactivate it instead.' },
          { status: 409 },
        );
      }
      throw error;
    }

    await sb.from('admin_audit').insert({
      action: 'product.delete',
      resource_type: 'product',
      resource_id: id,
      metadata: { by: admin.email, name: existing.name },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
