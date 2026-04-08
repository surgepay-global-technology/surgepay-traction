import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Process transactions in batches to extract wallet addresses
    const walletsSet = new Set<string>();
    const walletData: Record<string, { txCount: number; totalVolume: number }> = {};
    const uniqueUserIds = new Set<string>();
    
    let hasMore = true;
    let offset = 0;
    const batchSize = 1000;

    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('wallet_transactions')
        .select('user_id, metadata')
        .eq('status', 'SUCCESS')
        .not('user_id', 'is', null)
        .range(offset, offset + batchSize - 1);

      if (batchError) throw batchError;

      if (batch && batch.length > 0) {
        // Process batch immediately
        batch.forEach((tx: any) => {
          // Add user_id to set
          if (tx.user_id) {
            uniqueUserIds.add(tx.user_id);
          }

          // Try to get wallet address from metadata
          const walletAddress = tx.metadata?.wallet_address || 
                               tx.metadata?.from_address || 
                               tx.metadata?.to_address ||
                               tx.metadata?.address;

          if (walletAddress && walletAddress.startsWith('0x')) {
            const lowerAddress = walletAddress.toLowerCase();
            walletsSet.add(lowerAddress);
            
            if (!walletData[lowerAddress]) {
              walletData[lowerAddress] = { txCount: 0, totalVolume: 0 };
            }
            walletData[lowerAddress].txCount++;
          }
        });

        offset += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json({
      data: {
        total_unique_wallets: walletsSet.size,
        total_unique_users: uniqueUserIds.size,
        wallet_addresses: Array.from(walletsSet),
        wallet_details: walletData,
      },
      fetched_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching all wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}
