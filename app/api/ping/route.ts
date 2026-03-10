import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Lightweight ping endpoint for keep-awake / uptime checks.
 * Use this URL in cron or uptime services (every 10–14 min) to reduce Render free-tier spin-downs.
 * Returns 200 with minimal payload so the instance stays warm.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    { status: 200 }
  );
}
