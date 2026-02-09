import { NextRequest, NextResponse } from 'next/server';
import { supabase, TransactionStatsByCurrency, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        data: [],
        error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env'
      });
    }

    // Process transactions in batches WITHOUT storing all in memory
    const stats: Record<string, { count: number; total: number }> = {};
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;
    let totalRowsFetched = 0;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('wallet_transactions')
        .select('currency, amount_cents')
        .eq('status', 'SUCCESS')
        .range(offset, offset + batchSize - 1);

      if (batchError) throw batchError;

      if (batch && batch.length > 0) {
        // Process batch immediately, don't accumulate
        batch.forEach((tx: any) => {
          const currency = String(tx.currency || '').trim().toUpperCase();
          
          if (!stats[currency]) {
            stats[currency] = { count: 0, total: 0 };
          }
          stats[currency].count++;
          stats[currency].total += tx.amount_cents / 100.0;
        });

        totalRowsFetched += batch.length;
        offset += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    const result: TransactionStatsByCurrency[] = Object.entries(stats)
      .map(([currency, data]) => ({
        currency,
        total_transaction_count: data.count,
        total_amount: data.total,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    return NextResponse.json({ 
      data: result,
      total_rows_fetched: totalRowsFetched,
      fetched_at: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error fetching transaction stats by currency:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
