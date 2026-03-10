import { Resend } from "resend";
import { getProduct } from "@/lib/products";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gwds-website.vercel.app";

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

// Product-specific taglines for emails
const productTaglines: Record<string, string> = {
  "ai-trading-dashboard": "Your AI-powered command center is ready.",
  "meme-trading-suite": "9 tabs. Zero guesswork. Your meme trading edge.",
  "flash-loan-arbitrage": "Zero-capital arbitrage across 4 DEXs. Let's find those spreads.",
  "darvas-box-agent": "Nicolas Darvas made millions with boxes. Now you have the automated version.",
  "elliott-wave-agent": "AI-powered wave counting. No more squinting at charts.",
  "vwap-agent": "VWAP breakouts with volume confirmation. Institutional-grade entries.",
  "heikin-ashi-agent": "Smoothed candles, cleaner signals. Ride trends without the noise.",
  "mean-reversion-agent": "Buy the dip, sell the rip — systematically.",
  "macro-sentiment-agent": "Fed policy, whale flows, social sentiment. The macro edge.",
  "multi-strategy-bundle": "6 strategies running in parallel. One unified system.",
  "full-stack-trader-bundle": "Dashboard + 2 agents. Everything you need to start.",
  "everything-bundle": "The entire GWDS catalog. Every tool, every agent, every update.",
};

function getProductEmoji(productId: string): string {
  const product = getProduct(productId);
  return product?.emoji || "📦";
}

function getProductFeatures(productId: string): string[] {
  const product = getProduct(productId);
  return product?.features?.slice(0, 4) || [];
}

function getProductImage(productId: string): string {
  const product = getProduct(productId);
  if (product?.image) return `${SITE_URL}${product.image}`;
  return `${SITE_URL}/images/products/shot-dashboard-stats.jpg`;
}

function getProductPrice(productId: string): number {
  const product = getProduct(productId);
  return product?.price || 0;
}

function renderProductCard(link: DownloadLink, index: number): string {
  const product = getProduct(link.productId);
  const emoji = getProductEmoji(link.productId);
  const features = getProductFeatures(link.productId);
  const tagline = productTaglines[link.productId] || "Your new trading tool is ready.";
  const imageUrl = getProductImage(link.productId);
  const price = getProductPrice(link.productId);
  const isBundle = product?.isBundle || false;
  const requiresDashboard = product?.requiresDashboard || false;

  return `
    <!-- Product Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="background-color: #1A1A2E; border-radius: 12px; overflow: hidden; border: 1px solid #2D2D44;">
          
          <!-- Product Image -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 0;">
                <img src="${imageUrl}" alt="${link.productName}" width="520" style="display: block; width: 100%; max-width: 520px; height: auto; border-radius: 12px 12px 0 0;" />
              </td>
            </tr>
          </table>

          <!-- Product Info -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 24px;">
                <!-- Name + Emoji -->
                <h3 style="margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #F8FAFC; font-family: 'Space Grotesk', Inter, -apple-system, sans-serif;">
                  ${emoji} ${link.productName}
                </h3>
                
                <!-- Tagline -->
                <p style="margin: 0 0 16px; font-size: 14px; color: #A78BFA; font-style: italic;">
                  ${tagline}
                </p>

                ${isBundle ? `
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); padding: 4px 12px; border-radius: 20px;">
                      <span style="font-size: 11px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.08em;">Bundle — Save More</span>
                    </td>
                  </tr>
                </table>` : ""}

                ${requiresDashboard ? `
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                  <tr>
                    <td style="background-color: rgba(245, 158, 11, 0.15); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.3);">
                      <span style="font-size: 11px; font-weight: 600; color: #F59E0B; letter-spacing: 0.03em;">⚡ Dashboard Plugin — Requires AI Trading Dashboard</span>
                    </td>
                  </tr>
                </table>` : ""}
                
                <!-- Features Grid -->
                ${features.length > 0 ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                  ${features.map((f, i) => i % 2 === 0 ? `
                  <tr>
                    <td width="50%" style="padding: 4px 0;">
                      <span style="font-size: 13px; color: #94A3B8;">✓ <span style="color: #CBD5E1;">${f}</span></span>
                    </td>
                    ${features[i + 1] ? `
                    <td width="50%" style="padding: 4px 0;">
                      <span style="font-size: 13px; color: #94A3B8;">✓ <span style="color: #CBD5E1;">${features[i + 1]}</span></span>
                    </td>` : '<td width="50%"></td>'}
                  </tr>` : '').join('')}
                </table>` : ""}

                <!-- Download Button -->
                <table cellpadding="0" cellspacing="0" style="margin: 0;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); border-radius: 8px; padding: 14px 32px;">
                      <a href="${link.downloadUrl}" style="color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; font-family: 'Space Grotesk', Inter, -apple-system, sans-serif; letter-spacing: 0.02em;">
                        ↓&nbsp;&nbsp;Download ${product?.isBundle ? "Bundle" : "Now"}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function renderQuickStart(productIds: string[]): string {
  const hasPlugins = productIds.some(id => {
    const p = getProduct(id);
    return p?.requiresDashboard;
  });
  const hasDashboard = productIds.includes("ai-trading-dashboard");
  const hasBundle = productIds.some(id => {
    const p = getProduct(id);
    return p?.isBundle;
  });

  let steps: string[] = [];

  if (hasDashboard || hasBundle) {
    steps = [
      "Unzip to your project directory",
      "Run <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>npm install</code>",
      "Copy <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>.env.example</code> → <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>.env.local</code> and add your API keys",
      "Run <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>npm run dev</code> and open <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>localhost:3000</code>",
    ];
  } else if (hasPlugins) {
    steps = [
      "Download the ZIP file above",
      "Extract into your dashboard's <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>plugins/</code> folder",
      "Restart your dashboard — the plugin auto-registers",
      "Configure via the plugin's settings panel",
    ];
  } else {
    steps = [
      "Download the ZIP file above",
      "Extract to your project directory",
      "Read the included <code style='background:#1A1A2E;padding:2px 6px;border-radius:4px;font-family:\"JetBrains Mono\",monospace;font-size:12px;color:#A78BFA;'>README.md</code> for setup instructions",
      "Check the docs at <a href='${SITE_URL}/docs' style='color:#8B5CF6;text-decoration:none;'>gwds-website.vercel.app/docs</a>",
    ];
  }

  return `
    <!-- Quick Start -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px; margin-bottom: 32px;">
      <tr>
        <td style="background-color: #1A1A2E; border-radius: 12px; padding: 24px; border: 1px solid #2D2D44;">
          <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #F8FAFC; font-family: 'Space Grotesk', Inter, -apple-system, sans-serif;">
            🚀 Quick Start
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${steps.map((step, i) => `
            <tr>
              <td width="28" valign="top" style="padding: 6px 0;">
                <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #8B5CF6, #6D28D9); border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; color: #FFF;">
                  ${i + 1}
                </div>
              </td>
              <td style="padding: 6px 0 6px 12px; font-size: 14px; line-height: 1.5; color: #CBD5E1;">
                ${step}
              </td>
            </tr>`).join("")}
          </table>
        </td>
      </tr>
    </table>`;
}

export async function sendOrderConfirmation(
  email: string,
  order: Order,
  downloadLinks: DownloadLink[]
) {
  const totalDollars = (order.total_cents / 100).toFixed(2);
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const productIds = downloadLinks.map(l => l.productId);
  const isSingleProduct = downloadLinks.length === 1;
  const firstProduct = downloadLinks[0];

  // Build subject line based on product
  const subject = isSingleProduct
    ? `Your ${firstProduct.productName} is ready ↓`
    : `Your ${downloadLinks.length} products are ready ↓`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - GWDS</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #07070D; color: #F8FAFC; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #07070D;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 560px; width: 100%;">
                
                <!-- Logo Bar -->
                <tr>
                  <td style="padding: 0 0 32px; text-align: center;">
                    <a href="${SITE_URL}" style="text-decoration: none;">
                      <span style="font-family: 'Space Grotesk', Inter, -apple-system, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.03em;">
                        <span style="color: #8B5CF6;">G</span><span style="color: #A78BFA;">W</span><span style="color: #C4B5FD;">D</span><span style="color: #F8FAFC;">S</span>
                      </span>
                    </a>
                  </td>
                </tr>

                <!-- Main Card -->
                <tr>
                  <td style="background-color: #0F0F1A; border-radius: 16px; overflow: hidden; border: 1px solid #1E1E35;">
                    
                    <!-- Gradient Header -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 40px 32px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1)); border-bottom: 1px solid #1E1E35;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="margin: 0 0 4px; font-size: 13px; color: #8B5CF6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Order Confirmed</p>
                                <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 800; color: #F8FAFC; font-family: 'Space Grotesk', Inter, -apple-system, sans-serif; letter-spacing: -0.02em;">
                                  ${order.customer_name ? `Hey ${order.customer_name.split(" ")[0]}` : "Hey"} — you're all set.
                                </h1>
                                <p style="margin: 0; font-size: 15px; color: #94A3B8; line-height: 1.5;">
                                  ${isSingleProduct
                                    ? productTaglines[firstProduct.productId] || "Your product is ready to download."
                                    : `${downloadLinks.length} tools ready. Your trading stack just leveled up.`}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Order Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 28px 32px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #12122A; border-radius: 10px; border: 1px solid #1E1E35;">
                            <tr>
                              <td style="padding: 16px 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50%">
                                      <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B;">Order ID</p>
                                      <p style="margin: 0; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: #CBD5E1;">${order.id}</p>
                                    </td>
                                    <td width="25%">
                                      <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B;">Date</p>
                                      <p style="margin: 0; font-size: 13px; color: #CBD5E1;">${orderDate}</p>
                                    </td>
                                    <td width="25%" style="text-align: right;">
                                      <p style="margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B;">Total</p>
                                      <p style="margin: 0; font-size: 20px; font-weight: 800; color: #10B981;">$${totalDollars}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Products Section -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 28px 32px 0;">
                          <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #F8FAFC; font-family: 'Space Grotesk', Inter, -apple-system, sans-serif;">
                            ${isSingleProduct ? "Your Product" : "Your Products"}
                          </h2>
                          ${downloadLinks.map((link, i) => renderProductCard(link, i)).join("")}
                        </td>
                      </tr>
                    </table>

                    <!-- Quick Start Guide -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 32px;">
                          ${renderQuickStart(productIds)}
                        </td>
                      </tr>
                    </table>

                    <!-- Disclaimer for dashboard plugins -->
                    ${productIds.some(id => getProduct(id)?.requiresDashboard) ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 32px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; border-radius: 6px;">
                            <tr>
                              <td style="padding: 14px 16px;">
                                <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #F59E0B;">Dashboard Plugin Notice</p>
                                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94A3B8;">
                                  Products marked as plugins require the <strong style="color: #CBD5E1;">AI Trading Dashboard</strong> to function. These are source code templates and strategy architectures — not standalone applications.
                                  <a href="${SITE_URL}/disclaimer" style="color: #F59E0B; text-decoration: none;">Full disclaimer →</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>` : ""}

                    <!-- Account CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 32px 28px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08)); border-radius: 10px; border: 1px solid rgba(139,92,246,0.2);">
                            <tr>
                              <td style="padding: 20px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td>
                                      <p style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #F8FAFC;">Access your downloads anytime</p>
                                      <p style="margin: 0 0 16px; font-size: 13px; color: #94A3B8;">Log in to your GWDS account to re-download your products and manage your purchases.</p>
                                      <table cellpadding="0" cellspacing="0">
                                        <tr>
                                          <td style="background-color: #1A1A2E; border: 1px solid #2D2D44; border-radius: 8px; padding: 10px 24px;">
                                            <a href="${SITE_URL}/account" style="color: #A78BFA; text-decoration: none; font-weight: 600; font-size: 14px;">
                                              Go to My Account →
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Support -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 32px 32px;">
                          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748B;">
                            Questions? Reply to this email or reach us at
                            <a href="mailto:gammawavesdesign@gmail.com" style="color: #8B5CF6; text-decoration: none;">gammawavesdesign@gmail.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 28px 16px; text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #475569;">
                      © ${new Date().getFullYear()} Gamma Waves Design Studio. All rights reserved.
                    </p>
                    <table cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="${SITE_URL}/store" style="font-size: 12px; color: #64748B; text-decoration: none;">Store</a>
                        </td>
                        <td style="color: #2D2D44; font-size: 12px;">·</td>
                        <td style="padding: 0 8px;">
                          <a href="${SITE_URL}/terms" style="font-size: 12px; color: #64748B; text-decoration: none;">Terms</a>
                        </td>
                        <td style="color: #2D2D44; font-size: 12px;">·</td>
                        <td style="padding: 0 8px;">
                          <a href="${SITE_URL}/privacy" style="font-size: 12px; color: #64748B; text-decoration: none;">Privacy</a>
                        </td>
                        <td style="color: #2D2D44; font-size: 12px;">·</td>
                        <td style="padding: 0 8px;">
                          <a href="${SITE_URL}/refunds" style="font-size: 12px; color: #64748B; text-decoration: none;">Refunds</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0; font-size: 11px; color: #334155;">
                      You're receiving this because you made a purchase at gwds-website.vercel.app
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

  // Plain text version
  const text = `
GWDS — Order Confirmation
${"=".repeat(40)}

${order.customer_name ? `Hey ${order.customer_name.split(" ")[0]}` : "Hey"} — you're all set.

Order ID: ${order.id}
Date: ${orderDate}
Total: $${totalDollars}

YOUR PRODUCTS
${"-".repeat(40)}
${downloadLinks.map(link => {
  const tagline = productTaglines[link.productId] || "";
  return `${getProductEmoji(link.productId)} ${link.productName}${tagline ? `\n   ${tagline}` : ""}\n   Download: ${link.downloadUrl}`;
}).join("\n\n")}

QUICK START
${"-".repeat(40)}
1. Download the ZIP file(s) above
2. Extract to your project directory
3. Run npm install
4. Check the README.md for configuration

${productIds.some(id => getProduct(id)?.requiresDashboard)
  ? "NOTE: Plugin products require the AI Trading Dashboard to function.\nThese are source code templates — not standalone applications.\n"
  : ""}
ACCESS YOUR ACCOUNT
${"-".repeat(40)}
Log in anytime to re-download: ${SITE_URL}/account

Need help? Reply to this email or contact gammawavesdesign@gmail.com

---
© ${new Date().getFullYear()} Gamma Waves Design Studio
gwds-website.vercel.app
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GWDS Store <onboarding@resend.dev>",
      to: email,
      subject,
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

