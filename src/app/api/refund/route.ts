import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { orderId, email, reason } = await req.json();
    if (!orderId || !email || !reason) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const sb = createServerClient();

    // Verify order exists and belongs to this email
    const { data: order } = await sb.from('orders')
      .select('id, customer_email, total_cents, status')
      .eq('id', orderId)
      .eq('customer_email', email.toLowerCase().trim())
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found for this email' }, { status: 404 });
    }

    // Save refund request to contact_submissions
    await sb.from('contact_submissions').insert({
      name: email,
      email: email.toLowerCase().trim(),
      subject: `Refund Request — Order ${orderId.slice(0, 8)}`,
      message: `Order: ${orderId}\nAmount: $${((order.total_cents || 0) / 100).toFixed(2)}\nStatus: ${order.status}\n\nReason: ${reason}`,
      status: 'new',
    });

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
            text: `⚠️ REFUND REQUEST\n\nOrder: ${orderId.slice(0, 8)}\nCustomer: ${email}\nAmount: $${((order.total_cents || 0) / 100).toFixed(2)}\nReason: ${reason}`,
            parse_mode: 'HTML',
          }),
        });
      }
    } catch {}

    // Email notification
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'GWDS <onboarding@resend.dev>',
        to: 'gammawavesdesign@gmail.com',
        subject: `⚠️ Refund Request — Order ${orderId.slice(0, 8)}`,
        html: `<p><strong>Customer:</strong> ${email}</p><p><strong>Order:</strong> ${orderId}</p><p><strong>Amount:</strong> $${((order.total_cents || 0) / 100).toFixed(2)}</p><p><strong>Reason:</strong> ${reason}</p>`,
      });
    } catch {}

    return NextResponse.json({ ok: true, message: 'Refund request submitted. We\'ll review within 48 hours.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
