"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  deriveProvisionState,
  provisionPollDelayMs,
  selectCurrentSubscription,
} from "@/lib/hosting-lifecycle";

// The wallet panel is the only part of this page that needs wagmi/viem and a browser wallet, so it
// loads as its own chunk and only in the browser; the rest of the page never ships them.
const HostingWalletPanel = dynamic(
  () => import("@/components/account/HostingWalletPanel"),
  { ssr: false },
);

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
  // The current subscription's workspace network; null until it is known. Never guessed.
  network?: "mainnet" | "testnet" | null;
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

// One line of history for a customer whose last subscription is closed, shown above the plan
// picker so they can see what happened and subscribe again.
function closedSubscriptionHistory(row: Row, plans: Row[]): string {
  const name = plans.find((plan) => plan.id === row.plan_id)?.name || row.plan_id;
  const when = row.updated_at
    ? ` on ${new Date(row.updated_at).toLocaleDateString()}`
    : "";
  return row.status === "canceled"
    ? `Your previous ${name} subscription was canceled${when}.`
    : `Your previous ${name} checkout was not completed${when}.`;
}

// Reports what the server decided about the saved settings, not what the page hoped for.
function onboardingNotice(result: Row): string {
  if (result.decision?.status === "approved") {
    return result.loadout?.synced
      ? "Saved and approved. Your requested agents are recorded for your workspace."
      : "Saved and approved. Once your workspace is ready, confirm your agents on your instance page.";
  }
  return `Saved. These settings are held for operator review: ${result.decision?.reason || "an operator will check them."}`;
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
  const [checkoutSucceeded, setCheckoutSucceeded] = useState(false);
  const [pollNonce, setPollNonce] = useState(0);
  // `environment` is deliberately NOT in this form.
  //
  // It used to be, hardcoded to "paper", and it was spread into the PUT body below. The server
  // (/api/hosting/onboarding) has always ignored it and written its own value, so the field never
  // did anything except state a claim the page had no authority to make — and once the paid tiers
  // became live-execution plans, the claim was wrong as well as inert.
  //
  // It is removed rather than corrected to the plan's execution mode. Sending the derived mode
  // would post "simulated"/"live" into a column whose CHECK constraint is ('paper','live'), and,
  // worse, would leave a browser-controlled field named `environment` sitting in the request body
  // of the route that decides whether a workspace can route real orders. The next person to make
  // the client and server "agree" would be one `body.environment` away from letting a customer
  // arm live execution from devtools. The server is the only writer; the browser now says nothing.
  const [form, setForm] = useState({
    workspaceName: "",
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
  // Stripe returns here with ?checkout=success. Read once from the URL on mount rather than with
  // useSearchParams, which would need a Suspense boundary around this whole client page.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("checkout") === "success")
      setCheckoutSucceeded(true);
  }, []);
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
  // Called by the wallet panel after it changes something: refresh the account and restart the
  // provisioning poll straight away instead of waiting out its current delay.
  const reload = useCallback(() => {
    setPollNonce((value) => value + 1);
    load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : "Hosting account could not be loaded"),
    );
  }, [load]);

  // Only an OPEN subscription is "the" subscription. A canceled or abandoned one becomes history
  // above the plan picker, so the customer can subscribe again.
  const { current: subscription, lastClosed } = selectCurrentSubscription(
    data?.subscriptions,
  );

  // Real provisioning progress — polled directly from control.tenant_commands via
  // /api/hosting/provision-status, never a spinner standing in for unknown state. The cadence comes
  // from provisionPollDelayMs(): fast while the system is working, slow while it waits on the
  // customer's wallet or an automatic retry, and stopped once the workspace is ready.
  const subscriptionId = subscription?.id;
  const subscriptionStatus: string | undefined = subscription?.status;
  useEffect(() => {
    if (
      !subscriptionId ||
      !session?.access_token ||
      subscriptionStatus === "pending_checkout" ||
      subscriptionStatus === "incomplete"
    ) {
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
        if (response.ok) setProvision(body);
        const delay = provisionPollDelayMs(
          deriveProvisionState({
            subscriptionStatus,
            tenant: body?.tenant,
            command: body?.command,
          }),
        );
        if (delay !== null) timer = setTimeout(poll, delay);
      } catch {
        if (!cancelled) timer = setTimeout(poll, 10000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [subscriptionId, subscriptionStatus, session?.access_token, pollNonce]);
  const provisionState = subscription
    ? deriveProvisionState({
        subscriptionStatus: subscription.status,
        tenant: provision?.tenant,
        command: provision?.command,
      })
    : null;
  // The runtime and health cards come from the account payload, so refresh it once the workspace
  // turns ready rather than leaving them a poll behind.
  useEffect(() => {
    if (provisionState === "ready") load().catch(() => {});
  }, [provisionState, load]);
  // Back from Stripe before its webhook has landed: the row still says pending_checkout. Re-read
  // the account for up to two minutes until it moves.
  const awaitingPaymentConfirmation =
    checkoutSucceeded && subscription?.status === "pending_checkout";
  useEffect(() => {
    if (!awaitingPaymentConfirmation) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > 24) clearInterval(timer);
      else load().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [awaitingPaymentConfirmation, load]);
  const onboarding = data?.onboarding.find(
    (row) => row.subscription_id === subscription?.id,
  );
  const instance = data?.instances.find(
    (row) => row.subscription_id === subscription?.id,
  );
  const plan = data?.plans.find((row) => row.id === subscription?.plan_id);

  // What the plan SELLS, derived from price and never from the plan's name or id — the same rule
  // planExecutionMode() applies in src/lib/hosting.ts, which /hosted renders from. Restated here
  // instead of imported because @/lib/hosting reaches @/lib/commerce -> @/lib/supabase, which
  // reads SUPABASE_SERVICE_ROLE_KEY; that module must never be pulled into a "use client" bundle.
  // Price is the reason, not a label: a plan that costs nothing executes nothing, so a renamed
  // free tier can never accidentally read as live here.
  const planRunsLiveAgents = Number(plan?.price_cents ?? 0) > 0;

  // What the service actually RECORDED for this workspace. /api/hosting/onboarding writes this
  // column server-side and discards whatever the browser sent, so the stored row is the only
  // honest thing to show the customer. Reading it (rather than printing a constant) also means
  // the field stops lying by itself on the day the server starts writing 'live' — the copy tracks
  // the gate instead of having to be remembered and edited alongside it.
  const recordedEnvironment: string = onboarding?.environment || "paper";
  const recordedIsLive = recordedEnvironment === "live";
  // The network the workspace really trades on, from the control plane. "Live" on testnet moves
  // test funds only, so no copy below may say "real money" unless this is mainnet.
  const network = data?.network ?? null;
  const environmentLabel = recordedIsLive
    ? network === "testnet"
      ? "Live execution — Hyperliquid testnet"
      : "Live execution"
    : "Simulated execution";

  const usageRows = useMemo(
    () =>
      (data?.usage || []).filter(
        (row) => row.subscription_id === subscription?.id,
      ),
    [data, subscription?.id],
  );
  const usage = usageRows.reduce(
    (total, row) => total + Number(row.agent_hours || 0),
    0,
  );

  const call = async (
    key: string,
    url: string,
    body?: Record<string, unknown>,
    method = "POST",
    describe?: (result: Row) => string,
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
      if (!response.ok) {
        // The server closed a checkout that can no longer be paid: reload so the plan picker it
        // now allows is on screen beside the explanation.
        if (result.code === "CHECKOUT_RESTART_REQUIRED")
          await load().catch(() => {});
        throw new Error(result.error || "Request failed");
      }
      if (result.stripeUrl || result.url) {
        window.location.assign(result.stripeUrl || result.url);
        return;
      }
      setNotice(
        describe
          ? describe(result)
          : "Saved. Your operations status has been updated.",
      );
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
      window.open(body.url, "_blank", "noopener,noreferrer");
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

  const provisionHeading =
    provisionState === "ready"
      ? "Your workspace is ready"
      : provisionState === "checkout_pending"
        ? "Finish checkout"
        : provisionState === "inactive"
          ? "Workspace status"
          : "Setting up your workspace";

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
            <div style={{ display: "flex", gap: 10 }}>
              {subscription && (
                <Link className="btn btn-primary" href="#wallet">
                  Fund your agent
                </Link>
              )}
              <Link className="btn btn-secondary" href="/account">
                Source purchases
              </Link>
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
              <strong>Hosted checkout is not open yet.</strong>
              <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                You can review the complete service and prepare your account. No
                payment or subscription can be created until every runtime
                launch gate passes.
              </div>
            </div>
          )}
          {checkoutSucceeded && (
            <div
              role="status"
              style={{
                padding: 16,
                border: "1px solid var(--color-accent)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-accent)",
                marginBottom: 16,
              }}
            >
              <strong>
                Payment received — we&apos;re setting up your workspace.
              </strong>
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
              <h2 style={{ fontSize: "1.3rem" }}>Choose your managed plan</h2>
              {lastClosed && (
                <p
                  style={{
                    color: "var(--color-neutral-700)",
                    margin: "0 0 16px",
                  }}
                >
                  {closedSubscriptionHistory(lastClosed, data.plans)} You can
                  subscribe again below.
                </p>
              )}
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
                  // Prefer the live control-plane tenant status over the legacy
                  // public.hosting_instances mirror: the mirror is only resynced by
                  // control.sync_hosting_instance() on certain lifecycle transitions, and a
                  // tenant that is still working through provisioning (never yet reached a
                  // running container) can sit on a stale "queued" here while the detail section
                  // below -- reading the tenant row directly -- correctly shows "provisioning".
                  // Two different words for the same thing on one page is confusing, not honest.
                  ["Runtime", provision?.tenant?.status || instance?.status || "awaiting setup"],
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
                    <h2 style={{ fontSize: "1.3rem", margin: "0 0 6px" }}>
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
                {/* Usage is only mentioned once something has metered it; a permanent "0.0 hours"
                  * reads as a fact about the workspace when it is really an absent meter. */}
                <p
                  style={{ color: "var(--color-neutral-700)", marginBottom: 0 }}
                >
                  Current period ends{" "}
                  {subscription.current_period_end
                    ? new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString()
                    : "after activation"}
                  .
                  {usageRows.length > 0 &&
                    ` Agent usage this period: ${usage.toFixed(1)} hours.`}
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
                  }}
                >
                  <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{provisionHeading}</h2>
                  {/* 'inactive' means the tenant is not currently active/provisioning (suspended,
                    * degraded, maintenance, decommissioning, ...) or there is no tenant at all.
                    * The provision command's status is from the LAST TIME provisioning ran, which
                    * stays "done" forever once a tenant has ever finished setup, so it must never
                    * drive this badge for that state — show the tenant's real status instead. */}
                  {provisionState === "inactive" ? (
                    provision?.tenant && <Status value={provision.tenant.status} />
                  ) : (
                    provision?.command && provisionState !== "wallet_needed" && (
                      <Status
                        value={
                          provision.command.status === "done"
                            ? "active"
                            : provision.command.status
                        }
                      />
                    )
                  )}
                </div>
                {/* Each state says only what is true and what, if anything, the customer can do.
                  * Waiting on the customer's wallet is their next step, never a red failure box,
                  * and nothing here claims an operator action that no code performs. */}
                {provisionState === "checkout_pending" ? (
                  awaitingPaymentConfirmation ? (
                    <p style={{ color: "var(--color-neutral-700)" }}>
                      Confirming your payment with Stripe. This updates
                      automatically.
                    </p>
                  ) : subscription.status === "incomplete" &&
                    subscription.stripe_customer_id ? (
                    <p style={{ color: "var(--color-neutral-700)" }}>
                      Your first payment needs attention. Complete it from
                      Manage billing above; setup starts once it succeeds.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                      <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>
                        {subscription.status === "incomplete"
                          ? "Your payment did not go through, so setup has not started."
                          : "Your checkout is not finished. Setup starts as soon as payment is confirmed."}
                      </p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          className="btn btn-primary"
                          disabled={!!busy}
                          onClick={() =>
                            call("resume-checkout", "/api/hosting/checkout", {
                              planId: subscription.plan_id,
                            })
                          }
                        >
                          {busy === "resume-checkout"
                            ? "Opening checkout..."
                            : subscription.status === "incomplete"
                              ? "Start checkout again"
                              : "Resume checkout"}
                        </button>
                        {subscription.status === "pending_checkout" && (
                          <button
                            className="btn btn-secondary"
                            disabled={!!busy}
                            onClick={() =>
                              call(
                                "cancel-checkout",
                                `/api/hosting/checkout?subscriptionId=${encodeURIComponent(subscription.id)}`,
                                undefined,
                                "DELETE",
                                () => "Checkout canceled. No payment was taken.",
                              )
                            }
                          >
                            Cancel this checkout
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ) : provision === null ? (
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    Checking your workspace status...
                  </p>
                ) : provisionState === "setting_up" ? (
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    Your payment is confirmed and your workspace is being
                    created. This page updates automatically.
                  </p>
                ) : provisionState === "wallet_needed" ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 16,
                      border: "1px solid var(--color-accent)",
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-md)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <strong>
                      Verify your funding wallet below to finish setup.
                    </strong>
                    <span
                      style={{
                        color: "var(--color-neutral-700)",
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      Your workspace is waiting on one step from you: connect
                      the wallet that holds your funds on Hyperliquid and sign a
                      message proving you control it. Signing moves no funds.
                      This page updates on its own once setup continues.
                    </span>
                    <div>
                      <a className="btn btn-primary" href="#wallet">
                        Verify your funding wallet
                      </a>
                    </div>
                  </div>
                ) : provisionState === "ready" && provision.tenant ? (
                  <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                    <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>
                      Workspace <strong>{provision.tenant.slug}</strong> is set
                      up. Every workspace starts with trading paused. To start
                      trading:
                    </p>
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: 20,
                        color: "var(--color-neutral-700)",
                        lineHeight: 1.7,
                      }}
                    >
                      <li>
                        Approve your trading key and fund your Hyperliquid
                        account in <a href="#wallet">your funding wallet</a>{" "}
                        below.
                      </li>
                      <li>
                        Resume trading from your{" "}
                        <Link href="/account/instance">instance page</Link>,
                        where the trading controls live.
                      </li>
                    </ol>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        disabled={!!busy}
                        onClick={openDashboard}
                      >
                        {busy === "dashboard" ? "Opening..." : "Open dashboard"}
                      </button>
                      <Link className="btn btn-secondary" href="/account/instance">
                        Trading controls
                      </Link>
                    </div>
                    <p
                      style={{
                        color: "var(--color-neutral-600)",
                        fontSize: 13,
                        margin: 0,
                      }}
                    >
                      The dashboard opens in a new tab and asks for its own
                      sign-in, which is separate from your Cival Systems
                      account.
                    </p>
                  </div>
                ) : provisionState === "inactive" && provision.tenant ? (
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    Your workspace is{" "}
                    <strong>{provision.tenant.status}</strong>, not active.
                    {["past_due", "paused", "unpaid"].includes(
                      subscription.status,
                    )
                      ? " Resolve your payment with Manage billing above to resume it."
                      : " Contact support to have it brought back."}
                  </p>
                ) : !provision.tenant ? (
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    Setup starts once your subscription is active. If a payment
                    failed, update your card with Manage billing above.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
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
                    {provisionState === "failed" && (() => {
                      // One specific, detectable failure gets its own honest copy instead of the
                      // generic "retried automatically" claim: a wallet that already funds a
                      // DIFFERENT Cival workspace can never succeed by retrying, because
                      // control.tenants.main_wallet_address is unique on purpose -- two hosted
                      // tenants trading the same real Hyperliquid account at once would place
                      // conflicting, uncoordinated orders against it. Detected by the database's
                      // own constraint name so this stays accurate even if the wording around it
                      // changes; the raw error is not shown for this case, since it names a
                      // Postgres constraint, not something a customer needs to read.
                      const walletAlreadyInUse = (provision.command?.error || "").includes(
                        "tenants_main_wallet_unique",
                      );
                      return (
                        <div
                          style={{
                            marginTop: 6,
                            padding: 14,
                            border: "1px solid #8a762d",
                            background: "#1d1909",
                            borderRadius: "var(--radius-md)",
                            color: "#e7d991",
                            fontSize: 13,
                            lineHeight: 1.55,
                          }}
                        >
                          {walletAlreadyInUse ? (
                            <>
                              <strong>That wallet already runs a different Cival workspace.</strong>{" "}
                              One wallet can only power one hosted workspace at a time -- running two
                              would place conflicting orders against the same Hyperliquid account.
                              Verify a different wallet in Deposit &amp; withdraw below to continue,
                              or <Link href="/contact">contact support</Link> if you believe this is a
                              mistake (reference subscription {subscription.id}).
                            </>
                          ) : (
                            <>
                              <strong>Setup hit a problem.</strong> Setup is retried
                              automatically where that is safe, and our team is
                              notified automatically and reviews failed setups. If
                              this has not updated within one business day,{" "}
                              <Link href="/contact">contact support</Link> and
                              reference subscription {subscription.id}.
                              {provision.command?.error && (
                                <div style={{ marginTop: 6, opacity: 0.8 }}>
                                  Technical detail: {provision.command.error}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </section>

              {session?.access_token && (
                <section
                  id="wallet"
                  style={{ marginBottom: 18, scrollMarginTop: 110 }}
                >
                  <HostingWalletPanel
                    accessToken={session.access_token}
                    subscriptionId={subscription.id}
                    onChanged={reload}
                  />
                </section>
              )}

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
                    <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Workspace onboarding</h2>
                    <Status value={onboarding.status} />
                  </div>
                  {/* Distinct states, because one sentence cannot honestly cover them.
                    * A free plan is simulated permanently and by design; a paid plan sells live
                    * agents but still provisions with environment='paper' while the server
                    * hardcodes it in /api/hosting/onboarding; and once that changes the recorded
                    * row reads 'live' and this says so. On top of that, a live workspace on
                    * Hyperliquid TESTNET moves test funds only, so "real money" is said only for a
                    * workspace the control plane reports as mainnet. Each branch is written against
                    * what is recorded, never ahead of it — the copy must never promise more
                    * execution than the server has actually granted. The credential sentence is a
                    * standing invariant and stays true on every branch: a live plan trades through
                    * a trade-only agent wallet the customer approves themselves, which cannot
                    * withdraw, so there is still no secret for Cival to hold. */}
                  <p style={{ color: "var(--color-neutral-700)" }}>
                    {!planRunsLiveAgents
                      ? "Your free plan runs on simulated fills and never reaches a live venue. That is permanent for this tier, not a temporary restriction: a free account that could move real money is an abuse vector that costs the abuser nothing. Upgrade to a paid plan for live execution."
                      : network === "testnet"
                        ? "Your plan runs live agents, and this workspace runs on Hyperliquid testnet — test funds only, no real money."
                        : recordedIsLive && network === "mainnet"
                          ? "Your plan runs live agents against the exchange account you fund yourself. Real orders, real money, and real losses are possible."
                          : recordedIsLive
                            ? "Your plan runs live agents against the Hyperliquid account you fund yourself. Whether this workspace trades on testnet or mainnet is confirmed once it is set up."
                            : "Your plan is a live-execution plan, but this workspace is still recorded as simulated: live order routing has not been switched on yet. Until it is, nothing your agents do here reaches a venue and no order of yours can lose money."}{" "}
                    Cival never accepts exchange credentials, wallet secrets,
                    seed phrases, or private keys on any plan — a live plan
                    trades through a trade-only agent wallet you approve
                    yourself, which cannot withdraw.
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
                    {/* Read-only because the customer does not choose this and never could: the
                      * server sets it. It shows the recorded value so the field can never claim
                      * more than the row behind it. */}
                    <label>
                      Environment
                      <input style={field} value={environmentLabel} readOnly />
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
                        onboardingNotice,
                      )
                    }
                  >
                    Save workspace settings
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
                  <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>Service health</h2>
                  {instance ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {/* Backups, recovery tests and releases have no writer for control-plane
                        * workspaces yet, so a row is shown only once something has recorded it. */}
                      {(
                        [
                          ["Runtime", instance.health_status],
                          instance.backup_status &&
                          instance.backup_status !== "not_configured"
                            ? ["Backups", instance.backup_status]
                            : null,
                          [
                            "Last heartbeat",
                            instance.last_heartbeat_at
                              ? new Date(
                                  instance.last_heartbeat_at,
                                ).toLocaleString()
                              : "not yet",
                          ],
                          instance.last_recovery_test_at
                            ? [
                                "Recovery test",
                                new Date(
                                  instance.last_recovery_test_at,
                                ).toLocaleDateString(),
                              ]
                            : null,
                          instance.release_version
                            ? ["Release", instance.release_version]
                            : null,
                        ].filter(Boolean) as string[][]
                      ).map(([label, value]) => (
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
                  <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>Customer-visible incidents</h2>
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
