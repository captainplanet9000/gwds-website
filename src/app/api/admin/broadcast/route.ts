import { NextRequest, NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/commerce';
import { newsletterToken } from '@/lib/newsletter';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subject, html, test } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and HTML content required' }, { status: 400 });
    }

    const sb = createServerClient();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      return NextResponse.json({ error: 'Email delivery is not configured' }, { status: 503 });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    // Get active subscribers
    const { data: subscribers } = await sb.from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (!subscribers?.length) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    // If test mode, only send to owner
    const recipients = test
      ? [process.env.SUPPORT_EMAIL || 'support@civalsystems.com']
      : subscribers.map(s => s.email);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send in batches of 10 (Resend rate limit)
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      for (const email of batch) {
        try {
          const unsubscribeUrl = `${getSiteUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(newsletterToken(email))}`;
          const { error } = await resend.emails.send({
            from,
            to: email,
            subject,
            html: `
              <div style="background:#f5ead8;color:#29251f;padding:40px;font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
                ${html}
                <hr style="border:0;border-top:1px solid #d8c8af;margin:32px 0 16px;">
                <p style="color:#6b6257;font-size:11px;">
                  You received this because you subscribed to Cival Systems updates.<br>
                  <a href="${unsubscribeUrl}" style="color:#9b5129;">Unsubscribe</a>
                </p>
              </div>
            `,
          }, { idempotencyKey: `broadcast-${newsletterToken(`${subject}:${email}`).slice(0, 32)}` });
          if (error) throw new Error(error.message);
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
