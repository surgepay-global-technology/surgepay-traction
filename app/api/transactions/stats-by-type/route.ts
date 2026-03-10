import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface TransactionStatsByTypeCurrency {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}

async function fetchStatsByType(): Promise<TransactionStatsByTypeCurrency[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('transaction_type, currency, amount_cents')
    .eq('status', 'SUCCESS')
    .limit(10_000);

  if (error) throw error;

  const stats: Record<string, Record<string, { count: number; total: number }>> = {};

  (data ?? []).forEach((tx: { transaction_type: string; currency: string; amount_cents: number }) => {
    const type = tx.transaction_type || 'Unknown';
    const currency = tx.currency || 'Unknown';
    if (!stats[type]) stats[type] = {};
    if (!stats[type][currency]) stats[type][currency] = { count: 0, total: 0 };
    stats[type][currency].count++;
    stats[type][currency].total += tx.amount_cents / 100.0;
  });

  const result: TransactionStatsByTypeCurrency[] = [];
  Object.entries(stats).forEach(([transaction_type, currencies]) => {
    Object.entries(currencies).forEach(([currency, d]) => {
      result.push({ transaction_type, currency, successful_tx_count: d.count, total_amount: d.total });
    });
  });

  return result.sort((a, b) => {
    if (a.transaction_type !== b.transaction_type) return a.transaction_type.localeCompare(b.transaction_type);
    return a.currency.localeCompare(b.currency);
  });
}

export async function GET(_request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ data: [], error: 'Supabase not configured' });
    }

    const data = await withCache('transactions:stats-by-type', fetchStatsByType);

    return NextResponse.json(
      { data, fetched_at: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: any) {
    console.error('Error fetching transaction stats by type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction stats' },
      { status: 500 },
    );
  }
}
