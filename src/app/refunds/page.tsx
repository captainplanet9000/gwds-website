import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "The 30-day refund request window and review process for Cival Systems digital products.",
};

const sectionHeadingStyle: CSSProperties = { fontSize: 24, margin: "0 0 16px" };
const bodyStyle: CSSProperties = { fontSize: 16, lineHeight: 1.7, color: "var(--color-neutral-800)", margin: "0 0 16px" };
const listStyle: CSSProperties = { fontSize: 16, lineHeight: 1.7, color: "var(--color-neutral-800)", marginLeft: 24, marginBottom: 16, display: "grid", gap: 8 };

export default function RefundsPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ paddingTop: 150, paddingBottom: 96, minHeight: "100vh" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <h6 style={{ marginBottom: 14 }}>Legal</h6>
          <h1 style={{ fontSize: "clamp(34px,4.2vw,50px)", letterSpacing: "-0.015em", marginBottom: 16 }}>Refund Policy</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-neutral-600)", marginBottom: 48 }}>
            Last updated: August 13, 2026
          </p>

          <div
            style={{
              background: "var(--color-accent-100)",
              borderRadius: "calc(var(--radius-lg) * 1.15)",
              padding: 32,
              marginBottom: 48,
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: 28, color: "var(--color-accent-900)", marginBottom: 12 }}>30-Day Money-Back Guarantee</h2>
            <p style={{ color: "var(--color-accent-800)", fontSize: 17, lineHeight: 1.7, margin: 0 }}>
              We stand behind our products. Eligible purchases may be refunded when requested within 30 days, subject to the review and abuse exclusions below.
            </p>
          </div>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>1. Eligibility</h2>
            <p style={bodyStyle}>You are eligible for a full refund if:</p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Timeframe:</strong> Request is made within 30 days of purchase
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Order:</strong> The request concerns a completed purchase made through your verified account
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Reason:</strong> You provide enough detail for us to identify the issue and review the request
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>2. Not Eligible</h2>
            <p style={bodyStyle}>Refunds cannot be issued if:</p>
            <ul style={listStyle}>
              <li>More than 30 days have passed since purchase</li>
              <li>You have resold, shared, or distributed the product</li>
              <li>The request is based solely on trading losses, performance, or a financial outcome</li>
              <li>The request is fraudulent, abusive, or duplicates a refund already issued for the order</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>3. How to Request a Refund</h2>
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "calc(var(--radius-lg) * 1.15)",
                padding: 32,
                marginBottom: 16,
              }}
            >
              <p style={bodyStyle}>Open a refund request:</p>
              <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                <a href="/refund-request">Refund request form</a>
              </p>
              <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>Include:</p>
              <ul style={{ ...listStyle, marginBottom: 0 }}>
                <li>Your order ID (found in confirmation email)</li>
                <li>Email address used for purchase</li>
                <li>Product name(s)</li>
                <li>A brief reason for the request</li>
              </ul>
            </div>
            <p style={{ color: "var(--color-neutral-600)", fontSize: 14, lineHeight: 1.7 }}>
              💡 <strong style={{ color: "var(--color-neutral-800)" }}>Tip:</strong> If you&apos;re having technical issues with a product, contact{" "}
              <a href="/contact">Cival support</a> first—we may be able to help!
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>4. Processing Timeline</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { n: 1, title: "Review (24-48 hours)", body: "We verify your request meets eligibility criteria." },
                { n: 2, title: "Approval & Processing (1-2 business days)", body: "Once approved, we initiate the refund via Stripe." },
                {
                  n: 3,
                  title: "Bank Processing (5-10 business days)",
                  body: "Your bank or card issuer processes the refund (timing varies by institution).",
                },
              ].map((step) => (
                <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      minWidth: 40,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--color-bg)",
                      flexShrink: 0,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 400, color: "var(--color-text)", marginBottom: 4 }}>
                      {step.title}
                    </h3>
                    <p style={{ color: "var(--color-neutral-700)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>5. Refund Method</h2>
            <p style={bodyStyle}>
              Refunds are issued to the <strong style={{ color: "var(--color-text)" }}>original payment method</strong> used for purchase. We
              cannot issue refunds to a different card or account.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>6. Partial Refunds</h2>
            <p style={bodyStyle}>If you purchased a bundle or multiple products:</p>
            <ul style={listStyle}>
              <li>You may request a partial refund for separately priced products in a multi-product order</li>
              <li>Bundle discounts are prorated—you cannot refund one item at full price from a discounted bundle</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionHeadingStyle}>7. Questions?</h2>
            <p style={bodyStyle}>If you have questions about our refund policy or need assistance:</p>
            <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 8 }}>
              📧 Refunds: <a href="/refund-request">Refund request form</a>
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7 }}>
              💬 Support: <a href="/contact">Cival support form</a>
            </p>
          </section>

          <div
            style={{
              background: "var(--color-accent-100)",
              borderRadius: "calc(var(--radius-lg) * 1.15)",
              padding: 24,
              marginTop: 48,
            }}
          >
            <p style={{ color: "var(--color-accent-800)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "var(--color-accent-900)" }}>Cival Systems</strong>
              <br />
              Digital Products & Creative Tools
              <br />© {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
