import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export interface UsersStats {
  total_users: number;
  tier1_verified: number;
  tier2_verified: number;
  tier3_verified: number;
}

async function fetchUsersStats(): Promise<UsersStats> {
  // Push all four counts to Postgres — one round-trip each, zero rows in Node memory
  const [total, tier1, tier2, tier3] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier_1_verified', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier_2_verified', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier_3_verified', true),
  ]);

  if (total.error) throw total.error;
  if (tier1.error) throw tier1.error;
  if (tier2.error) throw tier2.error;
  if (tier3.error) throw tier3.error;

  return {
    total_users: total.count ?? 0,
    tier1_verified: tier1.count ?? 0,
    tier2_verified: tier2.count ?? 0,
    tier3_verified: tier3.count ?? 0,
  };
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env' },
        { status: 503 },
      );
    }

    const data = await withCache('users:stats', fetchUsersStats);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user stats';
    console.error('Users stats error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
