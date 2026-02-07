'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils';

interface WalletsData {
  total_unique_wallets: number;
  total_unique_users: number;
  wallet_addresses: string[];
  wallet_details: Record<string, { txCount: number; totalVolume: number }>;
}

interface UsersStats {
  total_users: number;
  tier1_verified: number;
  tier2_verified: number;
  tier3_verified: number;
}

export default function AllWalletsOnBase() {
  const [walletsData, setWalletsData] = useState<WalletsData | null>(null);
  const [usersStats, setUsersStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletsRes, usersRes] = await Promise.all([
        fetch('/api/wallets/all'),
        fetch('/api/users/stats'),
      ]);
      const walletsResult = await walletsRes.json();
      const usersResult = await usersRes.json();

      if (!walletsRes.ok) {
        throw new Error(walletsResult.error || 'Failed to fetch wallets');
      }
      setWalletsData(walletsResult.data);

      if (usersRes.ok && usersResult.data) {
        setUsersStats(usersResult.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading h-64 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">⚠️ Unable to Load Wallets</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
      </div>
    );
  }

  if (!walletsData || walletsData.wallet_addresses.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No wallet addresses found in transaction metadata
        </p>
      </div>
    );
  }

  // Sort wallets by transaction count
  const sortedWallets = [...walletsData.wallet_addresses].sort((a, b) => {
    const aCount = walletsData.wallet_details[a]?.txCount || 0;
    const bCount = walletsData.wallet_details[b]?.txCount || 0;
    return bCount - aCount;
  });

  const displayedWallets = showAll ? sortedWallets : sortedWallets.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Cards: Total Users (from users table) + Tier verified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 shadow-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Total Users
            </h3>
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {usersStats ? formatNumber(usersStats.total_users) : '—'}
          </p>
          <p className="text-sm text-white/80">
            From users table
          </p>
        </div>

       </div>

      {/* Top Wallets List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showAll ? `All Wallet Addresses (${walletsData.wallet_addresses.length})` : 'Top 3 Active Wallets'}
          </h3>
          {walletsData.wallet_addresses.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showAll ? 'Show Less' : `Show All ${walletsData.wallet_addresses.length}`}
            </button>
          )}
        </div>
        
        <div className={`space-y-3 ${showAll ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
          {displayedWallets.map((address, index) => {
            const details = walletsData.wallet_details[address] || { txCount: 0, totalVolume: 0 };
            return (
              <div 
                key={address} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 rounded-lg border border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {address}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Wallet
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white">
                    {formatNumber(details.txCount)} txs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
