import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UsersStats {
  total_users: number;
  tier1_verified: number;
  tier2_verified: number;
  tier3_verified: number;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env' },
        { status: 503 }
      );
    }

    let totalUsers = 0;
    let tier1 = 0;
    let tier2 = 0;
    let tier3 = 0;

    let offset = 0;
    const batchSize = 500;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('users')
        .select('id, tier_1_verified, tier_2_verified, tier_3_verified')
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('Users stats error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to fetch users (check table name and columns)' },
          { status: 500 }
        );
      }
      if (!batch?.length) break;

      batch.forEach((row: Record<string, unknown>) => {
        totalUsers += 1;
        const t1 = row.tier_1_verified ?? (row as Record<string, unknown>).tier1_verified;
        const t2 = row.tier_2_verified ?? (row as Record<string, unknown>).tier2_verified;
        const t3 = row.tier_3_verified ?? (row as Record<string, unknown>).tier3_verified;
        if (t1 === true) tier1 += 1;
        if (t2 === true) tier2 += 1;
        if (t3 === true) tier3 += 1;
      });

      offset += batchSize;
      hasMore = batch.length === batchSize;
    }

    const data: UsersStats = {
      total_users: totalUsers,
      tier1_verified: tier1,
      tier2_verified: tier2,
      tier3_verified: tier3,
    };

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user stats';
    console.error('Users stats error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
