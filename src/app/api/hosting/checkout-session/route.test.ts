import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const state = vi.hoisted(() => ({
  row: null as null | Record<string, unknown>,
  filters: [] as unknown[][],
  update: vi.fn(),
  retrieve: vi.fn(),
  expire: vi.fn(),
}));
vi.mock("@/lib/commerce", async (original) => ({
  ...(await original<typeof import("@/lib/commerce")>()),
  requireVerifiedUser: async () => ({ id: "owner" }),
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { retrieve: state.retrieve, expire: state.expire } },
  }),
}));
vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {};
      q.select = () => q;
      q.eq = (...args: unknown[]) => {
        state.filters.push(args);
        return q;
      };
      q.update = (...args: unknown[]) => {
        state.update(...args);
        return q;
      };
      q.maybeSingle = async () => ({ data: state.row, error: null });
      q.then = (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ error: null }).then(resolve);
      return q;
    },
  }),
}));
import { POST } from "./route";
const id = "20000000-0000-4000-8000-000000000001";
const request = (action: string) =>
  POST(
    new NextRequest(
      "https://www.civalsystems.com/api/hosting/checkout-session",
      { method: "POST", body: JSON.stringify({ subscriptionId: id, action }) },
    ),
  );
describe("unfinished checkout recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.filters = [];
    state.row = {
      id,
      status: "pending_checkout",
      stripe_checkout_session_id: "cs_test",
    };
    state.retrieve.mockResolvedValue({
      id: "cs_test",
      status: "open",
      url: "https://checkout.stripe.com/test",
    });
    state.expire.mockResolvedValue({ id: "cs_test", status: "expired" });
  });
  it("resumes only an owner-scoped pending checkout", async () => {
    const res = await request("resume");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "https://checkout.stripe.com/test",
    });
    expect(state.filters).toContainEqual(["user_id", "owner"]);
    expect(state.expire).not.toHaveBeenCalled();
  });
  it("does not retrieve a checkout for another user", async () => {
    state.row = null;
    expect((await request("resume")).status).toBe(409);
    expect(state.retrieve).not.toHaveBeenCalled();
  });
  it("expires an open checkout before releasing the pending subscription", async () => {
    expect((await request("cancel")).status).toBe(200);
    expect(state.expire).toHaveBeenCalledWith("cs_test");
    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "incomplete_expired" }),
    );
    expect(state.filters).toContainEqual(["status", "pending_checkout"]);
  });
  it("never expires a completed checkout awaiting webhook activation", async () => {
    state.retrieve.mockResolvedValue({ id: "cs_test", status: "complete" });
    expect((await request("cancel")).status).toBe(409);
    expect(state.expire).not.toHaveBeenCalled();
    expect(state.update).not.toHaveBeenCalled();
  });
  it("releases a previously expired session so a new checkout can start", async () => {
    state.retrieve.mockResolvedValue({ id: "cs_test", status: "expired" });
    expect((await request("resume")).status).toBe(200);
    expect(state.expire).not.toHaveBeenCalled();
    expect(state.update).toHaveBeenCalled();
  });
});
