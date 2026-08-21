import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  return unavailable();
}

export async function DELETE(_req: NextRequest) {
  return unavailable();
}

function unavailable() {
  return NextResponse.json(
    { ok: false, code: 'PAPER_ONLY', error: 'Managed workspaces do not accept exchange, wallet, or provider secrets.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
