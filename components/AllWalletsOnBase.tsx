'use client';

import { useEffect, useState } from 'react';
import { shortenAddress, formatNumber } from '@/lib/utils';

interface WalletsData {
  total_unique_wallets: number;
  total_unique_users: number;
  wallet_addresses: string[];
  wallet_details: Record<string, { txCount: number; totalVolume: number }>;
}

export default function AllWalletsOnBase() {
  const [walletsData, setWalletsData] = useState<WalletsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallets/all');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch wallets');
      }

      setWalletsData(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 shadow-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Total Wallets
            </h3>
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {formatNumber(walletsData.total_unique_wallets)}
          </p>
          <p className="text-sm text-white/80">
            On Base Network
          </p>
        </div>

        <div className="bg-gradient-to-br from-secondary to-secondary-dark rounded-xl p-6 shadow-lg border border-secondary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Unique Users
            </h3>
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {formatNumber(walletsData.total_unique_users)}
          </p>
          <p className="text-sm text-white/80">
            Active accounts
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary/90 to-primary-dark/90 rounded-xl p-6 shadow-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Network
            </h3>
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            Base
          </p>
          <p className="text-sm text-white/80">
            Mainnet
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
                      Base Mainnet
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
