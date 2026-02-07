import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { alchemy } from '@/lib/alchemy';
import { coinbaseApiCall, COINBASE_SERVER_WALLET } from '@/lib/coinbase';

export async function GET(request: NextRequest) {
  try {
    const [
      supabaseStats,
      alchemyWallets,
      coinbaseWallet
    ] = await Promise.allSettled([
      getSupabaseStats(),
      getAlchemyWalletStats(),
      getCoinbaseWalletStats(),
    ]);

    return NextResponse.json({
      data: {
        supabase: supabaseStats.status === 'fulfilled' ? supabaseStats.value : { error: supabaseStats.reason?.message },
        alchemy: alchemyWallets.status === 'fulfilled' ? alchemyWallets.value : { error: alchemyWallets.reason?.message },
        coinbase: coinbaseWallet.status === 'fulfilled' ? coinbaseWallet.value : { error: coinbaseWallet.reason?.message },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

async function getSupabaseStats() {
  // Get transaction stats by currency
  const { data: currencyStats, error: currencyError } = await supabase
    .from('wallet_transactions')
    .select('currency, amount_cents, status')
    .eq('status', 'SUCCESS')
    .in('currency', ['USDC', 'NGN']);

  if (currencyError) throw currencyError;

  // Aggregate by currency
  const stats: Record<string, { count: number; total: number }> = {};
  currencyStats?.forEach((tx: any) => {
    if (!stats[tx.currency]) {
      stats[tx.currency] = { count: 0, total: 0 };
    }
    stats[tx.currency].count++;
    stats[tx.currency].total += tx.amount_cents / 100;
  });

  // Get transaction stats by type
  const { data: typeStats, error: typeError } = await supabase
    .from('wallet_transactions')
    .select('transaction_type, amount_cents, status')
    .eq('status', 'SUCCESS');

  if (typeError) throw typeError;

  const typeAgg: Record<string, { count: number; total: number }> = {};
  typeStats?.forEach((tx: any) => {
    if (!typeAgg[tx.transaction_type]) {
      typeAgg[tx.transaction_type] = { count: 0, total: 0 };
    }
    typeAgg[tx.transaction_type].count++;
    typeAgg[tx.transaction_type].total += tx.amount_cents / 100;
  });

  return {
    byCurrency: stats,
    byType: typeAgg,
    totalTransactions: currencyStats?.length || 0,
  };
}

async function getAlchemyWalletStats() {
  // If you have specific wallet addresses to monitor, add them here
  // For now, return placeholder for Alchemy stats
  return {
    message: 'Use /api/wallets/info?address=0x... to query specific wallets',
    activeWallets: 0,
  };
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
