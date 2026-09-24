"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import "./hosting.css";

// Supabase returns heterogeneous JSON rows for this read-only aggregate view.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type AccountData = {
  config: {
    salesEnabled: boolean;
    availabilityReason?: "open" | "full" | "paused" | "unavailable";
    serviceTermsVersion: string;
    soloTrialDays: number;
    trialEligible: boolean;
  };
  plans: Row[];
  subscriptions: Row[];
  onboarding: Row[];
  instances: Row[];
  incidents: Row[];
  usage: Row[];
  audit: Row[];
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
  const [provision, setProvision] = useState<{
    tenant: Row | null;
    command: Row | null;
  } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [runtime, setRuntime] = useState<Row | null>(null);
  const [runtimeError, setRuntimeError] = useState("");
  const [provisionError, setProvisionError] = useState("");
  const [refresh, setRefresh] = useState(0);
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
  }, [session?.access_token]);
  useEffect(() => {
    if (user && session)
      load()
        .then(() => setError(""))
        .catch((reason) => setError(reason.message));
  }, [user, session, load, refresh]);

  // A subscription row that never resulted in a live billing relationship (a checkout that
  // expired before payment, or one the customer canceled) must not permanently occupy this
  // account's one-subscription-at-a-time UI. Falling back to subscriptions[0] here — instead of
  // treating "no live subscription" as "show the plan picker again" — is what previously trapped
  // a customer whose only row was incomplete_expired: no Subscribe button, and no working "Manage
  // billing" button either, since that dead row never got a Stripe customer id attached.
  const subscription = data?.subscriptions.find(
    (row) => !["incomplete_expired", "canceled"].includes(row.status),
  );

  // Refresh provisioning quickly during setup and every 30 seconds once settled.
  const subscriptionId = subscription?.id;
  useEffect(() => {
    if (subscription?.status !== "pending_checkout") return;
    const timer = setInterval(() => {
      load().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [subscription?.status, load]);
  useEffect(() => {
    if (!subscriptionId || !session?.access_token) {
      setProvision(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/hosting/provision-status?subscriptionId=${encodeURIComponent(subscriptionId)}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          },
        );
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok)
          throw new Error(
            body.error || "Provisioning status could not be loaded.",
          );
        setProvision(body);
        setProvisionError("");
        const status = body?.command?.status;
        if (
          !cancelled &&
          subscription?.status !== "pending_checkout" &&
          status !== "failed"
        ) {
          timer = setTimeout(
            poll,
            status === "queued" || status === "claimed" ? 6000 : 30000,
          );
        }
      } catch (reason) {
        if (!cancelled) {
          setProvisionError(
            reason instanceof Error
              ? reason.message
              : "Provisioning status unavailable",
          );
          timer = setTimeout(poll, 15000);
        }
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [subscriptionId, subscription?.status, session?.access_token, refresh]);
  const onboarding = data?.onboarding.find(
    (row) => row.subscription_id === subscription?.id,
  );
  const walletVerificationNeeded = Boolean(
    subscription && ["active", "trialing"].includes(subscription.status)
      && !onboarding?.account_address && provision?.tenant
      && !provision.command,
  );
  const plan = data?.plans.find((row) => row.id === subscription?.plan_id);
  useEffect(() => {
    if (!session?.access_token || !provision?.tenant?.slug) { setRuntime(null); return; }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch("/api/account/instance", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Runtime status unavailable");
        if (!stopped) {
          setRuntime(body);
          setRuntimeError("");
        }
      } catch (reason) {
        if (!stopped) {
          setRuntime(null);
          setRuntimeError(
            reason instanceof Error
              ? reason.message
              : "Runtime status unavailable",
          );
        }
      } finally {
        if (!stopped) timer = setTimeout(poll, 30000);
      }
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [session?.access_token, provision?.tenant?.slug, refresh]);

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

  const openDashboard = async () => {
    setBusy("dashboard");
    setError("");
    try {
      const response = await fetch("/api/account/dashboard-link", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error || "The live dashboard is temporarily unavailable.",
        );
      window.location.assign(body.url);
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
          {error && (
            <button
              className="btn btn-secondary"
              onClick={() => setRefresh((value) => value + 1)}
            >
              Retry
            </button>
          )}
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="cival">
      <Navbar />
      <main
        className="cival-fade hosting-account"
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
                Your subscription, dashboard access and workspace setup in one
                place.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                disabled={!!busy}
                onClick={() => setRefresh((value) => value + 1)}
              >
                Refresh status
              </button>
              <Link className="btn btn-primary" href="/account/funding">
                Wallet & funding
              </Link>
              <Link className="btn btn-secondary" href="/account">
                Source purchases
              </Link>
              {!subscription && data.subscriptions.some(row => row.stripe_customer_id) && <button className="btn btn-secondary" disabled={!!busy} onClick={() => call("portal", "/api/hosting/portal")}>Past invoices & billing</button>}
            </div>
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
              <strong>{data.config.availabilityReason === "full" ? "Hosted workspaces are at capacity." : "Hosted checkout is not open yet."}</strong>
              <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                {data.config.availabilityReason === "full"
                  ? "Existing subscriptions remain available. New trials and subscriptions will reopen when a verified host slot is available. No payment will be taken while checkout is closed."
                  : "You can review the service and prepare your account. No new payment or subscription can be created until hosting is available."}
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
          {walletVerificationNeeded && (
            <section role="status" style={{ padding: 20, border: "1px solid var(--color-accent)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)", marginBottom: 20 }}>
              <strong>Action needed: verify your wallet to create your dashboard</strong>
              <p style={{ margin: "8px 0 14px", color: "var(--color-neutral-700)" }}>
                Your Solo trial is active, but hosting cannot start until you prove ownership of the wallet you want to use. This does not transfer funds or enable trading. Provisioning resumes automatically after verification.
              </p>
              <Link className="btn btn-primary" href="/account/funding">Connect and verify wallet</Link>
            </section>
          )}

          {!subscription ? (
            <section>
              <h2 style={{ fontSize: 20 }}>Choose your managed plan</h2>
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 14,
                }}
              >
                {data.plans
                  .filter((item) => item.is_active && item.price_cents > 0)
                  .map((item) => (
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
                            {`/${item.billing_interval}`}
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
                        {item.id === "solo" && data.config.trialEligible && (
                          <span
                            style={{
                              display: "block",
                              marginTop: 12,
                              fontWeight: 600,
                            }}
                          >
                            7 days free, then $
                            {(item.price_cents / 100).toFixed(2)}/
                            {item.billing_interval}. Payment method required.
                            Cancel before the trial ends to avoid the first
                            charge.
                          </span>
                        )}
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
                          : item.id === "solo" && data.config.trialEligible
                            ? "Start 7-day Solo trial"
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
                  <Link href="/hosting-terms">
                    Managed Hosting Service Terms
                  </Link>{" "}
                  version {data.config.serviceTermsVersion}. I authorize
                  recurring billing at the selected plan’s displayed price,
                  after any eligible seven-day Solo trial, until I cancel.
                  Stripe securely collects my payment method. I can cancel in
                  Manage billing before the trial ends to avoid the first
                  charge.
                </span>
              </label>
            </section>
          ) : (
            <>
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  ["Plan", plan?.name || subscription.plan_id],
                  ["Billing", subscription.status],
                  [
                    "Runtime",
                    walletVerificationNeeded ? "awaiting wallet" : runtime?.processState ||
                      provision?.tenant?.status ||
                      "not provisioned",
                  ],
                  [
                    "Health",
                    runtimeError
                      ? "unavailable"
                      : runtime?.health || "not yet reported",
                  ],
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
                    <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>
                      Subscription and service
                    </h2>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Status value={subscription.status} />
                      {subscription.livemode === false && <Status value="test billing" />}
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
                {subscription.livemode === false && <p>This subscription uses Stripe test billing. Its invoices do not charge real money. Billing mode is separate from the trading network; verify that network inside your dashboard.</p>}
                {["past_due", "unpaid", "incomplete"].includes(subscription.status) && <p role="alert">Billing needs attention. Open Manage billing to review the invoice and update your payment method. Dashboard access may be restricted until payment is resolved.</p>}
                {subscription.cancel_at_period_end && <p>Service is scheduled to end at the date below. Review your open positions before access ends; canceling hosting does not close exchange positions.</p>}
                <p
                  style={{ color: "var(--color-neutral-700)", marginBottom: 0 }}
                >
                  {subscription.status === "trialing"
                    ? "Your free trial ends "
                    : "Current period ends "}{" "}
                  {(
                    subscription.status === "trialing"
                      ? subscription.trial_end
                      : subscription.current_period_end
                  )
                    ? new Date(
                        subscription.status === "trialing"
                          ? subscription.trial_end
                          : subscription.current_period_end,
                      ).toLocaleString()
                    : "after activation"}
                  .{" "}
                  {subscription.status === "trialing" &&
                    (subscription.cancel_at_period_end
                      ? "Cancellation is scheduled; the trial will not renew."
                      : `Your saved payment method will be charged $${((plan?.price_cents || 0) / 100).toFixed(2)}/${plan?.billing_interval || "month"} afterward unless you cancel before this time.`)}
                </p>
              </section>

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
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 20 }}>
                    Your hosted dashboard
                  </h2>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    {walletVerificationNeeded && <Status value="awaiting wallet" />}
                    {provision?.command && (
                      <Status
                        value={
                          provision.command.status === "done"
                            ? provision.tenant?.status || "provisioned"
                            : provision.command.status
                        }
                      />
                    )}
                    {provision?.tenant?.status === "active" && (
                      <button
                        className="btn btn-primary"
                        disabled={!!busy}
                        onClick={openDashboard}
                      >
                        {busy === "dashboard" ? "Opening..." : "Open dashboard"}
                      </button>
                    )}
                  </div>
                </div>
                {subscription.status === "pending_checkout" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 16,
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      disabled={!!busy}
                      onClick={() =>
                        call(
                          "resume-checkout",
                          "/api/hosting/checkout-session",
                          { subscriptionId: subscription.id, action: "resume" },
                        )
                      }
                    >
                      Continue secure checkout
                    </button>
                    <button
                      className="btn btn-secondary"
                      disabled={!!busy}
                      onClick={() =>
                        call(
                          "cancel-checkout",
                          "/api/hosting/checkout-session",
                          { subscriptionId: subscription.id, action: "cancel" },
                        )
                      }
                    >
                      Cancel checkout and choose a plan
                    </button>
                  </div>
                )}
                {!provision?.tenant &&
                  !onboarding?.account_address &&
                  ["active", "trialing"].includes(subscription.status) && (
                    <p>
                      Your plan is active.{" "}
                      <Link href="/account/funding">
                        Connect and verify your wallet
                      </Link>{" "}
                      to create your dashboard. Setup continues automatically
                      after verification.
                    </p>
                  )}
                {!provision?.tenant ? (
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    {subscription.status === "pending_checkout"
                      ? "Complete secure checkout to activate your subscription or eligible trial. No trading funds are included."
                      : !onboarding?.account_address
                        ? "Connect and verify your wallet to continue setup."
                        : "Your wallet is verified. Waiting for workspace provisioning; status updates automatically."}
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {walletVerificationNeeded && <p style={{ margin: "4px 0" }}>No server setup has been queued yet. <Link href="/account/funding">Verify your wallet</Link> to start it automatically.</p>}
                    {[
                      ["Workspace", provision.tenant.slug],
                      ["Runtime status", provision.tenant.status],
                      [
                        "Queued",
                        provision.command?.requestedAt
                          ? new Date(
                              provision.command.requestedAt,
                            ).toLocaleString()
                          : "-",
                      ],
                      [
                        "Claimed by host agent",
                        provision.command?.claimedAt
                          ? new Date(
                              provision.command.claimedAt,
                            ).toLocaleString()
                          : "not yet",
                      ],
                      [
                        "Finished",
                        provision.command?.finishedAt
                          ? new Date(
                              provision.command.finishedAt,
                            ).toLocaleString()
                          : "in progress",
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
                    {provision.command?.status === "failed" && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: 14,
                          border: "1px solid #783333",
                          background: "#240d0d",
                          borderRadius: "var(--radius-md)",
                          color: "#ffb4b4",
                          fontSize: 13,
                        }}
                      >
                        <strong>Dashboard setup needs attention.</strong>{" "}
                        <Link href="/contact?subject=Hosting%20provisioning">
                          Contact hosting support
                        </Link>{" "}
                        and reference subscription {subscription.id}. Your
                        wallet does not need to be re-approved solely because
                        server provisioning failed.
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 18,
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: 22 }}>
                  Set up and operate your workspace
                </h2>
                <p
                  style={{ color: "var(--color-neutral-700)", lineHeight: 1.7 }}
                >
                  Use the connected wallet and workspace controls below. Agent
                  choices are installed through the workspace loadout; risk
                  limits are configured in the dashboard.
                </p>
                <div
                  className="hosting-steps"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 16,
                  }}
                >
                  <article>
                    <h3>1. Connect your wallet</h3>
                    <p>
                      Verify wallet ownership and approve the trade-only key.
                      Check the network before funding.
                    </p>
                    <Link className="btn btn-secondary" href="/account/funding">
                      Connect wallet & approve key
                    </Link>
                  </article>
                  <article>
                    <h3>2. Deposit or withdraw</h3>
                    <p>
                      Open the dashboard’s Deposit &amp; Withdraw page to authorize transfers from your own wallet. Hosting fees do not fund trading.
                    </p>
                    <button className="btn btn-secondary" disabled={!!busy || provision?.tenant?.status !== "active"} onClick={openDashboard}>Open dashboard for transfers</button>
                  </article>
                  <article>
                    <h3>3. Choose your agents</h3>
                    <p>
                      {plan?.agent_limit
                        ? `Your plan supports ${plan.agent_limit} simultaneous agent${plan.agent_limit === 1 ? "" : "s"}. `
                        : ""}
                      Select available strategies and markets, then review
                      installation status.
                    </p>
                    {provision?.tenant ? (
                      <Link
                        className="btn btn-secondary"
                        href="/account/instance#agents"
                      >
                        Configure agents
                      </Link>
                    ) : (
                      <p>Available after your dashboard is provisioned.</p>
                    )}
                  </article>
                  <article>
                    <h3>4. Review trading controls</h3>
                    <p>
                      Review recent cycles and pause controls in your workspace.
                      Open the dashboard to configure strategy limits and
                      monitor positions.
                    </p>
                    {provision?.tenant ? (
                      <Link
                        className="btn btn-secondary"
                        href="/account/instance"
                      >
                        Manage workspace
                      </Link>
                    ) : (
                      <p>Complete wallet verification to continue.</p>
                    )}
                  </article>
                </div>
              </section>

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
                  <h2 style={{ marginTop: 0, fontSize: 20 }}>Service health</h2>
                  {runtimeError && <p role="alert">{runtimeError}</p>}
                  {provisionError && <p role="alert">{provisionError}</p>}
                  {runtime ? (
                    <dl style={{ display: "grid", gap: 12 }}>
                      <div>
                        <dt>Process</dt>
                        <dd>{runtime.processState}</dd>
                      </div>
                      <div>
                        <dt>Health</dt>
                        <dd>{runtime.health}</dd>
                      </div>
                      <div>
                        <dt>New trade entries</dt>
                        <dd>
                          {runtime.halt?.active
                            ? "Paused"
                            : "Allowed by workspace control"}
                        </dd>
                      </div>
                      <div>
                        <dt>Scheduled cycles</dt>
                        <dd>
                          {runtime.schedule?.enabled ? "Enabled" : "Disabled"}
                        </dd>
                      </div>
                      <div>
                        <dt>Last heartbeat</dt>
                        <dd>
                          {runtime.heartbeatAt
                            ? new Date(runtime.heartbeatAt).toLocaleString()
                            : "Not reported"}
                        </dd>
                      </div>
                      <div>
                        <dt>Last cycle</dt>
                        <dd>
                          {(runtime.lastCycleAt || runtime.recentCycles?.[0]?.started_at)
                            ? new Date(runtime.lastCycleAt || runtime.recentCycles[0].started_at).toLocaleString()
                            : "Not reported"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p>
                      Current runtime status appears once the workspace is
                      provisioned. Status refreshes every 30 seconds.
                    </p>
                  )}
                  <p
                    style={{ fontSize: 13, color: "var(--color-neutral-700)" }}
                  >
                    An enabled scheduler does not guarantee a trade signal.
                    Verify testnet or mainnet and your risk settings in the
                    dashboard.
                  </p>
                </section>
                <section
                  style={{
                    padding: 24,
                    border: "1px solid var(--color-divider)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <h2 style={{ marginTop: 0, fontSize: 20 }}>
                    Customer-visible incidents
                  </h2>
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
