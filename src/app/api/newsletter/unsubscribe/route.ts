import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validNewsletterToken } from '@/lib/newsletter';

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!email || !token || !validNewsletterToken(email, token)) {
    return new NextResponse('Invalid unsubscribe link.', { status: 400, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });
  }

  await createServerClient().from('newsletter_subscribers').update({
    is_active: false,
    unsubscribed_at: new Date().toISOString(),
  }).eq('email', email);

  return new NextResponse('<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5ead8;color:#29251f;display:grid;place-items:center;min-height:100vh"><main><h1>Unsubscribed</h1><p>You will no longer receive Cival Systems marketing email.</p><a href="/">Return to Cival Systems</a></main></body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
