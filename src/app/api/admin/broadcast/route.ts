import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subject, html, test } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and HTML content required' }, { status: 400 });
    }

    const sb = createServerClient();
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get active subscribers
    const { data: subscribers } = await sb.from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (!subscribers?.length) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    // If test mode, only send to owner
    const recipients = test
      ? ['gammawavesdesign@gmail.com']
      : subscribers.map(s => s.email);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send in batches of 10 (Resend rate limit)
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      for (const email of batch) {
        try {
          await resend.emails.send({
            from: 'GWDS <onboarding@resend.dev>',
            to: email,
            subject,
            html: `
              <div style="background:#000;color:#E8E8E8;padding:40px;font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
                ${html}
                <hr style="border:1px solid #222;margin:32px 0 16px;">
                <p style="color:#555;font-size:11px;">
                  You received this because you subscribed to GWDS updates.<br>
                  <a href="https://gwds-website.vercel.app/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8B5CF6;">Unsubscribe</a>
                </p>
              </div>
            `,
          });
          sent++;
        } catch (err: any) {
          failed++;
          errors.push(`${email}: ${err.message}`);
        }
      }
      // Rate limit pause between batches
      if (i + 10 < recipients.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return NextResponse.json({ sent, failed, total: recipients.length, errors: errors.slice(0, 5) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
