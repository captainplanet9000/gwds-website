import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { CommerceError, enforceRateLimit, errorResponseBody, getSiteUrl } from '@/lib/commerce';
import { newsletterToken, normalizeNewsletterEmail } from '@/lib/newsletter';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'newsletter_subscribe', 5, 60 * 60);
    const { email: rawEmail } = await req.json() as { email?: unknown };
    const email = normalizeNewsletterEmail(rawEmail);
    const supabase = createServerClient();
    const { error } = await supabase.from('newsletter_subscribers').upsert({
      email, source: 'website_form', is_active: true, unsubscribed_at: null,
    }, { onConflict: 'email' });
    if (error) throw new CommerceError('NEWSLETTER_SAVE_FAILED', 'Subscription could not be saved.', 503);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (apiKey && from) {
      const unsubscribeUrl = `${getSiteUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(newsletterToken(email))}`;
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: email,
        subject: 'Welcome to Cival Systems',
        html: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:32px"><h1>Cival Systems</h1><p>You opted in to product updates and release notes.</p><p><a href="${getSiteUrl()}/store">Visit the store</a></p><p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}">Unsubscribe</a></p></div>`,
        text: `You opted in to Cival Systems product updates.\n\nStore: ${getSiteUrl()}/store\nUnsubscribe: ${unsubscribeUrl}`,
      }, { idempotencyKey: `newsletter-welcome-${newsletterToken(email).slice(0, 32)}` });
    }
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
