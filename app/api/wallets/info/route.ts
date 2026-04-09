import { NextRequest, NextResponse } from 'next/server';
import { getAlchemy, WalletInfo } from '@/lib/alchemy';
import { parseEther } from '@/lib/utils';

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
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get ETH balance
    const ethBalance = await alchemy.core.getBalance(address);

    // Get token balances
    const tokenBalances = await alchemy.core.getTokenBalances(address);

    // Get transaction count
    const transactionCount = await alchemy.core.getTransactionCount(address);

    // Get token metadata for non-zero balances
    const enrichedTokenBalances = await Promise.all(
      tokenBalances.tokenBalances
        .filter((token) => token.tokenBalance !== '0x0' && token.tokenBalance !== '0')
        .slice(0, 20) // Limit to top 20 tokens
        .map(async (token) => {
          try {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            return {
              contractAddress: token.contractAddress,
              tokenBalance: token.tokenBalance || '0',
              symbol: metadata.symbol || 'UNKNOWN',
              name: metadata.name || 'Unknown Token',
              decimals: metadata.decimals || 18,
            };
          } catch (error) {
            return {
              contractAddress: token.contractAddress,
              tokenBalance: token.tokenBalance || '0',
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              decimals: 18,
            };
          }
        })
    );

    const walletInfo: WalletInfo = {
      address,
      ethBalance: parseEther(ethBalance.toString()),
      tokenBalances: enrichedTokenBalances,
      transactionCount,
    };

    return NextResponse.json({ data: walletInfo });
  } catch (error: any) {
    console.error('Error fetching wallet info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet info' },
      { status: 500 }
    );
  }
}
