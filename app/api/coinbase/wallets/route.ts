import { NextRequest, NextResponse } from 'next/server';
import { coinbaseApiCall } from '@/lib/coinbase';

export async function GET(request: NextRequest) {
  try {
    // Get all accounts/wallets
    const accounts = await coinbaseApiCall('/accounts');

    // Filter for active wallets (with balance or transactions)
    const activeWallets = accounts.data?.filter(
      (account: any) => parseFloat(account.balance?.amount || '0') > 0
    );

    return NextResponse.json({
      data: {
        total: accounts.data?.length || 0,
        active: activeWallets?.length || 0,
        wallets: accounts.data || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching Coinbase wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Coinbase wallets' },
      { status: 500 }
    );
  }
}
