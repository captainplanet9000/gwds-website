import { civalEmailSender } from '@/lib/email-brand';
import { NextRequest, NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/commerce';
import { newsletterToken } from '@/lib/newsletter';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req, ['owner', 'operator'])) return adminUnauthorized();
  try {
    const { subject, html, test } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and HTML content required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = civalEmailSender();
    if (!apiKey || !from) {
      return NextResponse.json({ error: 'Email delivery is not configured' }, { status: 503 });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    // A preview does not depend on the production subscriber list.
    let recipients: string[];
    if (test === true) {
      recipients = [process.env.SUPPORT_EMAIL || 'support@civalsystems.com'];
    } else {
      const { data: subscribers, error } = await createServerClient().from('newsletter_subscribers')
        .select('email').eq('is_active', true);
      if (error) return NextResponse.json({ error: 'Subscribers could not be loaded' }, { status: 503 });
      if (!subscribers?.length) return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
      recipients = subscribers.map(s => s.email);
    }

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
    console.error('Admin broadcast failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'The broadcast could not be sent.' }, { status: 500 });
  }
}
