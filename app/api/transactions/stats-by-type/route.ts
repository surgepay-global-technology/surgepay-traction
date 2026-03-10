import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TransactionStatsByTypeCurrency {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        data: [],
        error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env'
      });
    }

    // Process transactions in batches WITHOUT storing all in memory
    const stats: Record<string, Record<string, { count: number; total: number }>> = {};
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;
    let totalRowsFetched = 0;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('wallet_transactions')
        .select('transaction_type, amount_cents, currency')
        .eq('status', 'SUCCESS')
        .range(offset, offset + batchSize - 1);

      if (batchError) throw batchError;

      if (batch && batch.length > 0) {
        // Process batch immediately, don't accumulate
        batch.forEach((tx: any) => {
          const type = tx.transaction_type || 'Unknown';
          const currency = tx.currency || 'Unknown';
          
          if (!stats[type]) {
            stats[type] = {};
          }
          if (!stats[type][currency]) {
            stats[type][currency] = { count: 0, total: 0 };
          }
          stats[type][currency].count++;
          stats[type][currency].total += tx.amount_cents / 100.0;
        });

        totalRowsFetched += batch.length;
        offset += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // Flatten into array with separate entries for each type+currency combination
    const result: TransactionStatsByTypeCurrency[] = [];
    
    Object.entries(stats).forEach(([transaction_type, currencies]) => {
      Object.entries(currencies).forEach(([currency, data]) => {
        result.push({
          transaction_type,
          currency,
          successful_tx_count: data.count,
          total_amount: data.total,
        });
      });
    });

    // Sort by transaction type, then currency
    result.sort((a, b) => {
      if (a.transaction_type !== b.transaction_type) {
        return a.transaction_type.localeCompare(b.transaction_type);
      }
      return a.currency.localeCompare(b.currency);
    });

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
    console.error('Error fetching transaction stats by type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
