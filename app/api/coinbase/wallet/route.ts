import { NextRequest, NextResponse } from 'next/server';
import { coinbaseApiCall, COINBASE_SERVER_WALLET } from '@/lib/coinbase';

export async function GET(request: NextRequest) {
  try {
    if (!COINBASE_SERVER_WALLET) {
      return NextResponse.json(
        { error: 'COINBASE_SERVER_WALLET not configured' },
        { status: 400 }
      );
    }

    // Get wallet balance
    const walletData = await coinbaseApiCall(`/accounts/${COINBASE_SERVER_WALLET}`);

    // Get wallet transactions
    const transactions = await coinbaseApiCall(
      `/accounts/${COINBASE_SERVER_WALLET}/transactions?limit=100`
    );

    return NextResponse.json({
      data: {
        wallet: walletData.data,
        transactions: transactions.data,
        transactionCount: transactions.data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Coinbase wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Coinbase wallet' },
      { status: 500 }
    );
  }
}
