import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, adminUnauthorized } from "@/lib/admin-auth";
import { controlClient } from "@/lib/control-plane";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req, ["owner", "operator", "auditor"])))
    return adminUnauthorized();
  try {
    const cp = controlClient();
    const [telemetry, inventory] = await Promise.all([
      cp.from("host_telemetry").select("host,observed_at,metrics").order("host"),
      cp.from("host_registry").select("host,admissions_enabled,max_tenants,note").order("host"),
    ]);
    if (telemetry.error || inventory.error) throw telemetry.error || inventory.error;
    return NextResponse.json(
      { hosts: telemetry.data || [], inventory: inventory.data || [], asOf: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Server telemetry could not be loaded. Check the host collector and database connection.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
