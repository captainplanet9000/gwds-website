import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const state = vi.hoisted(() => ({
  event: {} as Record<string, unknown>,
  retrieve: vi.fn(),
  upsert: vi.fn(),
  deliver: vi.fn(),
  rowError: null as null | { message: string },
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: () => state.event },
    subscriptions: { retrieve: state.retrieve },
  }),
}));
vi.mock("@/lib/hosting-notifications", () => ({
  deliverHostingNotification: state.deliver,
}));
vi.mock("@/lib/commerce", async (original) => ({
  ...(await original<typeof import("@/lib/commerce")>()),
  isLiveStripeKey: () => false,
}));
vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {};
      q.select = () => q;
      q.eq = () => q;
      q.single = async () => ({
        data: { customer_email: "fixture@example.com", plan_id: "solo" },
        error: state.rowError,
      });
      q.upsert = state.upsert;
      return q;
    },
  }),
}));
import { POST } from "./route";
const id = "20000000-0000-4000-8000-000000000001";
const request = () =>
  POST(
    new NextRequest("https://www.civalsystems.com/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "fixture" },
      body: "fixture",
    }),
  );
describe("hosting trial reminder webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.rowError = null;
    process.env.STRIPE_WEBHOOK_SECRET = "fixture";
    state.event = {
      id: "evt_fixture",
      type: "customer.subscription.trial_will_end",
      livemode: false,
      data: {
        object: { id: "sub_fixture", metadata: { commerce_kind: "hosting" } },
      },
    };
    state.retrieve.mockResolvedValue({
      id: "sub_fixture",
      status: "trialing",
      trial_end: 1800000000,
      cancel_at_period_end: false,
      metadata: { hosting_subscription_id: id },
      items: {
        data: [
          {
            price: {
              unit_amount: 2900,
              currency: "usd",
              recurring: { interval: "month" },
            },
          },
        ],
      },
    });
    state.upsert.mockResolvedValue({ error: null });
    state.deliver.mockResolvedValue(undefined);
  });
  it("queues a deduplicated reminder with the actual renewal price", async () => {
    expect((await request()).status).toBe(200);
    expect(state.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        dedup_key: "trial-ending-sub_fixture-1800000000",
        payload: expect.objectContaining({
          detail: expect.stringContaining("$29.00"),
        }),
      }),
      { onConflict: "dedup_key", ignoreDuplicates: true },
    );
    expect(state.deliver).toHaveBeenCalledWith(
      id,
      "trial-ending-sub_fixture-1800000000",
    );
  });
  it("checks fresh Stripe state and suppresses a canceled trial reminder", async () => {
    state.retrieve.mockResolvedValue({
      status: "trialing",
      cancel_at_period_end: true,
      trial_end: 1800000000,
    });
    expect((await request()).status).toBe(200);
    expect(state.upsert).not.toHaveBeenCalled();
  });
  it("suppresses a delayed event after the trial has ended", async () => {
    state.retrieve.mockResolvedValue({
      status: "active",
      cancel_at_period_end: false,
      trial_end: 1800000000,
    });
    expect((await request()).status).toBe(200);
    expect(state.upsert).not.toHaveBeenCalled();
  });
  it("ignores subscriptions unrelated to managed hosting", async () => {
    state.event = {
      ...state.event,
      data: { object: { metadata: { commerce_kind: "qa_trial" } } },
    };
    expect((await request()).status).toBe(200);
    expect(state.retrieve).not.toHaveBeenCalled();
  });
});
