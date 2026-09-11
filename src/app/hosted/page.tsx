import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { planExecutionMode } from "@/lib/hosting";
import { createServerClient } from "@/lib/supabase";

// Plan capacity, price and feature copy all come from public.hosting_plans at request time. The
// page used to hardcode them, which is how it ended up describing four "paper-only" tiers months
// after the paid ones were re-specified to run live agents. There is now exactly one place those
// facts live, and this page is not it.
export const dynamic = "force-dynamic";

interface PlanRow {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  billingInterval: string;
  agentLimit: number | null;
  features: string[];
  executionMode: "simulated" | "live";
}

async function getPlans(): Promise<PlanRow[]> {
  try {
    const { data, error } = await createServerClient()
      .from("hosting_plans")
      .select("id,name,description,price_cents,billing_interval,agent_limit,features,is_active,sort_order")
      .eq("is_active", true)
      .gt("price_cents", 0)
      .order("sort_order");
    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      priceCents: row.price_cents as number,
      billingInterval: row.billing_interval as string,
      agentLimit: (row.agent_limit as number | null) ?? null,
      features: Array.isArray(row.features)
        ? (row.features as unknown[]).filter((item): item is string => typeof item === "string")
        : [],
      executionMode: planExecutionMode(row.price_cents as number),
    }));
  } catch {
    return [];
  }
}

function priceLabel(plan: PlanRow) {
  return `$${Math.round(plan.priceCents / 100).toLocaleString("en-US")}`;
}

function intervalLabel(plan: PlanRow) {
  if (plan.priceCents === 0) return "";
  return plan.billingInterval === "month" ? "/ mo" : `/ ${plan.billingInterval}`;
}

// "12 agents" and "up to 12 agents" are different promises. A plan row whose agent_limit is still
// NULL cannot honestly claim either, so it says so rather than inventing a number.
function agentLabel(plan: PlanRow) {
  if (plan.agentLimit === null) return "Agent capacity not set";
  return plan.agentLimit === 1 ? "1 agent" : `Up to ${plan.agentLimit} agents`;
}

const STEPS = [
  [
    "Create an account",
    "The same verified account you use for purchases and downloads. No terminal, no Supabase project, no Vercel account.",
  ],
  [
    "Choose how many agents you run",
    "Choose a paid monthly plan for one agent or scale to a larger loadout. Every plan includes one persistent private cloud dashboard.",
  ],
  [
    "Connect keys and your wallet",
    "Connect your AI provider keys, fund your own Hyperliquid account and personally approve a trade-only agent wallet. Never share your main wallet private key or seed phrase.",
  ],
  [
    "Build your loadout",
    "Pick your strategies, choose how many of each, and give every instance its own market. We run the deployment, the database, the health checks, the backups and the updates.",
  ],
];

const INCLUDED = [
  [
    "Managed runtime",
    "The app deployment, authenticated workspace database, provisioning queue, health checks and backups are operated for you.",
  ],
  [
    "Non-custodial by construction",
    "Your capital stays in your own Hyperliquid account. You approve a trade-only agent wallet; provider credentials and the agent key are encrypted for runtime use. We never request your main wallet private key or seed phrase.",
  ],
  [
    "A halt switch you hold",
    "Stop new trades from your account page at any time, with a reason recorded. Resuming is a deliberate second act — it asks you to type your workspace name back.",
  ],
  [
    "Capacity you can see",
    "Every plan states how many agents it runs. Your loadout page shows used against limit, refuses to exceed it, and never quietly stops an agent to make room.",
  ],
  [
    "Agent supervision",
    "Health scoring and automated deployment recovery keep your workspace available. Incidents are tracked in your account and the operations console.",
  ],
  [
    "Updates applied for you",
    "Patches and new strategy modules land automatically instead of waiting on a manual pull.",
  ],
  [
    "Isolated tenancy",
    "A separate deployment and row-level-secured workspace record per customer, with server-only automation credentials that never enter a customer release.",
  ],
  [
    "Never locked in",
    "Every hosted plan includes the full TypeScript source download. Export your config and run it on your own box whenever you want.",
  ],
];

const MATRIX = [
  ["Full TypeScript source", "Yours forever", "Yours forever"],
  ["Servers and database", "You provide and configure", "Provisioned for you"],
  ["Custody of funds", "Yours", "Yours — the agent wallet cannot withdraw"],
  ["Updates and patches", "Manual pull", "Applied automatically"],
  ["Deployment health and recovery", "You operate it", "Managed checks"],
  [
    "Workspace persistence",
    "Browser storage and JSON export",
    "Authenticated cloud saves and backups",
  ],
  ["How many agents", "As many as your box can carry", "Set by your plan"],
  ["Cost", "One-time, $99–399", "Monthly, cancel anytime"],
];

const STATUS = [
  [
    "Customer accounts",
    "Built",
    "Verified sign-in, order ownership, entitlements, and private download regeneration are implemented.",
  ],
  [
    "Commerce foundation",
    "Built",
    "Stripe checkout, signed webhooks, idempotent fulfillment, refunds, and revocation paths are implemented.",
  ],
  [
    "Hosted control plane",
    "Built",
    "Private workspaces, onboarding, health checks, backups and recovery are implemented. Provider credentials and generated agent keys are stored encrypted.",
  ],
  [
    "Operations console",
    "Built",
    "Cival operators can manage plans, subscriptions, customers, onboarding, deployments, tasks, incidents and the audit trail.",
  ],
  [
    "Hosted subscriptions",
    "Built",
    "Recurring Stripe checkout, subscription lifecycle webhooks, invoices, cancellation and the customer billing portal are implemented behind launch gates.",
  ],
  [
    "Live agent loadout",
    "Launch gate",
    "Choosing strategies and instance counts is recorded and audited today. The host-side step that installs that loadout into a running workspace is still being validated.",
  ],
  [
    "Tenant runtime",
    "Launch gate",
    "The service remains unavailable for payment until automated deployment credentials are installed and an isolated end-to-end provisioning, monitoring, backup and recovery drill passes.",
  ],
];

function Tick() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function HostedPage() {
  const salesEnabled = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === "true";
  const plans = await getPlans();
  const livePlans = plans.filter((plan) => plan.executionMode === "live");
  const liveCapacities = livePlans
    .map((plan) => plan.agentLimit)
    .filter((limit): limit is number => typeof limit === "number");

  const FAQ: [string, string][] = [
    [
      "How are my funds and keys handled?",
      "You fund your own Hyperliquid account and approve a trade-only agent wallet. Cival stores the generated agent key and your AI provider credentials encrypted so your cloud runtime can use them. Your main wallet private key and seed phrase stay with you; the agent wallet cannot withdraw your funds.",
    ],
    [
      "What does the monthly subscription include?",
      "One private persistent cloud dashboard, your plan’s agent capacity, managed updates, cloud saves and backups. There is no free hosting tier. AI provider usage, exchange fees and trading capital are separate; you bring your own keys and fund your own account.",
    ],
    [
      "How many agents can I run?",
      liveCapacities.length
        ? `Your plan decides: ${plans
            .filter((plan) => plan.agentLimit !== null)
            .map((plan) => `${plan.name} ${plan.agentLimit}`)
            .join(", ")}. Two instances of the same strategy count as two agents and each needs its own market — identical copies read the same signal and compete for the same margin.`
        : "Agent capacity is shown on each plan. Two instances of the same strategy count as two agents and each needs its own market.",
    ],
    [
      "Can I self-host later?",
      "Yes. Every hosted plan includes the same source download. Export your config and run it on your own machine whenever you want.",
    ],
    [
      "What happens if the service goes down?",
      "The deployment health gate retries recoverable failures, records incidents, and preserves a validated workspace backup. Your own halt switch is independent of all of that: you can stop new trades from your account page, and your funds are in your own account either way.",
    ],
    [
      "Does hosting reduce trading risk?",
      "No. Hosting removes infrastructure work. It does not validate a strategy, promise performance, or make a losing system profitable. On a live plan these agents trade real money in your own account and can lose it.",
    ],
    [
      "Is my strategy code private?",
      "Yes. Your workspace state is restricted by your verified account and tenant record, and is never used to train anything or shared with other customers.",
    ],
  ];

  return (
    <div className="cival">
      <Navbar />
      <main
        className="cival-fade"
        style={{ minHeight: "100vh", paddingTop: 66 }}
      >
        {/* Hero */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "100px 28px 64px",
          }}
        >
          <span className="tag tag-accent">Hosted by Cival</span>
          <h1
            style={{
              fontSize: "clamp(42px,6vw,72px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              maxWidth: "15ch",
              margin: "24px 0",
            }}
          >
            Don&apos;t want to run it? We&apos;ll run it.
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              color: "var(--color-neutral-800)",
              maxWidth: "62ch",
              margin: "0 0 14px",
            }}
          >
            Managed hosting for live strategy agents. You fund your own Hyperliquid
            account and approve a trade-only agent wallet; we run the deployment,
            the authenticated database, the health checks, the backups and the
            updates. Plans scale on the thing that actually matters — how many
            agents run at once.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--color-neutral-700)",
              maxWidth: "62ch",
              margin: "0 0 14px",
            }}
          >
            Start with one agent and expand as your strategy needs grow. Bring
            your own AI provider keys and trading capital. Your dashboard and
            saved configuration stay in the cloud when you close your browser.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--color-neutral-700)",
              maxWidth: "62ch",
              margin: 0,
            }}
          >
            Every hosted plan still includes the full source download, so you
            are never locked in.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 30,
            }}
          >
            <Link
              href="/account/hosting"
              className="btn btn-primary"
              style={{ height: 50, padding: "0 26px", fontSize: 15 }}
            >
              {salesEnabled
                ? "Choose a hosting plan"
                : "Prepare my hosting account"}
            </Link>
            <Link
              href="/store"
              className="btn btn-secondary"
              style={{ height: 50, padding: "0 22px", fontSize: 15 }}
            >
              Buy the source instead
            </Link>
          </div>
        </section>

        {/* Four steps */}
        <section
          style={{
            background: "var(--color-neutral-100)",
            borderTop: "1px solid var(--color-divider)",
            borderBottom: "1px solid var(--color-divider)",
          }}
        >
          <div
            style={{ maxWidth: 1100, margin: "0 auto", padding: "76px 28px" }}
          >
            <h6 style={{ marginBottom: 14 }}>Live in four steps</h6>
            <h2
              style={{
                fontSize: "clamp(30px,3.6vw,44px)",
                letterSpacing: "-0.015em",
                margin: "0 0 34px",
              }}
            >
              No terminal, no Supabase project, no server to babysit.
            </h2>
            <div
              data-cv-2col
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                gap: 16,
              }}
            >
              {STEPS.map(([title, body], i) => (
                <article
                  key={title}
                  style={{
                    background: "var(--color-bg)",
                    borderRadius: "var(--radius-lg)",
                    padding: 26,
                    border: "1px solid var(--color-divider)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-accent)",
                      fontSize: 11,
                      marginBottom: 12,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <h3
                    style={{ fontSize: 19, lineHeight: 1.2, margin: "0 0 8px" }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      color: "var(--color-neutral-800)",
                      lineHeight: 1.55,
                      fontSize: 14.5,
                      margin: 0,
                    }}
                  >
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What hosting gives you */}
        <section
          style={{ maxWidth: 1100, margin: "0 auto", padding: "82px 28px" }}
        >
          <h6 style={{ marginBottom: 14 }}>What hosting gives you</h6>
          <h2
            style={{
              fontSize: "clamp(30px,3.6vw,44px)",
              letterSpacing: "-0.015em",
              margin: "0 0 12px",
            }}
          >
            The boring 80%, operated for you.
          </h2>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.6,
              color: "var(--color-neutral-800)",
              maxWidth: "58ch",
              margin: "0 0 34px",
            }}
          >
            The runtime is the hard part — order lifecycle, reconciliation,
            agent supervision and risk controls all have to keep running whether
            or not you are watching. Hosting is that work, done and monitored,
            without ever taking custody of what it trades with.
          </p>
          <div
            data-cv-2col
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 16,
            }}
          >
            {INCLUDED.map(([title, body]) => (
              <article
                key={title}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: 26,
                }}
              >
                <h3
                  style={{ fontSize: 20, lineHeight: 1.2, margin: "0 0 8px" }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    color: "var(--color-neutral-800)",
                    lineHeight: 1.6,
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section
          style={{
            background: "var(--color-neutral-100)",
            borderTop: "1px solid var(--color-divider)",
            borderBottom: "1px solid var(--color-divider)",
          }}
        >
          <div
            style={{ maxWidth: 1100, margin: "0 auto", padding: "82px 28px" }}
          >
            <h6 style={{ marginBottom: 14 }}>Managed hosting plans</h6>
            <h2
              style={{
                fontSize: "clamp(30px,3.6vw,44px)",
                letterSpacing: "-0.015em",
                margin: "0 0 12px",
              }}
            >
              Priced by how many agents you run.
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--color-neutral-800)",
                maxWidth: "60ch",
                margin: "0 0 34px",
              }}
            >
              Every plan includes one private cloud dashboard, persistent workspace
              data and managed hosting. Choose your agent capacity below.
              Connect your keys, approve your agent wallet and set your risk
              limits before enabling trading.
            </p>

            {/* The launch gate is disclosed BEFORE the prices, not below them: /hosted is reachable
              * from the primary nav, and a first-time visitor reads four priced cards first.
              * Renders only while the gate is shut, so it can never contradict a live checkout. */}
            {!salesEnabled && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--color-neutral-800)",
                  maxWidth: "72ch",
                  margin: "0 0 34px",
                  padding: "14px 18px",
                  border: "1px solid var(--color-divider)",
                  borderLeft: "3px solid var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                }}
              >
                <strong>Hosting is being prepared for launch.</strong> You can
                create an account now. Subscriptions are not yet available,
                and no payment will be taken.
              </p>
            )}

            {plans.length === 0 ? (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--color-neutral-800)",
                  maxWidth: "72ch",
                  margin: 0,
                  padding: "14px 18px",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                }}
              >
                Plan details are temporarily unavailable. Rather than show
                figures that might be out of date, this section stays blank until
                the live plan record can be read again.
              </p>
            ) : (
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(plans.length, 3)},minmax(0,1fr))`,
                  gap: 16,
                  alignItems: "stretch",
                }}
              >
                {plans.map((plan) => {
                  const isStarter = plan.id === "solo";
                  return (
                    <article
                      key={plan.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        padding: 28,
                        borderRadius: "calc(var(--radius-lg) * 1.15)",
                        background: isStarter
                          ? "var(--color-surface)"
                          : "var(--color-bg)",
                        border: `1px solid ${isStarter ? "var(--color-accent)" : "var(--color-divider)"}`,
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: isStarter
                              ? "var(--color-accent)"
                              : "var(--color-neutral-600)",
                          }}
                        >
                          {plan.name}
                        </span>
                        {isStarter && <span className="tag tag-accent">Start here</span>}
                      </div>
                      <div
                        style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 34,
                            fontWeight: 500,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {priceLabel(plan)}
                        </span>
                        {intervalLabel(plan) && (
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--color-neutral-600)",
                            }}
                          >
                            {intervalLabel(plan)}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span className="tag tag-neutral">{agentLabel(plan)}</span>
                        <span
                          className={isStarter ? "tag tag-neutral" : "tag tag-accent-2"}
                        >
                          {salesEnabled ? "Cloud hosted" : "Coming soon"}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.55,
                          color: "var(--color-neutral-800)",
                          margin: 0,
                        }}
                      >
                        {plan.description}
                      </p>
                      <div style={{ display: "grid", gap: 9, marginTop: 6 }}>
                        {plan.features.map((feature) => (
                          <div
                            key={feature}
                            style={{
                              display: "flex",
                              gap: 9,
                              alignItems: "flex-start",
                              fontSize: 14,
                              lineHeight: 1.4,
                            }}
                          >
                            <Tick />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/account/hosting"
                        className={isStarter ? "btn btn-primary" : "btn btn-secondary"}
                        style={{ marginTop: "auto", textAlign: "center" }}
                      >
                        {salesEnabled
                          ? `Choose ${plan.name}`
                          : "View activation status"}
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--color-neutral-700)",
                margin: "24px 0 0",
                maxWidth: "72ch",
              }}
            >
              Prices are in USD per month, plus applicable tax. AI provider usage,
              exchange fees and trading capital are not included. There is no
              free hosting tier. Creating an account does not start a subscription.
            </p>
          </div>
        </section>

        {/* Self-host vs hosted */}
        <section
          style={{ maxWidth: 1100, margin: "0 auto", padding: "82px 28px" }}
        >
          <h6 style={{ marginBottom: 14 }}>Self-host or hosted</h6>
          <h2
            style={{
              fontSize: "clamp(30px,3.6vw,44px)",
              letterSpacing: "-0.015em",
              margin: "0 0 30px",
            }}
          >
            Same source either way.
          </h2>
          <div
            style={{
              display: "grid",
              gap: 1,
              background: "var(--color-divider)",
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(180px,1.1fr) minmax(0,1fr) minmax(0,1fr)",
                gap: 20,
                background: "var(--color-neutral-100)",
                padding: "16px 24px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-600)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-600)",
                }}
              >
                Self-hosted edition
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                }}
              >
                Hosted
              </span>
            </div>
            {MATRIX.map(([feature, self, hosted]) => (
              <div
                key={feature}
                data-cv-rows
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(180px,1.1fr) minmax(0,1fr) minmax(0,1fr)",
                  gap: 20,
                  alignItems: "center",
                  background: "var(--color-bg)",
                  padding: "20px 24px",
                }}
              >
                <strong style={{ fontWeight: 600, fontSize: 15 }}>
                  {feature}
                </strong>
                <span
                  style={{
                    color: "var(--color-neutral-800)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                  }}
                >
                  {self}
                </span>
                <span
                  style={{
                    color: "var(--color-neutral-800)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                  }}
                >
                  {hosted}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          style={{
            background: "var(--color-neutral-100)",
            borderTop: "1px solid var(--color-divider)",
            borderBottom: "1px solid var(--color-divider)",
          }}
        >
          <div
            style={{ maxWidth: 900, margin: "0 auto", padding: "82px 28px" }}
          >
            <h6 style={{ marginBottom: 14 }}>Before you ask</h6>
            <h2
              style={{
                fontSize: "clamp(30px,3.6vw,44px)",
                letterSpacing: "-0.015em",
                margin: "0 0 30px",
              }}
            >
              The questions that actually matter.
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              {FAQ.map(([q, a]) => (
                <article
                  key={q}
                  style={{
                    background: "var(--color-bg)",
                    borderRadius: "var(--radius-lg)",
                    padding: "26px 28px",
                    border: "1px solid var(--color-divider)",
                  }}
                >
                  <h3 style={{ fontSize: 19, margin: "0 0 8px" }}>{q}</h3>
                  <p
                    style={{
                      color: "var(--color-neutral-800)",
                      lineHeight: 1.6,
                      fontSize: 15,
                      margin: 0,
                    }}
                  >
                    {a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery status */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "82px 28px 110px",
          }}
        >
          <h6 style={{ marginBottom: 14 }}>Where hosting is today</h6>
          <h2
            style={{
              fontSize: "clamp(30px,3.6vw,44px)",
              letterSpacing: "-0.015em",
              margin: "0 0 12px",
            }}
          >
            The control plane is built. Live activation stays gated.
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--color-neutral-800)",
              maxWidth: "62ch",
              margin: "0 0 30px",
            }}
          >
            These plans run agents against real accounts, so tenant isolation,
            secrets, monitoring, loadout sync, recovery and subscription
            operations each pass a production review before a single plan goes
            on sale.
          </p>
          <div
            style={{
              display: "grid",
              gap: 1,
              background: "var(--color-divider)",
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {STATUS.map(([title, state, description]) => (
              <div
                key={title}
                data-cv-rows
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(170px,0.55fr) 120px minmax(0,1.45fr)",
                  gap: 20,
                  alignItems: "center",
                  background: "var(--color-bg)",
                  padding: "22px 24px",
                }}
              >
                <strong style={{ fontWeight: 600, fontSize: 15 }}>
                  {title}
                </strong>
                <span
                  className={
                    state === "Built" ? "tag tag-accent-2" : "tag tag-neutral"
                  }
                >
                  {state}
                </span>
                <span
                  style={{
                    color: "var(--color-neutral-800)",
                    lineHeight: 1.5,
                    fontSize: 14.5,
                  }}
                >
                  {description}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 32,
            }}
          >
            <Link
              href="/account/hosting"
              className="btn btn-primary"
              style={{ height: 48, padding: "0 24px" }}
            >
              {salesEnabled
                ? "Choose a hosted plan"
                : "Prepare my hosting account"}
            </Link>
            <Link
              href="/account/login"
              className="btn btn-secondary"
              style={{ height: 48, padding: "0 22px" }}
            >
              Sign in to your account
            </Link>
          </div>

          <p
            style={{
              color: "var(--color-neutral-700)",
              lineHeight: 1.6,
              fontSize: 14.5,
              marginTop: 24,
              maxWidth: "72ch",
            }}
          >
            Hosted access remains optional. Buying a source licence does not
            create a hosted subscription, and preparing an account does not
            authorise a charge. Hosting a trading agent does not reduce trading
            risk — on a live plan these agents trade real money in your own
            account, and you remain responsible for your strategy, your risk
            limits and your capital. <Link href="/disclaimer">Full disclaimer</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
