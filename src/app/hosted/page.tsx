import Link from "next/link";
import { HostingAccessProvider, HostingAccessButton, HostingTrialCopy } from "@/components/HostingAccess";
import "../marketing-pages.css";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hostingSalesEnabled, SOLO_TRIAL_DAYS } from "@/lib/hosting";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Managed Trading Dashboard Hosting — Solo 7-day Trial",
  description:
    "Your own hosted Cival dashboard. Start a seven-day Solo trial with a payment method, then configure your account, agent and risk controls.",
};

export default async function HostedPage() {
  const { data, error } = await createServerClient()
    .from("hosting_plans")
    .select(
      "id,name,description,price_cents,currency,billing_interval,agent_limit,features,is_active,launch_ready",
    )
    .eq("is_active", true)
    .gt("price_cents", 0)
    .order("sort_order");
  const plans = error ? [] : data || [];
  const sales = hostingSalesEnabled();
  const solo = plans.find((p) => p.id === "solo");
  const money = (p: (typeof plans)[number]) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: p.currency || "USD",
      maximumFractionDigits: 2,
    }).format(p.price_cents / 100);
  const steps = [
    [
      "Create and verify your account",
      "Use one account for your subscription, dashboard, billing and support.",
    ],
    [
      "Start Solo with a payment method",
      "Eligible new customers get seven days free. Stripe displays the renewal amount and date before you confirm.",
    ],
    [
      "Open your private dashboard",
      "Watch provisioning status in your account. Complete workspace setup, choose your strategy and configure risk limits.",
    ],
    [
      "Connect and validate",
      "Connect your own Hyperliquid account and approve its trade-only key. Fund it separately and verify the network before enabling agents. Testnet uses test funds.",
    ],
  ];
  const faqs = [
    [
      "Is there a permanently free plan?",
      "No. Solo has a seven-day trial for eligible new hosting customers. A payment method is required. Desk and Fund are paid subscriptions.",
    ],
    [
      "When will I be charged?",
      `The Solo trial begins when Stripe Checkout completes. ${solo ? `After seven days, Solo renews at ${money(solo)} per ${solo.billing_interval}` : "The recurring price is shown in checkout"} unless you cancel before the trial ends. Your account shows the exact trial end date. A temporary card authorization may appear; it is not the subscription fee.`,
    ],
    [
      "How do I cancel?",
      "Open Account → Hosting → Manage billing, invoices, or cancellation. Cancel before the trial ends to avoid the first subscription charge. Review and manage any open positions on Hyperliquid before service access ends; cancellation is not an instruction to close your trades.",
    ],
    [
      "Does the trial include trading capital?",
      "No. Hosting fees and trading capital are separate. You supply your own venue account and funds. Testnet balances are not real money. Connecting a wallet or starting a subscription does not itself authorize an agent to trade.",
    ],
    [
      "Do you hold my funds?",
      "Your trading funds remain in your Hyperliquid account. You approve a trade-only agent key that cannot withdraw. Never provide your wallet seed phrase or withdrawal-capable private key. Deposits and withdrawals require your own authorization.",
    ],
    [
      "Can I choose my agents?",
      "Yes. Your plan limits how many agents you can run at once. Choose from the strategies available in your workspace, then assign symbols and limits. Optional AI-backed agents may require your own provider credentials.",
    ],
    [
      "Is source software the same as hosting?",
      "No. Hosting provides a managed runtime. Downloadable source editions have their own contents, version requirements and release status. Check your account entitlements and the setup guide before planning a self-hosted installation.",
    ],
    [
      "What if setup or payment fails?",
      "Your hosting account shows provisioning errors, billing status and available recovery steps. Update failed payment methods through the billing portal. Contact support with your subscription reference if provisioning needs assistance.",
    ],
  ];
  return (
    <div className="cival">
      <Navbar />
      <HostingAccessProvider><main className="marketing-page"
        style={{ padding: "110px 24px 80px", maxWidth: 1200, margin: "0 auto" }}
      >
        <section style={{ maxWidth: 850, marginBottom: 40 }}>
          <span className="tag tag-accent">Managed dashboard hosting</span>
          <h1
            style={{
              fontSize: "clamp(38px,6vw,68px)",
              lineHeight: 1.08,
              margin: "24px 0",
            }}
          >
            Your dashboard.
            <br />
            Your agents. Hosted for you.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.65 }}>
            We operate the dashboard infrastructure. You choose your strategies,
            connect your own account, set your limits and decide when automation
            runs.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <HostingAccessButton>
              {sales && solo?.launch_ready
                ? `Start Solo’s ${SOLO_TRIAL_DAYS}-day trial`
                : "View hosting availability"}
            </HostingAccessButton>
            <a className="btn btn-secondary" href="#plans">
              Compare plans
            </a>
          </div>
          <HostingTrialCopy><p style={{ fontSize: 13, lineHeight: 1.6 }}>
            Payment method required.{" "}
            {solo
              ? `${SOLO_TRIAL_DAYS} days free, then ${money(solo)}/${solo.billing_interval}.`
              : "Renewal pricing is shown below and in checkout."}{" "}
            Cancel before your trial ends to avoid the first charge. For
            eligible new hosting customers.
          </p></HostingTrialCopy>
        </section>
        <figure
          style={{
            margin: "0 0 48px",
            border: "1px solid var(--color-divider)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Image
            src="/images/product-captures/customer-agent-detail-testnet.jpg"
            alt="Actual hosted Cival testnet agent workspace"
            width={3832}
            height={2160}
            sizes="(max-width:1200px) 100vw,1152px"
            quality={95}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <figcaption style={{ padding: 14, fontSize: 13 }}>
            Actual hosted dashboard on testnet. Screenshot balances and results
            are not a performance promise. Trading involves risk.
          </figcaption>
        </figure>
        <section id="plans" style={{ scrollMarginTop: 90 }}>
          <h2 style={{ fontSize: 32 }}>Choose your agent capacity</h2>
          <p>
            No permanently free tier. All plans provide a private hosted
            workspace.
          </p>
          {!sales && (
            <p role="status">
              New activations are temporarily unavailable. Existing customers
              can manage their workspace from their account.
            </p>
          )}
          {!plans.length && (
            <p role="alert">
              Plans could not be loaded. Please refresh or contact support.
            </p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
              gap: 20,
              marginTop: 24,
            }}
          >
            {plans.map((plan) => (
              <article
                key={plan.id}
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: 16,
                  background: "var(--color-surface)",
                }}
              >
                <span className="tag tag-accent">
                  {plan.id === "solo"
                    ? "7-day trial available"
                    : `${plan.agent_limit} agent capacity`}
                </span>
                <h3 style={{ fontSize: 28, margin: "16px 0" }}>{plan.name}</h3>
                <p style={{ fontSize: 32, margin: "12px 0" }}>
                  {money(plan)}
                  <small style={{ fontSize: 14 }}>
                    /{plan.billing_interval}
                  </small>
                </p>
                <p>
                  {plan.agent_limit === 1
                    ? "Run one strategy agent"
                    : `Run up to ${plan.agent_limit} strategy agents`}
                </p>
                <p style={{ lineHeight: 1.6 }}>{plan.description}</p>
                <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                  {((plan.features as string[]) || [])
                    .filter(
                      (feature) =>
                        !/(source|licen[cs]e|free|paper.only)/i.test(feature),
                    )
                    .map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                </ul>
<HostingAccessButton>
                  {sales && plan.launch_ready
                    ? plan.id === "solo"
                      ? "Start 7-day trial"
                      : "Choose " + plan.name
                    : "View availability"}
                </HostingAccessButton>
                {plan.id === "solo" && (
                  <HostingTrialCopy><p style={{ fontSize: 12, lineHeight: 1.6 }}>
                    Card required. {money(plan)}/{plan.billing_interval} after
                    the trial unless canceled. One trial per eligible customer.
                  </p></HostingTrialCopy>
                )}
              </article>
            ))}
          </div>
        </section>
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 32 }}>
            From signup to your first verified run
          </h2>
          <div className="onboarding-grid">
            {steps.map(([title, copy], i) => (
              <article
                key={title}
                style={{
                  padding: 24,
                  border: "1px solid var(--color-divider)",
                  borderRadius: 14,
                }}
              >
                <span className="tag tag-neutral">Step {i + 1}</span>
                <h3>{title}</h3>
                <p style={{ lineHeight: 1.7 }}>{copy}</p>
              </article>
            ))}
          </div>
          <p style={{ lineHeight: 1.7 }}>
            Your account connects billing, provisioning, funding and agent setup
            in one place. An active subscription provides service access; it
            does not guarantee a trade signal or investment returns.
          </p>
          <Link href="/account/hosting" className="btn btn-secondary">
            Open hosting account
          </Link>
        </section>
        <section style={{ marginTop: 64, maxWidth: 900 }}>
          <h2 style={{ fontSize: 32 }}>Before you begin</h2>
          {faqs.map(([q, a]) => (
            <details
              key={q}
              style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              <summary style={{ fontWeight: 600, cursor: "pointer" }}>
                {q}
              </summary>
              <p style={{ lineHeight: 1.75 }}>{a}</p>
            </details>
          ))}
          <p style={{ marginTop: 24 }}>
            <Link href="/hosting-terms">Hosting terms</Link> ·{" "}
            <Link href="/refunds">Refund policy</Link> ·{" "}
            <Link href="/contact?subject=Managed%20Hosting">
              Hosting support
            </Link>
          </p>
        </section>
      </main></HostingAccessProvider>
      <Footer />
    </div>
  );
}
