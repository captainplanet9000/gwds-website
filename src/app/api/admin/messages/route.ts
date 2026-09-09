import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ contacts: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin(req, ['owner', 'operator', 'support'])) return adminUnauthorized();
  try {
    const { id, status } = await req.json();
    const sb = createServerClient();
    const { error } = await sb.from('contact_submissions').update({ status }).eq('id', id);
    if (error) throw error;

    // Log reply in audit trail (real admin_audit columns are action/resource_type/resource_id/metadata)
    try {
      const { error: auditError } = await sb.from('admin_audit').insert({
        action: 'update',
        resource_type: 'contact_submission',
        resource_id: id,
        metadata: { status },
      });
      if (auditError) console.error('Audit log error:', auditError);
    } catch (auditErr) {
      console.error('Audit log error:', auditErr); // Don't fail if audit logging fails
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
