import { NextRequest, NextResponse } from 'next/server';
import { supabase, TransactionStatsByCurrency, isSupabaseConfigured } from '@/lib/supabase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchStatsByCurrency(): Promise<TransactionStatsByCurrency[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('currency, amount_cents')
    .eq('status', 'SUCCESS')
    .limit(10_000);

  if (error) throw error;

  const stats: Record<string, { count: number; total: number }> = {};

  (data ?? []).forEach((tx: { currency: string; amount_cents: number }) => {
    const currency = String(tx.currency || '').trim().toUpperCase();
    if (!stats[currency]) stats[currency] = { count: 0, total: 0 };
    stats[currency].count++;
    stats[currency].total += tx.amount_cents / 100.0;
  });

  return Object.entries(stats)
    .map(([currency, d]) => ({
      currency,
      total_transaction_count: d.count,
      total_amount: d.total,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export async function GET(_request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ data: [], error: 'Supabase not configured' });
    }

    const data = await withCache('transactions:stats-by-currency', fetchStatsByCurrency);

    return NextResponse.json(
      { data, fetched_at: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: any) {
    console.error('Error fetching transaction stats by currency:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction stats' },
      { status: 500 },
    );
  }
}
