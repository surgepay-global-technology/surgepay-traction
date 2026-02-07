import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TransactionOverview {
  successful_transaction_count: number;
  usdc_tx_count: number;
  usdc_total: string;
  ngn_tx_count: number;
  ngn_total: string;
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
    let usdcCount = 0;
    let usdcTotal = 0;
    let ngnCount = 0;
    let ngnTotal = 0;

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
        const currency = String(row.currency || '').toUpperCase();
        const amount = Number(row.amount_cents) / 100.0;

        if (currency === 'USDC') {
          usdcCount += 1;
          usdcTotal += amount;
        } else if (currency === 'NGN') {
          ngnCount += 1;
          ngnTotal += amount;
        }
      });

      offset += batchSize;
      hasMore = batch.length === batchSize;
    }

    const data: TransactionOverview[] = [
      {
        successful_transaction_count: totalCount,
        usdc_tx_count: usdcCount,
        usdc_total: usdcTotal.toFixed(2),
        ngn_tx_count: ngnCount,
        ngn_total: ngnTotal.toFixed(2),
      },
    ];

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transaction overview';
    console.error('Transaction overview error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
