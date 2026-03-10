import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Save to Supabase
    const sb = createServerClient();
    const { error: dbError } = await sb.from('contact_submissions').insert({
      name, email, subject: subject || 'General', message,
    });
    if (dbError) console.error('Contact DB error:', dbError);

    // Send email notification to Anthony via Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'GWDS Contact <onboarding@resend.dev>',
        to: 'gammawavesdesign@gmail.com',
        replyTo: email,
        subject: `[GWDS Contact] ${subject || 'New Message'} from ${name}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;padding:20px;">
            <h2 style="color:#333;margin-bottom:4px;">New Contact Form Submission</h2>
            <hr style="border:1px solid #eee;margin:16px 0;">
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || 'General'}</p>
            <p><strong>Message:</strong></p>
            <div style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${message}</div>
            <hr style="border:1px solid #eee;margin:16px 0;">
            <p style="color:#999;font-size:12px;">Reply directly to this email to respond to the customer.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Contact email failed:', emailErr);
    }

    // Send Telegram notification
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📩 GWDS Contact Form\n\nFrom: ${name} (${email})\nSubject: ${subject || 'General'}\n\n${message.substring(0, 500)}`,
            parse_mode: 'HTML',
          }),
        });
      }
    } catch { /* Telegram notification is best-effort */ }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
