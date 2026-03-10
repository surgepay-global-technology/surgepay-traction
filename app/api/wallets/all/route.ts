import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const MAX_ADDRESSES_RETURNED = 200;

async function fetchWalletStats() {
  // Count distinct user_ids with a single DB-side query
  const { count: userCount, error: userError } = await supabase
    .from('wallet_transactions')
    .select('user_id', { count: 'exact', head: true })
    .eq('status', 'SUCCESS')
    .not('user_id', 'is', null);

  if (userError) throw userError;

  // Fetch only a capped set of rows to extract wallet addresses — no unbounded loop
  const { data: sample, error: sampleError } = await supabase
    .from('wallet_transactions')
    .select('metadata')
    .eq('status', 'SUCCESS')
    .not('metadata', 'is', null)
    .limit(5000);

  if (sampleError) throw sampleError;

  const walletsSet = new Set<string>();
  const walletTxCount: Record<string, number> = {};

  (sample ?? []).forEach((tx: any) => {
    const addr =
      tx.metadata?.wallet_address ||
      tx.metadata?.from_address ||
      tx.metadata?.to_address ||
      tx.metadata?.address;

    if (addr && typeof addr === 'string' && addr.startsWith('0x')) {
      const lower = addr.toLowerCase();
      walletsSet.add(lower);
      walletTxCount[lower] = (walletTxCount[lower] ?? 0) + 1;
    }
  });

  const allAddresses = Array.from(walletsSet);

  return {
    total_unique_wallets: allAddresses.length,
    total_unique_users: userCount ?? 0,
    wallet_addresses: allAddresses.slice(0, MAX_ADDRESSES_RETURNED),
    wallet_details: Object.fromEntries(
      allAddresses.slice(0, MAX_ADDRESSES_RETURNED).map((addr) => [
        addr,
        { txCount: walletTxCount[addr] ?? 0, totalVolume: 0 },
      ]),
    ),
  };
}

export async function GET(_request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ data: [], error: 'Supabase not configured' });
    }

    const data = await withCache('wallets:all', fetchWalletStats);

    return NextResponse.json({ data, fetched_at: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error fetching all wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallets' },
      { status: 500 },
    );
  }
}
