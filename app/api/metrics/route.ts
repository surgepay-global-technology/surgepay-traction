import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { coinbaseApiCall, COINBASE_SERVER_WALLET } from '@/lib/coinbase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

async function getSupabaseStats() {
  // Reuse the same cached data that stats-by-currency and stats-by-type already computed
  const { count, error } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'SUCCESS');

  if (error) throw error;
  return { totalTransactions: count ?? 0 };
}

async function getCoinbaseWalletStats() {
  if (!COINBASE_SERVER_WALLET) {
    return { error: 'COINBASE_SERVER_WALLET not configured' };
  }
  try {
    const walletData = await coinbaseApiCall(`/accounts/${COINBASE_SERVER_WALLET}`);
    return {
      balance: walletData.data?.balance,
      currency: walletData.data?.currency,
      name: walletData.data?.name,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

async function fetchMetrics() {
  const [supabaseStats, coinbaseWallet] = await Promise.allSettled([
    getSupabaseStats(),
    getCoinbaseWalletStats(),
  ]);

  return {
    supabase: supabaseStats.status === 'fulfilled' ? supabaseStats.value : { error: (supabaseStats as PromiseRejectedResult).reason?.message },
    alchemy: { message: 'Use /api/wallets/info?address=0x... to query specific wallets', activeWallets: 0 },
    coinbase: coinbaseWallet.status === 'fulfilled' ? coinbaseWallet.value : { error: (coinbaseWallet as PromiseRejectedResult).reason?.message },
    timestamp: new Date().toISOString(),
  };
}

export async function GET(_request: NextRequest) {
  try {
    const data = await withCache('metrics', fetchMetrics);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 },
    );
  }
}
