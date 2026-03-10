import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CurrencyTotal {
  currency: string;
  tx_count: number;
  total: string;
}

export interface TransactionOverview {
  successful_transaction_count: number;
  currencies: CurrencyTotal[];
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env' },
        { status: 503 }
      );
    }

    let totalCount = 0;
    const currencyTotals: Record<string, { count: number; total: number }> = {};

    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('wallet_transactions')
        .select('status, currency, amount_cents')
        .range(offset, offset + batchSize - 1);

      if (error) throw error;
      if (!batch?.length) break;

      batch.forEach((row: { status: string; currency: string; amount_cents: number }) => {
        const status = String(row.status ?? '').trim().toUpperCase();
        if (status !== 'SUCCESS') return;

        totalCount += 1;
        const currency = String(row.currency || '').trim().toUpperCase();
        const amount = Number(row.amount_cents) / 100.0;

        if (!currencyTotals[currency]) {
          currencyTotals[currency] = { count: 0, total: 0 };
        }
        currencyTotals[currency].count += 1;
        currencyTotals[currency].total += amount;
      });

      offset += batchSize;
      hasMore = batch.length === batchSize;
    }

    // Convert to array and sort by transaction count (descending)
    const currencies: CurrencyTotal[] = Object.entries(currencyTotals)
      .map(([currency, data]) => ({
        currency,
        tx_count: data.count,
        total: data.total.toFixed(2),
      }))
      .sort((a, b) => b.tx_count - a.tx_count);

    const data: TransactionOverview[] = [
      {
        successful_transaction_count: totalCount,
        currencies,
      },
    ];

    return NextResponse.json({ data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transaction overview';
    console.error('Transaction overview error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
