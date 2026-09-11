import { createHash } from 'node:crypto';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const BUCKET = 'downloads';

interface ProductArtifactRow {
  id: string;
  name: string;
  is_active: boolean;
  version: string | null;
  artifact_path: string | null;
  artifact_sha256: string | null;
  artifact_size_bytes: number | null;
  artifact_ready: boolean;
  updated_at: string | null;
}

type ArtifactStatus = 'ok' | 'missing' | 'size_mismatch' | 'unverified' | 'no_path';

interface StorageObjectInfo {
  fullPath: string;
  name: string;
  size: number | null;
  contentType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// The 'downloads' bucket is currently flat (artifact_path is just a filename,
// per scripts/upload-release-artifacts.mjs), but we resolve per-directory
// listings anyway so this keeps working if an artifact_path ever gains a
// subfolder. dirname('') and dirname('file.zip') both fall back to '' (root).
function dirnameOf(objectPath: string): string {
  const dir = path.posix.dirname(objectPath);
  return dir === '.' ? '' : dir;
}

async function listDirectory(
  sb: ReturnType<typeof createServerClient>,
  dir: string,
): Promise<StorageObjectInfo[]> {
  const { data, error } = await sb.storage
    .from(BUCKET)
    .list(dir, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  return (data || [])
    // Supabase storage.list() returns a placeholder row with no id for
    // "folders" it discovers; real objects always carry metadata.
    .filter((entry) => entry.id !== null)
    .map((entry) => ({
      fullPath: dir ? `${dir}/${entry.name}` : entry.name,
      name: entry.name,
      size: typeof entry.metadata?.size === 'number' ? entry.metadata.size : null,
      contentType: entry.metadata?.mimetype ?? null,
      createdAt: entry.created_at ?? null,
      updatedAt: entry.updated_at ?? null,
    }));
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();

    const { data: products, error: productsError } = await sb
      .from('products')
      .select('id,name,is_active,version,artifact_path,artifact_sha256,artifact_size_bytes,artifact_ready,updated_at')
      .order('name', { ascending: true });
    if (productsError) throw productsError;

    // Always inventory the bucket root, plus any subdirectory a product
    // actually points into, so the object list stays a real inventory even
    // if nothing in the DB references a given folder.
    const dirs = new Set<string>(['']);
    for (const product of (products || []) as ProductArtifactRow[]) {
      if (product.artifact_path) dirs.add(dirnameOf(product.artifact_path));
    }

    const objectsByDir = await Promise.all([...dirs].map((dir) => listDirectory(sb, dir)));
    const objectsByPath = new Map<string, StorageObjectInfo>();
    for (const list of objectsByDir) {
      for (const obj of list) objectsByPath.set(obj.fullPath, obj);
    }

    const referencedPaths = new Set<string>();
    const enrichedProducts = (products || []).map((product: ProductArtifactRow) => {
      const artifactPath = product.artifact_path;
      const object = artifactPath ? objectsByPath.get(artifactPath) ?? null : null;
      if (artifactPath) referencedPaths.add(artifactPath);

      const objectExists = Boolean(object);
      const actualSize = object?.size ?? null;
      const sizeMatches = !objectExists || product.artifact_size_bytes == null || actualSize == null
        ? null
        : actualSize === product.artifact_size_bytes;

      let status: ArtifactStatus;
      if (!artifactPath) status = 'no_path';
      else if (!objectExists) status = 'missing';
      else if (sizeMatches === false) status = 'size_mismatch';
      else if (!product.artifact_ready || !product.artifact_sha256 || product.artifact_size_bytes == null) status = 'unverified';
      else status = 'ok';

      // Flag anything that could burn a paying customer: active + not
      // actually safe to deliver, regardless of what artifact_ready claims.
      const dangerous = product.is_active && status !== 'ok';

      return {
        id: product.id,
        name: product.name,
        is_active: product.is_active,
        version: product.version,
        artifact_path: artifactPath,
        artifact_sha256: product.artifact_sha256,
        artifact_size_bytes: product.artifact_size_bytes,
        artifact_ready: product.artifact_ready,
        updated_at: product.updated_at,
        object_exists: objectExists,
        actual_size_bytes: actualSize,
        size_matches: sizeMatches,
        content_type: object?.contentType ?? null,
        object_updated_at: object?.updatedAt ?? null,
        status,
        dangerous,
      };
    });

    const objects = [...objectsByPath.values()].sort((a, b) => a.fullPath.localeCompare(b.fullPath));
    const orphans = objects.filter((obj) => !referencedPaths.has(obj.fullPath));

    const summary = {
      total_products: enrichedProducts.length,
      active_products: enrichedProducts.filter((p) => p.is_active).length,
      ok: enrichedProducts.filter((p) => p.status === 'ok').length,
      dangerous_active: enrichedProducts.filter((p) => p.dangerous).length,
      total_objects: objects.length,
      orphan_objects: orphans.length,
      store_safe: enrichedProducts.filter((p) => p.dangerous).length === 0,
    };

    return NextResponse.json({
      bucket: BUCKET,
      summary,
      products: enrichedProducts,
      objects: objects.map((o) => ({
        path: o.fullPath,
        name: o.name,
        size: o.size,
        content_type: o.contentType,
        created_at: o.createdAt,
        updated_at: o.updatedAt,
        referenced: referencedPaths.has(o.fullPath),
      })),
      orphans: orphans.map((o) => o.fullPath),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST { productId, adopt?: boolean }
// Re-verifies one product's artifact against the real object in storage:
// downloads it, recomputes size + sha256, and sets artifact_ready based on
// what is actually true — never on what the DB already claimed.
//
// - adopt=false (default): if the product already has a recorded
//   sha256/size, the computed values must match them for artifact_ready to
//   flip true; a mismatch is reported but the stored hash/size is left
//   alone (so a bad upload doesn't get silently "fixed" by re-baselining
//   against itself). If the product had no recorded sha256/size yet, the
//   computed values are recorded as the new baseline (nothing to contradict).
// - adopt=true: the admin is explicitly confirming the object currently in
//   storage is correct; the computed sha256/size become the new baseline.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const productId = typeof body?.productId === 'string' ? body.productId.trim() : '';
    const adopt = body?.adopt === true;
    if (!productId) {
      return NextResponse.json({ error: 'Missing required field: productId' }, { status: 400 });
    }

    const sb = createServerClient();
    const { data: product, error: fetchError } = await sb
      .from('products')
      .select('id,name,artifact_path,artifact_sha256,artifact_size_bytes,artifact_ready')
      .eq('id', productId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const now = new Date().toISOString();

    if (!product.artifact_path) {
      const updates = { artifact_ready: false, updated_at: now };
      const { data: updated, error: updateError } = await sb
        .from('products').update(updates).eq('id', productId).select().single();
      if (updateError) throw updateError;
      await sb.from('admin_audit').insert({
        action: 'artifact.verify_fail',
        resource_type: 'product',
        resource_id: productId,
        metadata: { by: admin.email, reason: 'no_artifact_path' },
      });
      return NextResponse.json({ product: updated, verified: false, reason: 'no_artifact_path' });
    }

    const { data: downloaded, error: downloadError } = await sb.storage
      .from(BUCKET)
      .download(product.artifact_path);

    if (downloadError || !downloaded) {
      // Object genuinely missing (or unreachable) — never allow ready=true here.
      const updates = { artifact_ready: false, updated_at: now };
      const { data: updated, error: updateError } = await sb
        .from('products').update(updates).eq('id', productId).select().single();
      if (updateError) throw updateError;
      await sb.from('admin_audit').insert({
        action: 'artifact.verify_fail',
        resource_type: 'product',
        resource_id: productId,
        metadata: { by: admin.email, reason: 'object_missing', artifact_path: product.artifact_path, storage_error: downloadError?.message },
      });
      return NextResponse.json({ product: updated, verified: false, reason: 'object_missing' });
    }

    const bytes = Buffer.from(await downloaded.arrayBuffer());
    const actualSize = bytes.length;
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');

    const hadBaseline = Boolean(product.artifact_sha256 && product.artifact_size_bytes != null);
    const sizeMatch = hadBaseline ? product.artifact_size_bytes === actualSize : null;
    const shaMatch = hadBaseline ? product.artifact_sha256 === actualSha256 : null;

    let updates: Record<string, unknown>;
    let reason: string;
    if (adopt) {
      updates = { artifact_size_bytes: actualSize, artifact_sha256: actualSha256, artifact_ready: true, updated_at: now };
      reason = 'adopted';
    } else if (!hadBaseline) {
      updates = { artifact_size_bytes: actualSize, artifact_sha256: actualSha256, artifact_ready: true, updated_at: now };
      reason = 'baseline_recorded';
    } else if (sizeMatch && shaMatch) {
      updates = { artifact_ready: true, updated_at: now };
      reason = 'match';
    } else {
      updates = { artifact_ready: false, updated_at: now };
      reason = sizeMatch === false ? 'size_mismatch' : 'checksum_mismatch';
    }

    const { data: updated, error: updateError } = await sb
      .from('products').update(updates).eq('id', productId).select().single();
    if (updateError) throw updateError;

    await sb.from('admin_audit').insert({
      action: updates.artifact_ready ? 'artifact.verify_pass' : 'artifact.verify_fail',
      resource_type: 'product',
      resource_id: productId,
      metadata: {
        by: admin.email,
        reason,
        adopted: adopt,
        actual_size_bytes: actualSize,
        actual_sha256: actualSha256,
        size_match: sizeMatch,
        sha_match: shaMatch,
      },
    });

    return NextResponse.json({
      product: updated,
      verified: updates.artifact_ready === true,
      reason,
      actual_size_bytes: actualSize,
      actual_sha256: actualSha256,
      size_match: sizeMatch,
      sha_match: shaMatch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
