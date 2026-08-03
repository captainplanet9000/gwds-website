import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Cival Systems. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ paddingTop: 72, minHeight: "100vh", background: "var(--color-bg)" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
          <h6 style={{ marginBottom: 12 }}>Legal</h6>
          <h1
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-neutral-600)", fontSize: 13, marginBottom: 48 }}>
            Last updated: March 2, 2026
          </p>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              1. Information We Collect
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              When you purchase from Cival Systems, we collect:
            </p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Email address:</strong> For order confirmation and download links
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Name:</strong> Optional, for personalized communication
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Payment information:</strong> Processed securely by Stripe (we never store card details)
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Order history:</strong> Products purchased, timestamps, order IDs
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Technical data:</strong> IP address, browser type, device information (for security and fraud
                prevention)
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              2. How We Use Your Information
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>We use your data to:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Process and fulfill your orders</li>
              <li style={{ marginBottom: 8 }}>Send order confirmations and download links</li>
              <li style={{ marginBottom: 8 }}>Provide customer support</li>
              <li style={{ marginBottom: 8 }}>Send important updates about your purchases (security notices, download expiration warnings)</li>
              <li style={{ marginBottom: 8 }}>Prevent fraud and ensure security</li>
              <li style={{ marginBottom: 8 }}>Improve our products and services</li>
            </ul>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: "var(--color-text)" }}>We will NEVER sell your data to third parties.</strong>
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              3. Third-Party Services
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>We use the following trusted services:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Stripe:</strong> Payment processing (see{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener">
                  Stripe Privacy Policy
                </a>
                )
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Supabase:</strong> Database and file storage (see{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener">
                  Supabase Privacy Policy
                </a>
                )
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Resend:</strong> Transactional emails (see{" "}
                <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">
                  Resend Privacy Policy
                </a>
                )
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Vercel:</strong> Website hosting (see{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">
                  Vercel Privacy Policy
                </a>
                )
              </li>
            </ul>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              These services only receive the minimum data necessary to perform their functions.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              4. Data Security
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>We protect your data through:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>HTTPS encryption for all data transmission</li>
              <li style={{ marginBottom: 8 }}>Secure, industry-standard database storage</li>
              <li style={{ marginBottom: 8 }}>Payment processing via PCI-compliant Stripe (we never handle card data directly)</li>
              <li style={{ marginBottom: 8 }}>Time-limited download tokens with expiration</li>
              <li style={{ marginBottom: 8 }}>Regular security audits and updates</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              5. Data Retention
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>We retain your data:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Order data:</strong> Indefinitely for accounting and support purposes
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Download tokens:</strong> 7 days after purchase (then expired, not deleted)
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Email communications:</strong> As long as necessary for support
              </li>
            </ul>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              You can request data deletion at any time (see &quot;Your Rights&quot; below).
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              6. Your Rights (GDPR &amp; CCPA)
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>You have the right to:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Access:</strong> Request a copy of your data
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Correct:</strong> Update inaccurate information
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Delete:</strong> Request deletion of your data (with exceptions for legal/accounting
                requirements)
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Object:</strong> Opt out of marketing communications
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Portability:</strong> Receive your data in a machine-readable format
              </li>
            </ul>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              To exercise these rights, contact us at{" "}
              <a href="mailto:gammawavesdesign@gmail.com">
                gammawavesdesign@gmail.com
              </a>
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              7. Cookies &amp; Tracking
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>We use minimal tracking:</p>
            <ul style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Essential cookies:</strong> Shopping cart, checkout session (required for functionality)
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Analytics:</strong> Basic traffic stats (anonymized, no personal data)
              </li>
            </ul>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              We do NOT use third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              8. Children&apos;s Privacy
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Our services are not directed to individuals under 18. We do not knowingly collect data from children. If you believe we have
              collected data from a child, contact us immediately.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              9. Changes to Privacy Policy
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              We may update this policy periodically. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use
              constitutes acceptance of changes.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              10. Contact Us
            </h2>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 16, lineHeight: 1.7, marginBottom: 8 }}>
              For privacy-related questions or requests:
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Email:{" "}
              <a href="mailto:gammawavesdesign@gmail.com">
                gammawavesdesign@gmail.com
              </a>
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7 }}>
              Support:{" "}
              <a href="mailto:gammawavesdesign@gmail.com">
                gammawavesdesign@gmail.com
              </a>
            </p>
          </section>

          <div className="card" style={{ padding: 24, marginTop: 48 }}>
            <p style={{ color: "var(--color-neutral-700)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "var(--color-text)" }}>Cival Systems</strong>
              <br />
              Digital Products &amp; Creative Tools
              <br />© {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
