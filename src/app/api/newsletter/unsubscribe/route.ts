import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return new NextResponse('<html><body style="background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;"><h1>Invalid link</h1></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const sb = createServerClient();
  await sb.from('newsletter_subscribers').update({
    is_active: false,
    unsubscribed_at: new Date().toISOString(),
  }).eq('email', email.toLowerCase().trim());

  return new NextResponse(`
    <html>
      <body style="background:#000;color:#E8E8E8;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
        <div>
          <h1 style="font-size:2rem;margin-bottom:16px;">Unsubscribed</h1>
          <p style="color:#888;font-size:0.95rem;">You've been removed from the GWDS mailing list.</p>
          <a href="https://gwds-website.vercel.app" style="color:#8B5CF6;font-size:0.85rem;margin-top:24px;display:inline-block;">← Back to GWDS</a>
        </div>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
