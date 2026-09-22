import { beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
const state = vi.hoisted(() => ({
  allowed: false,
  error: null as unknown,
  read: vi.fn(),
  auth: vi.fn(),
}));
vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: async (...args: unknown[]) => {
    state.auth(...args);
    return state.allowed ? { role: "owner" } : null;
  },
  adminUnauthorized: () =>
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
}));
vi.mock("@/lib/control-plane", () => ({
  controlClient: () => ({
    from: () => {
      state.read();
      return {
        select: () => ({
          order: async () => ({
            data: [
              {
                host: "cloud-01",
                observed_at: "2026-09-19T00:00:00Z",
                metrics: { diskUsedPercent: 25 },
              },
            ],
            error: state.error,
          }),
        }),
      };
    },
  }),
}));
import { GET } from "./route";
describe("server telemetry authorization", () => {
  beforeEach(() => {
    state.allowed = false;
    state.error = null;
    vi.clearAllMocks();
  });
  it("does not query infrastructure without an authorized admin", async () => {
    expect(
      (await GET(new NextRequest("https://example.com/api/admin/servers")))
        .status,
    ).toBe(401);
    expect(state.read).not.toHaveBeenCalled();
  });
  it("uses role restriction and disables caching for host telemetry", async () => {
    state.allowed = true;
    const r = await GET(
      new NextRequest("https://example.com/api/admin/servers"),
    );
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(state.auth.mock.calls[0][1]).toEqual([
      "owner",
      "operator",
      "auditor",
    ]);
  });
  it("reports database failure rather than empty healthy fleet", async () => {
    state.allowed = true;
    state.error = { message: "db unavailable" };
    expect(
      (await GET(new NextRequest("https://example.com/api/admin/servers")))
        .status,
    ).toBe(503);
  });
});
