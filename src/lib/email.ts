import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Order {
  id: string;
  customer_name: string | null;
  total_cents: number;
  created_at: string;
}

interface DownloadLink {
  productId: string;
  productName: string;
  downloadUrl: string;
}

export async function sendOrderConfirmation(
  email: string,
  order: Order,
  downloadLinks: DownloadLink[]
) {
  const totalDollars = (order.total_cents / 100).toFixed(2);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - GWDS</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0A0A0F; color: #F8FAFC;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0F;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121A; border-radius: 12px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #8B5CF6, #06B6D4); text-align: center;">
                    <h1 style="margin: 0; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 32px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
                      GWDS
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.05em; text-transform: uppercase;">
                      Gamma Waves Design Studio
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 24px; font-weight: 700; color: #F8FAFC;">
                      Thanks for your order${order.customer_name ? `, ${order.customer_name}` : ""}!
                    </h2>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94A3B8;">
                      Your payment has been processed and your digital products are ready to download.
                    </p>

                    <!-- Order Details -->
                    <div style="background-color: #1A1A2E; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid #1E293B;">
                      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8;">Order ID</p>
                      <p style="margin: 0 0 16px; font-size: 14px; font-family: 'JetBrains Mono', monospace; color: #F8FAFC;">${order.id}</p>
                      
                      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8;">Total</p>
                      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #8B5CF6;">$${totalDollars}</p>
                    </div>

                    <!-- Downloads -->
                    <h3 style="margin: 0 0 16px; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 18px; font-weight: 600; color: #F8FAFC;">
                      Your Downloads
                    </h3>
                    ${downloadLinks
                      .map(
                        (link) => `
                      <div style="background-color: #1A1A2E; border-radius: 8px; padding: 20px; margin-bottom: 12px; border: 1px solid #1E293B;">
                        <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #F8FAFC;">${link.productName}</p>
                        <a href="${link.downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                          Download Now
                        </a>
                      </div>
                    `
                      )
                      .join("")}

                    <!-- Important Info -->
                    <div style="background-color: rgba(139, 92, 246, 0.1); border-left: 3px solid #8B5CF6; padding: 16px; margin-top: 32px; border-radius: 4px;">
                      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #A78BFA;">Important</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                        • Download links expire in <strong style="color: #F8FAFC;">7 days</strong><br>
                        • You can download each product up to <strong style="color: #F8FAFC;">5 times</strong><br>
                        • Save your files to a secure location
                      </p>
                    </div>

                    <!-- Support -->
                    <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                      Need help? Reply to this email or contact us at 
                      <a href="mailto:gammawavesdesign@gmail.com" style="color: #8B5CF6; text-decoration: none;">gammawavesdesign@gmail.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #0A0A0F; border-top: 1px solid #1E293B; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
                      © ${new Date().getFullYear()} Gamma Waves Design Studio. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 12px;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" style="color: #64748B; text-decoration: none; margin: 0 8px;">Terms</a>
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color: #64748B; text-decoration: none; margin: 0 8px;">Privacy</a>
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/refunds" style="color: #64748B; text-decoration: none; margin: 0 8px;">Refunds</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
GWDS - Order Confirmation

Thanks for your order${order.customer_name ? `, ${order.customer_name}` : ""}!

Order ID: ${order.id}
Total: $${totalDollars}

YOUR DOWNLOADS:
${downloadLinks.map((link) => `${link.productName}\n${link.downloadUrl}`).join("\n\n")}

IMPORTANT:
• Download links expire in 7 days
• You can download each product up to 5 times
• Save your files to a secure location

Need help? Reply to this email or contact gammawavesdesign@gmail.com

© ${new Date().getFullYear()} Gamma Waves Design Studio
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "GWDS Store <onboarding@resend.dev>",
      to: email,
      subject: `Order Confirmation - ${order.id}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}
