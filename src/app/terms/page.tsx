import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Cival Systems. You are purchasing software source code and architecture, not financial advice.",
};

export default function TermsPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "112px 24px 64px" }}>
          <h1 style={{ fontSize: "clamp(36px,5vw,52px)", letterSpacing: "-0.018em", lineHeight: 1.08, marginBottom: 16 }}>
            Terms of <span style={{ color: "var(--color-accent)" }}>Service</span>
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 48 }}>
            Last updated: March 6, 2026
          </p>

          {/* Section 1 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>1. Agreement to Terms</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              By accessing or using the Cival Systems (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) website, purchasing any product, or downloading any software, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not access our website or purchase our products.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              These terms constitute a legally binding agreement between you and Cival Systems. Please read them carefully.
            </p>
          </section>

          {/* Section 2 — CRITICAL */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>2. What You Are Purchasing</h2>
            <div
              style={{
                background: "var(--color-accent-100)",
                border: "1px solid var(--color-accent-300)",
                borderRadius: "var(--radius-md)",
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p style={{ color: "var(--color-accent-900)", fontSize: 16, fontWeight: 600, lineHeight: 1.7, margin: 0 }}>
                When you purchase a Cival Systems product, you are purchasing a LICENSE to use software source code, user interface components, and system architecture. You are paying for intellectual property, engineering, and architectural design — NOT for trading performance, financial returns, or guaranteed profits.
              </p>
            </div>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              To be clear about what you receive:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>You receive:</strong> Software source code, UI templates, system architecture blueprints, and documentation — development starting points for building your own trading systems.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>You are paying for:</strong> The complexity of the codebase, months of engineering and development work, and the architectural patterns and design decisions contained within.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>You are NOT paying for:</strong> Trading performance, financial returns, guaranteed profits, live trading signals, or any form of investment advice.
              </li>
            </ul>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              No Cival Systems product includes:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Live API keys or exchange credentials</li>
              <li style={{ marginBottom: 8 }}>Funded exchange accounts or trading capital</li>
              <li style={{ marginBottom: 8 }}>Guaranteed trading signals or automated profit</li>
              <li style={{ marginBottom: 8 }}>Managed trading services or portfolio management</li>
              <li style={{ marginBottom: 8 }}>Any promise, guarantee, or implication of financial returns</li>
            </ul>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              Product pricing reflects the value of the source code, engineering effort, and architectural intellectual property — not a promise of profits. High price does not imply high returns.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>3. Digital Product Licenses</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Upon purchase, Cival Systems grants you a non-exclusive, non-transferable, revocable license to use the product subject to the following:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Personal & Commercial Use:</strong> You may use, modify, and deploy the software for your own personal or commercial projects.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Modification:</strong> You may customize, extend, and build upon the source code for your own use.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>No Redistribution:</strong> You may NOT resell, redistribute, sublicense, share, publish, or otherwise make the source code available to any third party in original or modified form.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>No Transfer:</strong> Your license is non-transferable. You may not give, sell, or share your access with others.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Single Entity:</strong> One license covers one individual or one business entity.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>4. No Financial Advice</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Cival Systems products are software development tools. Cival Systems does not provide investment advice, financial planning, trading recommendations, or any form of financial guidance.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Nothing on the Cival Systems website, in product documentation, marketing materials, demo videos, social media posts, or any other communication should be construed as a recommendation to buy, sell, or trade any financial instrument, cryptocurrency, or digital asset.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              See our full <a href="/disclaimer">Trading & Financial Disclaimer</a> for details.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>5. Risk Acknowledgment</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              By purchasing any Cival Systems product, you explicitly acknowledge and agree that:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Trading cryptocurrencies, futures, and digital assets involves substantial risk of loss, including the potential loss of your entire investment.</li>
              <li style={{ marginBottom: 8 }}>You can lose all of your money. There is no guarantee against loss.</li>
              <li style={{ marginBottom: 8 }}>Past performance of any Cival Systems product, as demonstrated in marketing or elsewhere, does not guarantee future results.</li>
              <li style={{ marginBottom: 8 }}>You are solely responsible for all trading decisions, configurations, and risk management when using Cival Systems software.</li>
              <li style={{ marginBottom: 8 }}>Cival Systems is not liable for any trading losses, financial damages, or negative outcomes of any kind resulting from the use of its products.</li>
              <li style={{ marginBottom: 8 }}>You have read and understood the <a href="/disclaimer">Trading & Financial Disclaimer</a>.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>6. Performance Claims Disclaimer</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Any performance statistics, profit/loss figures, win rates, return percentages, equity curves, account screenshots, or other metrics displayed on the Cival Systems website, in product demos, or marketing materials represent the developer&apos;s personal historical results.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              These figures:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Are NOT guarantees, projections, forecasts, or promises of future performance</li>
              <li style={{ marginBottom: 8 }}>Were achieved under specific market conditions with specific configurations and capital levels</li>
              <li style={{ marginBottom: 8 }}>May include backtested, simulated, or paper trading results — not necessarily live capital</li>
              <li style={{ marginBottom: 8 }}>Do not account for all costs including commissions, fees, slippage, spreads, and taxes</li>
              <li style={{ marginBottom: 8 }}>Will vary based on market conditions, software configuration, available capital, exchange selection, and user skill level</li>
            </ul>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              Individual results will differ. Many traders lose money. You should not expect to replicate any results shown.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>7. Download Access</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Upon successful payment, you receive access to download your purchased product(s). Download access includes:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Unlimited downloads:</strong> No cap on the number of times you can download.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>No expiration:</strong> Your access does not expire. Lifetime access to the purchased version.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "var(--color-text)" }}>Version access:</strong> Access is granted to the version available at the time of purchase. Future major version updates may be separate products.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>8. Refund Policy</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              We offer a <strong style={{ color: "var(--color-text)" }}>30-day money-back guarantee</strong> on all digital products. If you are not satisfied with your purchase for any reason, you may request a full refund within 30 days.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Refunds are not available for trading losses, unsatisfactory trading performance, or any financial outcome. The refund guarantee covers product quality and satisfaction with the software itself.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              See our full <a href="/refunds">Refund Policy</a> for eligibility, process, and timeline details.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>9. Software Provided &quot;As-Is&quot;</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              All Cival Systems products are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, whether express, implied, statutory, or otherwise. Cival Systems specifically disclaims all implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Without limiting the above:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Software may contain bugs, errors, or security vulnerabilities</li>
              <li style={{ marginBottom: 8 }}>Third-party API integrations may break without notice due to external changes</li>
              <li style={{ marginBottom: 8 }}>Software may not function as expected in all environments or configurations</li>
              <li style={{ marginBottom: 8 }}>Cival Systems does not warrant uninterrupted, error-free, or secure operation of any product</li>
            </ul>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              You are solely responsible for testing, validating, and ensuring the software meets your requirements before deploying it in any production or live trading environment.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>10. Limitation of Liability</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              To the maximum extent permitted by applicable law, Cival Systems, its owner, employees, contractors, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or use, whether in an action in contract, tort, or otherwise, arising out of or related to the use of any Cival Systems product.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              This includes, without limitation:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Any and all trading losses</li>
              <li style={{ marginBottom: 8 }}>Lost profits, revenue, or anticipated savings</li>
              <li style={{ marginBottom: 8 }}>Loss of data or data corruption</li>
              <li style={{ marginBottom: 8 }}>Business interruption</li>
              <li style={{ marginBottom: 8 }}>Loss of goodwill or reputation</li>
              <li style={{ marginBottom: 8 }}>Cost of substitute goods or services</li>
              <li style={{ marginBottom: 8 }}>Any damages arising from unauthorized access to your accounts or systems</li>
            </ul>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              In no event shall Cival Systems&apos; total aggregate liability exceed the amount you paid for the specific product giving rise to the claim.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>11. Prohibited Uses</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              You may not:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Resell, redistribute, sublicense, or share any Cival Systems product or its source code</li>
              <li style={{ marginBottom: 8 }}>Publish the source code on any public repository, forum, or website</li>
              <li style={{ marginBottom: 8 }}>Claim Cival Systems products as your own original work</li>
              <li style={{ marginBottom: 8 }}>Use Cival Systems products to create a competing product or service that sells the same or substantially similar code</li>
              <li style={{ marginBottom: 8 }}>Use products for any illegal activity, including market manipulation, fraud, or money laundering</li>
              <li style={{ marginBottom: 8 }}>Reverse engineer products for the purpose of redistribution</li>
              <li style={{ marginBottom: 8 }}>Remove or alter any copyright notices, license headers, or attribution within the source code</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>12. Account Terms</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              When making a purchase from Cival Systems:
            </p>
            <ul style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>You must be at least 18 years of age</li>
              <li style={{ marginBottom: 8 }}>You must provide accurate, current, and complete information</li>
              <li style={{ marginBottom: 8 }}>You are responsible for maintaining the confidentiality and security of your account credentials and download links</li>
              <li style={{ marginBottom: 8 }}>You are responsible for all activity that occurs under your account or using your download links</li>
              <li style={{ marginBottom: 8 }}>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>13. Intellectual Property</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              All products, source code, documentation, designs, content, trademarks, and materials available through Cival Systems are the intellectual property of Cival Systems. Your purchase grants you a usage license as described in Section 3; it does not transfer ownership of the intellectual property.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              The Cival Systems name, logo, and trade dress may not be used without prior written consent.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>14. Governing Law</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              Any disputes arising from these terms or related to Cival Systems products shall be resolved in the state or federal courts located in California. You consent to the exclusive jurisdiction and venue of such courts.
            </p>
          </section>

          {/* Section 15 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>15. Changes to Terms</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7 }}>
              Cival Systems reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. Your continued use of Cival Systems products after any changes constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Section 16 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>16. Contact</h2>
            <p style={{ color: "var(--color-neutral-800)", fontSize: 16, lineHeight: 1.7, marginBottom: 8 }}>
              For questions about these Terms of Service, contact us at:
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7 }}>
              <a href="mailto:gammawavesdesign@gmail.com">gammawavesdesign@gmail.com</a>
            </p>
          </section>

          <div
            style={{
              background: "var(--color-accent-100)",
              border: "1px solid var(--color-accent-300)",
              borderRadius: "var(--radius-md)",
              padding: 24,
              marginTop: 48,
            }}
          >
            <p style={{ color: "var(--color-neutral-800)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "var(--color-text)" }}>Cival Systems</strong>
              <br />
              Software Source Code & Development Tools
              <br />© {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
