import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPass = process.env.GWDS_ADMIN_PASSWORD || 'gwds-admin-2026';
  
  if (password === adminPass) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
}
