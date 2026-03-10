import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface CurrencyTotal {
  currency: string;
  tx_count: number;
  total: string;
}

export interface TransactionOverview {
  successful_transaction_count: number;
  currencies: CurrencyTotal[];
}

async function fetchOverview(): Promise<TransactionOverview[]> {
  // Single DB-side count — no row scanning in Node
  const { count: totalCount, error: countError } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'SUCCESS');

  if (countError) throw countError;

  // Aggregate by currency server-side: fetch only the columns we need grouped
  // PostgREST doesn't support GROUP BY directly, so we fetch minimal columns
  // and aggregate in JS — but cap at 10k rows to bound memory usage.
  const { data: rows, error: rowsError } = await supabase
    .from('wallet_transactions')
    .select('currency, amount_cents')
    .eq('status', 'SUCCESS')
    .limit(10_000);

  if (rowsError) throw rowsError;

  const currencyTotals: Record<string, { count: number; total: number }> = {};

  (rows ?? []).forEach((row: { currency: string; amount_cents: number }) => {
    const currency = String(row.currency || '').trim().toUpperCase();
    const amount = Number(row.amount_cents) / 100.0;
    if (!currencyTotals[currency]) currencyTotals[currency] = { count: 0, total: 0 };
    currencyTotals[currency].count += 1;
    currencyTotals[currency].total += amount;
  });

  const currencies: CurrencyTotal[] = Object.entries(currencyTotals)
    .map(([currency, d]) => ({ currency, tx_count: d.count, total: d.total.toFixed(2) }))
    .sort((a, b) => b.tx_count - a.tx_count);

  return [{ successful_transaction_count: totalCount ?? 0, currencies }];
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env' },
        { status: 503 },
      );
    }

    const data = await withCache('transactions:overview', fetchOverview);

    return NextResponse.json({ data }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transaction overview';
    console.error('Transaction overview error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
