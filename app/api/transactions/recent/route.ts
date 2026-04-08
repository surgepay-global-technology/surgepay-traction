import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error:
            'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env',
        },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status') || 'SUCCESS';
    const currency = searchParams.get('currency');

    // Query successful transactions
    let query = supabase
      .from('wallet_transactions')
      .select('id, transaction_type, status, amount_cents, currency, description, reference, transaction_date, metadata', { count: 'exact' })
      .eq('status', status)
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (currency) {
      query = query.eq('currency', currency);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
