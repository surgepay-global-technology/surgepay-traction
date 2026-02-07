'use client';

import { useEffect, useState, useCallback } from 'react';
import TransactionStats from '@/components/TransactionStats';
import TransactionsByType from '@/components/TransactionsByType';
import TransactionsPieChart from '@/components/TransactionsPieChart';
import CurrencyPieChart from '@/components/CurrencyPieChart';
import RecentTransactions from '@/components/RecentTransactions';
import AllWalletsOnBase from '@/components/AllWalletsOnBase';
import Header from '@/components/Header';

const AUTO_REFRESH_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setLastRefresh(new Date());
  }, []);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    setLastRefresh(new Date());
  }, []);

  // Auto-refresh every 3 hours
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data (3 hour interval)');
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary/5 to-secondary/5 dark:bg-gray-900">
      <Header onRefresh={handleRefresh} />
      
      {/* Last refresh timestamp - client-side only to avoid hydration errors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {mounted && lastRefresh ? (
            <>
              Last updated: {lastRefresh.toLocaleString()} • Auto-refresh: Every 3 hours
            </>
          ) : (
            <>Loading...</>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Statistics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction Overview
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Successful USDC and NGN transactions from Supabase
          </p>
          <TransactionStats key={`stats-${refreshKey}`} />
        </section>

        {/* Charts Row */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Visual Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Interactive charts for transaction insights
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrencyPieChart key={`currency-chart-${refreshKey}`} />
            <TransactionsPieChart key={`type-chart-${refreshKey}`} />
          </div>
        </section>

        {/* All Wallets on Base */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Wallets on Base Network
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            All unique wallet addresses with transaction activity
          </p>
          <AllWalletsOnBase key={`all-wallets-${refreshKey}`} />
        </section>

        {/* Transaction by Type Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Detailed Breakdown
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Complete transaction breakdown by type and currency
          </p>
          <TransactionsByType key={`type-${refreshKey}`} />
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Recent Transactions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Latest successful transactions from Supabase
          </p>
          <RecentTransactions key={`recent-${refreshKey}`} />
        </section>
      </main>
    </div>
  );
}
