import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const sb = createServerClient();
    const { error } = await sb.from('newsletter_subscribers').upsert(
      { email: email.toLowerCase().trim(), source: 'website', is_active: true, unsubscribed_at: null },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Send welcome email via Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'GWDS <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to the GWDS Signal 📡',
        html: `
          <div style="background:#000;color:#E8E8E8;padding:40px;font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
            <h1 style="color:#8B5CF6;font-size:24px;margin-bottom:16px;">You're on the frequency.</h1>
            <p style="color:#999;font-size:15px;line-height:1.7;">
              New products, early access drops, and AI trading insights — transmitted directly to your inbox.
            </p>
            <p style="color:#666;font-size:13px;margin-top:32px;">
              — Gamma Waves Design Studio<br>
              <a href="https://gwds-website.vercel.app" style="color:#8B5CF6;">gwds-website.vercel.app</a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Unsubscribe
export async function DELETE(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const sb = createServerClient();
  await sb.from('newsletter_subscribers').update({
    is_active: false,
    unsubscribed_at: new Date().toISOString(),
  }).eq('email', email.toLowerCase().trim());

  return NextResponse.json({ ok: true });
}
