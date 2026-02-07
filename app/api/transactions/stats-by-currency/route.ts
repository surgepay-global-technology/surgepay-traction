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

    // Fetch ALL transactions in batches to avoid any limits
    let allTransactions: any[] = [];
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('wallet_transactions')
        .select('currency, amount_cents')
        .eq('status', 'SUCCESS')
        .in('currency', ['USDC', 'NGN'])
        .range(offset, offset + batchSize - 1);

      if (batchError) throw batchError;

      if (batch && batch.length > 0) {
        allTransactions = [...allTransactions, ...batch];
        offset += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // Aggregate ALL transactions
    const stats: Record<string, { count: number; total: number }> = {};
    
    allTransactions.forEach((tx: any) => {
      if (!stats[tx.currency]) {
        stats[tx.currency] = { count: 0, total: 0 };
      }
      stats[tx.currency].count++;
      stats[tx.currency].total += tx.amount_cents / 100.0;
    });

    const result: TransactionStatsByCurrency[] = Object.entries(stats)
      .map(([currency, data]) => ({
        currency,
        total_transaction_count: data.count,
        total_amount: data.total,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    return NextResponse.json({ 
      data: result,
      total_rows_fetched: allTransactions.length,
      fetched_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching transaction stats by currency:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}
