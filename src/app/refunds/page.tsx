import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — GWDS",
  description: "30-day money-back guarantee on all GWDS digital products. Learn about our refund process.",
};

export default function RefundsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "#0A0A0F" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 48,
              fontWeight: 800,
              color: "#F8FAFC",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Refund <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 48 }}>Last updated: March 2, 2026</p>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 12,
              padding: 32,
              marginBottom: 48,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#F8FAFC",
                marginBottom: 12,
              }}
            >
              30-Day Money-Back Guarantee
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 17, lineHeight: 1.7, margin: 0 }}>
              We stand behind our products. If you're not satisfied, we'll refund your purchase—no questions asked.
            </p>
          </div>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              1. Eligibility
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>You are eligible for a full refund if:</p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Timeframe:</strong> Request is made within 30 days of purchase
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Download limit:</strong> Product has been downloaded no more than once (we allow one trial
                download)
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Reason:</strong> You provide a brief explanation (helps us improve our products)
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              2. Not Eligible
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>Refunds cannot be issued if:</p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>More than 30 days have passed since purchase</li>
              <li style={{ marginBottom: 8 }}>Product has been downloaded more than once (indicates active use)</li>
              <li style={{ marginBottom: 8 }}>You have resold, shared, or distributed the product</li>
              <li style={{ marginBottom: 8 }}>Product was purchased during a promotion explicitly marked "no refunds"</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              3. How to Request a Refund
            </h2>
            <div
              style={{
                background: "#12121A",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: 12,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>Send an email to:</p>
              <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                <a href="mailto:gammawavesdesign@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                  gammawavesdesign@gmail.com
                </a>
              </p>
              <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>Include:</p>
              <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 0 }}>
                <li style={{ marginBottom: 8 }}>Your order ID (found in confirmation email)</li>
                <li style={{ marginBottom: 8 }}>Email address used for purchase</li>
                <li style={{ marginBottom: 8 }}>Product name(s)</li>
                <li style={{ marginBottom: 8 }}>Brief reason for refund request (optional but appreciated)</li>
              </ul>
            </div>
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7 }}>
              💡 <strong style={{ color: "#94A3B8" }}>Tip:</strong> If you're having technical issues with a product, contact{" "}
              <a href="mailto:gammawavesdesign@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                gammawavesdesign@gmail.com
              </a>{" "}
              first—we may be able to help!
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              4. Processing Timeline
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#F8FAFC", marginBottom: 4 }}>
                    Review (24-48 hours)
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    We verify your request meets eligibility criteria.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#F8FAFC", marginBottom: 4 }}>
                    Approval & Processing (1-2 business days)
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    Once approved, we initiate the refund via Stripe.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#F8FAFC", marginBottom: 4 }}>
                    Bank Processing (5-10 business days)
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    Your bank or card issuer processes the refund (timing varies by institution).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              5. Refund Method
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Refunds are issued to the <strong style={{ color: "#F8FAFC" }}>original payment method</strong> used for purchase. We cannot issue
              refunds to a different card or account.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              6. Partial Refunds
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              If you purchased a bundle or multiple products:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>You may request a partial refund for unused products (not downloaded)</li>
              <li style={{ marginBottom: 8 }}>Bundle discounts are prorated—you cannot refund one item at full price from a discounted bundle</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              7. Questions?
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              If you have questions about our refund policy or need assistance:
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 8 }}>
              📧 Refunds:{" "}
              <a href="mailto:gammawavesdesign@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                gammawavesdesign@gmail.com
              </a>
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7 }}>
              💬 Support:{" "}
              <a href="mailto:gammawavesdesign@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                gammawavesdesign@gmail.com
              </a>
            </p>
          </section>

          <div
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 12,
              padding: 24,
              marginTop: 48,
            }}
          >
            <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "#F8FAFC" }}>Gamma Waves Design Studio</strong>
              <br />
              Digital Products & Creative Tools
              <br />© {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
