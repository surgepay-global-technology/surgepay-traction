import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        data: [],
        error: 'Supabase not configured'
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get('currency');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Query for successful on-chain transactions
    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('status', 'SUCCESS')
      .not('metadata->blockchain_tx_hash', 'is', null)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (currency) {
      query = query.eq('currency', currency);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by currency
    const groupedByCurrency: Record<string, any[]> = {};
    data?.forEach((tx: any) => {
      if (!groupedByCurrency[tx.currency]) {
        groupedByCurrency[tx.currency] = [];
      }
      groupedByCurrency[tx.currency].push(tx);
    });

    // Calculate stats per currency
    const currencyStats = Object.entries(groupedByCurrency).map(([currency, transactions]) => ({
      currency,
      count: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + (tx.amount_cents / 100), 0),
      transactions: transactions.slice(0, 10), // Top 10 per currency
    }));

    return NextResponse.json({
      data: {
        all_transactions: data || [],
        by_currency: currencyStats,
        total_count: data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching on-chain transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch on-chain transactions' },
      { status: 500 }
    );
  }
}
