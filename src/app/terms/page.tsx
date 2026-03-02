import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GWDS",
  description: "Terms of Service for Gamma Waves Design Studio digital products and services.",
};

export default function TermsPage() {
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
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 48 }}>Last updated: March 2, 2026</p>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              1. Agreement to Terms
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              By accessing or using Gamma Waves Design Studio ("GWDS", "we", "our", "us") products and services, you agree to be bound by these Terms
              of Service. If you disagree with any part of these terms, you may not access our products or services.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              2. Digital Product Licenses
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              When you purchase a digital product from GWDS, you receive a non-exclusive, non-transferable license to use the product according to
              these terms:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Personal Use:</strong> You may use products for personal or commercial projects.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Modification:</strong> You may customize and modify products for your own use.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Prohibited:</strong> You may NOT resell, redistribute, or share products with others.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#F8FAFC" }}>Prohibited:</strong> You may NOT claim products as your own original work.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              3. Refund Policy
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              We offer a <strong style={{ color: "#F8FAFC" }}>30-day money-back guarantee</strong> on all digital products. To be eligible for a
              refund:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Request must be made within 30 days of purchase</li>
              <li style={{ marginBottom: 8 }}>Product must not have been downloaded more than once (trial download allowed)</li>
              <li style={{ marginBottom: 8 }}>Provide a brief reason for the refund request</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              See our <a href="/refunds" style={{ color: "#8B5CF6", textDecoration: "none" }}>Refund Policy</a> for full details.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              4. Account Terms
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              When purchasing from GWDS:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>You must provide accurate and complete information</li>
              <li style={{ marginBottom: 8 }}>You are responsible for maintaining the security of your download links</li>
              <li style={{ marginBottom: 8 }}>You must be at least 18 years old to make purchases</li>
              <li style={{ marginBottom: 8 }}>You are responsible for all activity under your email account</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              5. Download Access
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Download links are valid for <strong style={{ color: "#F8FAFC" }}>7 days</strong> from purchase and allow up to{" "}
              <strong style={{ color: "#F8FAFC" }}>5 downloads</strong> per product. After expiration or limit reached, contact support for
              assistance.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              6. Intellectual Property
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              All products, content, and materials available through GWDS are the intellectual property of Gamma Waves Design Studio or our
              licensors. Our trademarks and trade dress may not be used without prior written consent.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              7. Limitation of Liability
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              GWDS products are provided "as is" without warranties of any kind. We are not liable for any damages arising from the use or inability
              to use our products, including but not limited to:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Loss of profits or revenue</li>
              <li style={{ marginBottom: 8 }}>Data loss or corruption</li>
              <li style={{ marginBottom: 8 }}>Business interruption</li>
              <li style={{ marginBottom: 8 }}>Indirect or consequential damages</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Our total liability shall not exceed the amount paid for the product in question.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              8. Prohibited Uses
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>You may not use our products to:</p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Engage in illegal activities</li>
              <li style={{ marginBottom: 8 }}>Violate any intellectual property rights</li>
              <li style={{ marginBottom: 8 }}>Distribute malware or harmful code</li>
              <li style={{ marginBottom: 8 }}>Harass, abuse, or harm others</li>
              <li style={{ marginBottom: 8 }}>Resell or redistribute our products</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              9. Changes to Terms
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our
              products constitutes acceptance of the modified terms.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              10. Contact Information
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 8 }}>
              For questions about these Terms of Service, contact us at:
            </p>
            <p style={{ color: "#8B5CF6", fontSize: 16, lineHeight: 1.7 }}>
              <a href="mailto:support@gwds.studio" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                support@gwds.studio
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
