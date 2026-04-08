import { NextRequest, NextResponse } from 'next/server';
import { getAlchemy } from '@/lib/alchemy';

export async function GET(request: NextRequest) {
  try {
    const alchemy = getAlchemy();
    if (!alchemy) {
      return NextResponse.json(
        { error: 'Alchemy not configured. Set ALCHEMY_TOKEN in .env' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const addresses = searchParams.get('addresses')?.split(',') || [];

    if (addresses.length === 0) {
      return NextResponse.json(
        { error: 'At least one wallet address is required' },
        { status: 400 }
      );
    }

    const walletBalances = await Promise.all(
      addresses.map(async (address) => {
        try {
          const balance = await alchemy.core.getBalance(address.trim());
          const transactionCount = await alchemy.core.getTransactionCount(address.trim());
          
          return {
            address: address.trim(),
            balance: (parseFloat(balance.toString()) / 1e18).toFixed(4),
            transactionCount,
            isActive: transactionCount > 0,
          };
        } catch (error) {
          return {
            address: address.trim(),
            balance: '0',
            transactionCount: 0,
            isActive: false,
            error: 'Failed to fetch balance',
          };
        }
      })
    );

    const activeWallets = walletBalances.filter((w) => w.isActive);

    return NextResponse.json({
      data: {
        total: walletBalances.length,
        active: activeWallets.length,
        wallets: walletBalances,
      },
    });
  } catch (error: any) {
    console.error('Error fetching active wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active wallets' },
      { status: 500 }
    );
  }
}
