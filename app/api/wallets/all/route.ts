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

    // Get all unique user_ids with successful transactions
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('user_id, metadata')
      .eq('status', 'SUCCESS')
      .not('user_id', 'is', null);

    if (error) throw error;

    // Extract unique wallet addresses from metadata
    const walletsSet = new Set<string>();
    const walletData: Record<string, { txCount: number; totalVolume: number }> = {};

    transactions?.forEach((tx: any) => {
      // Try to get wallet address from metadata
      const walletAddress = tx.metadata?.wallet_address || 
                           tx.metadata?.from_address || 
                           tx.metadata?.to_address ||
                           tx.metadata?.address;

      if (walletAddress && walletAddress.startsWith('0x')) {
        walletsSet.add(walletAddress.toLowerCase());
        
        if (!walletData[walletAddress.toLowerCase()]) {
          walletData[walletAddress.toLowerCase()] = { txCount: 0, totalVolume: 0 };
        }
        walletData[walletAddress.toLowerCase()].txCount++;
      }
    });

    // Get unique user_ids as well
    const { data: users, error: usersError } = await supabase
      .from('wallet_transactions')
      .select('user_id')
      .eq('status', 'SUCCESS')
      .not('user_id', 'is', null);

    if (usersError) throw usersError;

    const uniqueUserIds = new Set(users?.map((u: any) => u.user_id));

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
