import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Managed Hosting Service Terms",
  description: "Terms for the Cival Systems managed hosting service.",
};

const sections = [
  [
    "1. Service",
    "Managed Hosting provides access to a Cival-operated software runtime, account dashboard, updates, monitoring and support for the plan shown at checkout. Hosting is a software and infrastructure service. It is not brokerage, custody, investment advice, portfolio management, or a promise of uptime, execution quality, profit, or loss avoidance.",
  ],
  [
    "2. Eligibility and account security",
    "You must provide accurate account information and keep your login secure. The supported service is paper-only and does not accept exchange API keys, wallet secrets, seed phrases, private keys, or authority to submit live orders. You are responsible for the research settings and simulated risk limits submitted through your account.",
  ],
  [
    "3. Activation and operator review",
    "Payment does not place a strategy live. Cival may require onboarding information and operator approval. Every supported workspace remains paper-only. Cival may reject or suspend unsafe, unlawful, abusive, unsupported or technically incompatible configurations.",
  ],
  [
    "4. Billing and cancellation",
    "Paid plans renew at the interval and price displayed in Stripe Checkout until canceled. You may update payment methods, view invoices, or cancel through the Stripe customer portal. Unless checkout says otherwise, cancellation takes effect at the end of the paid billing period. Fees already earned for an active billing period are governed by the Refund Policy and applicable law.",
  ],
  [
    "5. Usage limits and changes",
    "Plans may include agent, workspace, seat or agent-hour limits. Cival may pause new work when a limit is reached instead of silently creating unapproved charges. Material price or plan changes apply only after notice and as permitted by law. Plan changes that require new consent will not be applied silently.",
  ],
  [
    "6. Credentials and customer data",
    "Cival does not request or store exchange, wallet, or third-party provider secrets for the supported paper service. Customer workspace state is isolated by verified account and tenant access controls. Cival may retain billing, security and audit records as described in the Privacy Policy and may delete runtime data after service termination.",
  ],
  [
    "7. Availability, maintenance and incidents",
    "The service may be unavailable for maintenance, provider outages, exchange incidents, security events or emergency risk controls. Cival will use commercially reasonable efforts to monitor active runtimes and communicate customer-visible incidents. Unless a signed order form says otherwise, no specific uptime service-level agreement or service credit is promised.",
  ],
  [
    "8. Trading and technology risk",
    "Automated trading can lose some or all capital. Software, market data, networks, blockchains, exchanges, APIs and third-party providers can fail or behave unexpectedly. Stops, reconciliation, supervision, backups and defensive controls reduce some operational risks but cannot eliminate market, liquidity, execution, counterparty, smart-contract or technology risk. You choose strategies, capital, permissions and limits and remain responsible for them.",
  ],
  [
    "9. Suspension and termination",
    "Cival may suspend a workspace for failed payment, security risk, abuse, legal requirements, provider restrictions, unsupported configuration or risk to other customers. After cancellation or termination, Cival may decommission runtime resources and delete workspace state according to the Privacy Policy. Billing records and audit logs may be retained where legally or operationally required.",
  ],
  [
    "10. Support and notices",
    "Support is provided through the support channel associated with your plan. Incident and lifecycle notices may appear in your account or be sent to the verified email address. You are responsible for keeping that address current and monitoring notices relevant to an active runtime.",
  ],
];

export default function HostingTermsPage() {
  return (
    <div className="cival">
      <Navbar />
      <main
        className="cival-fade"
        style={{ minHeight: "100vh", padding: "130px 24px 90px" }}
      >
        <article style={{ maxWidth: 820, margin: "0 auto" }}>
          <span className="tag tag-accent">Version 2026-08-20</span>
          <h1 style={{ fontSize: "clamp(38px,6vw,64px)", margin: "18px 0" }}>
            Managed Hosting Service Terms
          </h1>
          <p style={{ color: "var(--color-neutral-700)", lineHeight: 1.7 }}>
            These terms supplement the Cival Systems{" "}
            <Link href="/terms">Terms</Link>,{" "}
            <Link href="/privacy">Privacy Policy</Link>,{" "}
            <Link href="/refunds">Refund Policy</Link>, and{" "}
            <Link href="/disclaimer">Trading Disclaimer</Link>. If there is a
            conflict about Managed Hosting, these service-specific terms
            control. This operational draft should receive business/legal review
            before the hosting sales gate is opened.
          </p>
          <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
            {sections.map(([title, body]) => (
              <section
                key={title}
                style={{
                  padding: 25,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>{title}</h2>
                <p
                  style={{
                    color: "var(--color-neutral-700)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </section>
            ))}
          </div>
          <p style={{ color: "var(--color-neutral-700)", marginTop: 28 }}>
            Questions or notices:{" "}
            <Link href="/contact?subject=Managed%20Hosting">
              contact Cival Systems support
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
