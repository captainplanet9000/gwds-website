"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const HOSTING_AGENT_IDS = [
  "darvas-box",
  "elliott-wave",
  "vwap-momentum",
  "heikin-ashi",
  "mean-reversion",
  "macro-sentiment",
  "regime-coordinator",
] as const;

// Supabase returns heterogeneous JSON rows for this read-only aggregate view.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type AccountData = {
  config: { salesEnabled: boolean; serviceTermsVersion: string };
  plans: Row[];
  subscriptions: Row[];
  onboarding: Row[];
  instances: Row[];
  incidents: Row[];
  usage: Row[];
  audit: Row[];
};

const field: React.CSSProperties = {
  width: "100%",
  background: "var(--color-neutral-100)",
  color: "var(--color-text)",
  border: "1px solid var(--color-divider)",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
};

function Status({ value }: { value: string }) {
  const good = [
    "active",
    "healthy",
    "complete",
    "approved",
    "resolved",
    "trialing",
  ].includes(value);
  return (
    <span className={good ? "tag tag-accent-2" : "tag tag-neutral"}>
      {value?.replaceAll("_", " ") || "unknown"}
    </span>
  );
}

export default function HostingAccountPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    workspaceName: "",
    environment: "paper",
    region: "iad1",
    riskProfile: "conservative",
    maxDrawdownPct: "5",
    maxPositionUsd: "",
    customerNotes: "",
    requestedAgents: ["darvas-box"] as string[],
  });

  useEffect(() => {
    if (!authLoading && !user)
      router.replace("/account/login?next=/account/hosting");
  }, [authLoading, user, router]);
  const load = useCallback(async () => {
    if (!session?.access_token) return;
    const response = await fetch("/api/hosting/account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error || "Hosting account could not be loaded");
    setData(body);
    const current = body.onboarding?.[0];
    if (current)
      setForm({
        workspaceName: current.workspace_name || "",
        environment: "paper",
        region: current.region || "iad1",
        riskProfile: current.risk_profile || "conservative",
        maxDrawdownPct: current.max_drawdown_pct?.toString() || "5",
        maxPositionUsd: current.max_position_usd?.toString() || "",
        customerNotes: current.customer_notes || "",
        requestedAgents: current.requested_agents || ["darvas-box"],
      });
  }, [session?.access_token]);
  useEffect(() => {
    if (user && session) load().catch((reason) => setError(reason.message));
  }, [user, session, load]);

  const subscription =
    data?.subscriptions.find((row) =>
      [
        "trialing",
        "active",
        "past_due",
        "paused",
        "unpaid",
        "pending_checkout",
      ].includes(row.status),
    ) || data?.subscriptions[0];
  const onboarding = data?.onboarding.find(
    (row) => row.subscription_id === subscription?.id,
  );
  const instance = data?.instances.find(
    (row) => row.subscription_id === subscription?.id,
  );
  const plan = data?.plans.find((row) => row.id === subscription?.plan_id);
  const usage = useMemo(
    () =>
      (data?.usage || [])
        .filter((row) => row.subscription_id === subscription?.id)
        .reduce((total, row) => total + Number(row.agent_hours || 0), 0),
    [data, subscription?.id],
  );

  const call = async (
    key: string,
    url: string,
    body?: Record<string, unknown>,
    method = "POST",
  ) => {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      if (result.stripeUrl || result.url) {
        window.location.assign(result.stripeUrl || result.url);
        return;
      }
      setNotice("Saved. Your operations status has been updated.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request failed");
    } finally {
      setBusy("");
    }
  };

  if (authLoading || !user || !data)
    return (
      <div className="cival">
        <Navbar />
        <main
          style={{ minHeight: "100vh", paddingTop: 180, textAlign: "center" }}
        >
          {error || "Loading hosting account..."}
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="cival">
      <Navbar />
      <main
        className="cival-fade"
        style={{ minHeight: "100vh", padding: "130px 24px 90px" }}
      >
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginBottom: 34,
            }}
          >
            <div>
              <span className="tag tag-accent">Managed hosting</span>
              <h1
                style={{
                  fontSize: "clamp(34px,5vw,54px)",
                  margin: "16px 0 8px",
                }}
              >
                Your Cival workspace
              </h1>
              <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>
                Billing, onboarding, deployment, health, incidents and usage in
                one place.
              </p>
            </div>
            <Link className="btn btn-secondary" href="/account">
              Source purchases
            </Link>
          </div>
          {!data.config.salesEnabled && (
            <div
              style={{
                padding: 20,
                border: "1px solid #8a762d",
                background: "#1d1909",
                borderRadius: "var(--radius-lg)",
                marginBottom: 20,
                color: "#e7d991",
              }}
            >
              <strong>Hosted checkout is not open yet.</strong>
              <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                You can review the complete service and prepare your account. No
                payment or subscription can be created until every runtime
                launch gate passes.
              </div>
            </div>
          )}
          {error && (
            <div
              style={{
                padding: 16,
                border: "1px solid #783333",
                background: "#240d0d",
                borderRadius: "var(--radius-md)",
                color: "#ffb4b4",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              style={{
                padding: 16,
                border: "1px solid var(--color-accent)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-accent)",
                marginBottom: 16,
              }}
            >
              {notice}
            </div>
          )}

          {!subscription ? (
            <section>
              <h2>Choose your managed plan</h2>
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                  gap: 14,
                }}
              >
                {data.plans.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      padding: 24,
                      background: "var(--color-surface)",
                      border: `1px solid ${item.id === "desk" ? "var(--color-accent)" : "var(--color-divider)"}`,
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <span className="tag tag-neutral">{item.name}</span>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 30,
                          marginTop: 14,
                        }}
                      >
                        {item.price_cents
                          ? `$${(item.price_cents / 100).toFixed(0)}`
                          : "Free"}
                        <small
                          style={{
                            fontSize: 12,
                            color: "var(--color-neutral-600)",
                          }}
                        >
                          {item.price_cents ? "/mo" : ""}
                        </small>
                      </div>
                    </div>
                    <p
                      style={{
                        color: "var(--color-neutral-700)",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </p>
                    <div style={{ display: "grid", gap: 7, fontSize: 13 }}>
                      {(item.features || []).map((feature: string) => (
                        <span key={feature}>✓ {feature}</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: "auto" }}
                      disabled={
                        !!busy ||
                        !data.config.salesEnabled ||
                        !item.launch_ready ||
                        item.price_cents === 0 ||
                        !acceptedTerms
                      }
                      onClick={() =>
                        call(`checkout-${item.id}`, "/api/hosting/checkout", {
                          planId: item.id,
                          acceptedTerms,
                        })
                      }
                    >
                      {!data.config.salesEnabled || !item.launch_ready
                        ? "Activation pending"
                        : item.price_cents === 0
                          ? "Paper access pending"
                          : "Subscribe securely"}
                    </button>
                  </article>
                ))}
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: "var(--color-neutral-700)",
                  fontSize: 13,
                  marginTop: 18,
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  I accept the <Link href="/terms">Terms</Link>,{" "}
                  <Link href="/refunds">Refund Policy</Link>,{" "}
                  <Link href="/disclaimer">Trading Disclaimer</Link>, and{" "}
                  <Link href="/hosting-terms">Managed Hosting Service Terms</Link>{" "}
                  version {data.config.serviceTermsVersion}. Stripe manages billing and cancellation.
                </span>
              </label>
            </section>
          ) : (
            <>
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  ["Plan", plan?.name || subscription.plan_id],
                  ["Billing", subscription.status],
                  ["Runtime", instance?.status || "awaiting setup"],
                  ["Health", instance?.health_status || "unknown"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 20,
                      border: "1px solid var(--color-divider)",
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--color-neutral-600)",
                        fontSize: 12,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{ fontSize: 19, fontWeight: 700, marginTop: 8 }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <section
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 18,
                  background: "var(--color-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ margin: "0 0 6px" }}>
                      Subscription and service
                    </h2>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Status value={subscription.status} />
                      {subscription.cancel_at_period_end && (
                        <Status value="cancels at period end" />
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    disabled={!!busy || !subscription.stripe_customer_id}
                    onClick={() => call("portal", "/api/hosting/portal")}
                  >
                    Manage billing, invoices, or cancellation
                  </button>
                </div>
                <p
                  style={{ color: "var(--color-neutral-700)", marginBottom: 0 }}
                >
                  Current period ends{" "}
                  {subscription.current_period_end
                    ? new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString()
                    : "after activation"}
                  . Agent usage this period: {usage.toFixed(1)} hours.
                </p>
              </section>

              {onboarding && (
                <section
                  style={{
                    padding: 26,
                    border: "1px solid var(--color-divider)",
                    borderRadius: "var(--radius-lg)",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>Workspace onboarding</h2>
                    <Status value={onboarding.status} />
                  </div>
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    This service supports paper research only. It never accepts
                    exchange credentials, wallet secrets, seed phrases, or
                    private keys.
                  </p>
                  <div
                    data-cv-2col
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                      gap: 12,
                    }}
                  >
                    <label>
                      Workspace name
                      <input
                        style={field}
                        value={form.workspaceName}
                        onChange={(e) =>
                          setForm({ ...form, workspaceName: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Region
                      <select
                        style={field}
                        value={form.region}
                        onChange={(e) =>
                          setForm({ ...form, region: e.target.value })
                        }
                      >
                        {["iad1", "sfo1", "fra1", "sin1"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Environment
                      <input style={field} value="Paper only" readOnly />
                    </label>
                    <label>
                      Risk profile
                      <select
                        style={field}
                        value={form.riskProfile}
                        onChange={(e) =>
                          setForm({ ...form, riskProfile: e.target.value })
                        }
                      >
                        <option value="conservative">Conservative</option>
                        <option value="balanced">Balanced</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    <label>
                      Maximum drawdown %
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        style={field}
                        value={form.maxDrawdownPct}
                        onChange={(e) =>
                          setForm({ ...form, maxDrawdownPct: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Maximum position USD
                      <input
                        type="number"
                        min="1"
                        style={field}
                        value={form.maxPositionUsd}
                        onChange={(e) =>
                          setForm({ ...form, maxPositionUsd: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <strong>Requested agents</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {HOSTING_AGENT_IDS.map((agent) => (
                        <label
                          key={agent}
                          style={{
                            padding: "8px 10px",
                            border: "1px solid var(--color-divider)",
                            borderRadius: 999,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={form.requestedAgents.includes(agent)}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                requestedAgents: e.target.checked
                                  ? [...form.requestedAgents, agent]
                                  : form.requestedAgents.filter(
                                      (item) => item !== agent,
                                    ),
                              })
                            }
                          />{" "}
                          {agent}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label style={{ display: "block", marginTop: 16 }}>
                    Notes
                    <textarea
                      style={{ ...field, minHeight: 90 }}
                      value={form.customerNotes}
                      onChange={(e) =>
                        setForm({ ...form, customerNotes: e.target.value })
                      }
                    />
                  </label>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 14 }}
                    disabled={!!busy}
                    onClick={() =>
                      call(
                        "onboarding",
                        "/api/hosting/onboarding",
                        {
                          subscriptionId: subscription.id,
                          ...form,
                          maxDrawdownPct: Number(form.maxDrawdownPct) || null,
                          maxPositionUsd: Number(form.maxPositionUsd) || null,
                        },
                        "PUT",
                      )
                    }
                  >
                    Submit for operator review
                  </button>
                </section>
              )}

              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: 16,
                }}
              >
                <section
                  style={{
                    padding: 24,
                    border: "1px solid var(--color-divider)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>Service health</h2>
                  {instance ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {[
                        ["Runtime", instance.health_status],
                        ["Backups", instance.backup_status],
                        [
                          "Last heartbeat",
                          instance.last_heartbeat_at
                            ? new Date(
                                instance.last_heartbeat_at,
                              ).toLocaleString()
                            : "not yet",
                        ],
                        [
                          "Recovery test",
                          instance.last_recovery_test_at
                            ? new Date(
                                instance.last_recovery_test_at,
                              ).toLocaleDateString()
                            : "not yet",
                        ],
                        [
                          "Release",
                          instance.release_version || "awaiting deployment",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1px solid var(--color-divider)",
                            paddingTop: 10,
                          }}
                        >
                          <span>{label}</span>
                          <span style={{ color: "var(--color-neutral-700)" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>
                      Instance creation begins after subscription activation.
                    </p>
                  )}
                </section>
                <section
                  style={{
                    padding: 24,
                    border: "1px solid var(--color-divider)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>Customer-visible incidents</h2>
                  {data.incidents.length ? (
                    data.incidents.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          borderTop: "1px solid var(--color-divider)",
                          padding: "10px 0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <strong>{row.title}</strong>
                          <Status value={row.status} />
                        </div>
                        <p
                          style={{
                            color: "var(--color-neutral-700)",
                            fontSize: 13,
                          }}
                        >
                          {row.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--color-neutral-700)" }}>
                      No reported incidents.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
