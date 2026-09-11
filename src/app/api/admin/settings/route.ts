import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('store_settings')
      .select('theme_choice, banner_text, announcement_bar, maintenance_pause_message, updated_at')
      .eq('id', 1)
      .single();

    if (error) throw error;

    // Add read-only sales_enabled status from environment
    const salesEnabled = process.env.NEXT_PUBLIC_STORE_SALES_ENABLED === 'true';

    return NextResponse.json({
      settings: {
        ...data,
        sales_enabled: salesEnabled, // Read-only from env var
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, settings: null }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const body = await req.json();

    // Validate input
    const { theme_choice, banner_text, announcement_bar, maintenance_pause_message } = body;

    if (!['default', 'dark', 'light'].includes(theme_choice)) {
      return NextResponse.json(
        { error: 'Invalid theme_choice' },
        { status: 400 }
      );
    }

    // Get admin identity for audit
    const admin = await requireAdmin(req);
    if (!admin) return adminUnauthorized();

    // Update settings
    const { data: updated, error: updateError } = await sb.from('store_settings')
      .update({
        theme_choice,
        banner_text: banner_text || '',
        announcement_bar: announcement_bar || '',
        maintenance_pause_message: maintenance_pause_message || '',
        updated_at: new Date().toISOString(),
        updated_by: admin.userId,
      })
      .eq('id', 1)
      .select('theme_choice, banner_text, announcement_bar, maintenance_pause_message, updated_at')
      .single();

    if (updateError) throw updateError;

    // Audit log (real admin_audit columns are action/resource_type/resource_id/metadata)
    try {
      const { error: auditError } = await sb.from('admin_audit').insert({
        action: 'update_settings',
        resource_type: 'store_settings',
        resource_id: '1',
        metadata: {
          theme_choice,
          has_banner: !!banner_text,
          has_announcement: !!announcement_bar,
          has_maintenance_msg: !!maintenance_pause_message,
        },
      });
      if (auditError) console.error('Audit log error:', auditError);
    } catch (auditErr) {
      console.error('Audit log error:', auditErr);
    }

    // Add read-only sales_enabled status from environment
    const salesEnabled = process.env.NEXT_PUBLIC_STORE_SALES_ENABLED === 'true';

    return NextResponse.json({
      settings: {
        ...updated,
        sales_enabled: salesEnabled, // Read-only from env var
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, settings: null }, { status: 500 });
  }
}
