import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { CommerceError, enforceRateLimit, errorResponseBody } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}
function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'contact_form', 5, 60 * 60);
    const body = await req.json() as Record<string, unknown>;
    const name = text(body.name, 120);
    const email = text(body.email, 320).toLowerCase();
    const subject = text(body.subject, 160) || 'General question';
    const message = text(body.message, 5000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      throw new CommerceError('INVALID_CONTACT_REQUEST', 'Enter a valid name, email, and message.');
    }

    const supabase = createServerClient();
    const { error } = await supabase.from('contact_submissions').insert({ name, email, subject, message });
    if (error) throw new CommerceError('CONTACT_SAVE_FAILED', 'Your message could not be saved. Please try again.', 503);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const support = process.env.SUPPORT_EMAIL || 'support@civalsystems.com';
    if (apiKey && from) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: support,
        replyTo: email,
        subject: `[Cival Systems] ${subject}`,
        html: `<h2>New support message</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><div style="white-space:pre-wrap">${escapeHtml(message)}</div>`,
        text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
      }, { idempotencyKey: `contact-${hashForId(email, subject, message)}` });
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}

function hashForId(...parts: string[]): string {
  let hash = 2166136261;
  for (const character of parts.join('|')) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}
