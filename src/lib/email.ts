import { Resend } from 'resend';
import { getProduct } from '@/lib/products';
import { getSiteUrl } from '@/lib/commerce';

export interface OrderEmailData {
  id: string;
  customer_name: string | null;
  total_cents: number;
  created_at: string;
  items: Array<{ product_id: string; quantity: number }>;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]!);
}

export async function sendOrderReadyEmail(email: string, order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('Transactional email is not configured');

  const resend = new Resend(apiKey);
  const siteUrl = getSiteUrl();
  const accountUrl = `${siteUrl}/account`;
  const displayName = order.customer_name?.split(/\s+/)[0] || 'there';
  const productNames = order.items.map((item) => getProduct(item.product_id)?.name || item.product_id);
  const total = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total_cents / 100);
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(order.created_at));
  const list = productNames.map((name) => `<li style="margin:8px 0">${escapeHtml(name)}</li>`).join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5ead8;color:#29251f;font-family:Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:40px 20px">
    <div style="font-size:24px;font-weight:800;margin-bottom:24px;color:#6a381f">Cival Systems</div>
    <div style="background:#fffaf1;border:1px solid #dac9ac;border-radius:24px;padding:32px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7a8a5e;font-weight:700">Payment confirmed</div>
      <h1 style="font-size:32px;line-height:1.1;margin:12px 0 14px">Your account is ready, ${escapeHtml(displayName)}.</h1>
      <p style="font-size:16px;line-height:1.6;color:#5d554a">Your Cival Systems license is attached to the account used at checkout. Sign in to create a short-lived download link whenever you need the files.</p>
      <ul style="padding-left:20px;line-height:1.5">${list}</ul>
      <a href="${accountUrl}" style="display:inline-block;margin-top:16px;background:#c67139;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px">Open my account</a>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8dbc5;font-size:13px;line-height:1.7;color:#6f665a">
        Order ${escapeHtml(order.id)}<br>${escapeHtml(date)} · ${escapeHtml(total)}
      </div>
    </div>
    <p style="font-size:12px;line-height:1.6;color:#756b5e;margin:22px 8px">Software source code only. Trading and digital assets involve substantial risk. Cival Systems does not provide financial advice or promise returns. Need help? Reply to this email or visit <a href="${siteUrl}/contact" style="color:#9d542d">support</a>.</p>
  </div>
</body></html>`;

  const text = `Cival Systems — payment confirmed

Hi ${displayName},

Your license is attached to the account used at checkout.

Products:
${productNames.map((name) => `- ${name}`).join('\n')}

Open your account to create a short-lived download link:
${accountUrl}

Order: ${order.id}
Date: ${date}
Total: ${total}

Software source code only. Trading involves substantial risk. No returns are guaranteed.`;

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    replyTo: process.env.SUPPORT_EMAIL || 'support@civalsystems.com',
    subject: `Your Cival Systems order is ready (${order.id.slice(0, 8)})`,
    html,
    text,
  }, { idempotencyKey: `order-confirmation-${order.id}` });

  if (error) throw new Error(`Email delivery failed: ${error.message}`);
  return data;
}
