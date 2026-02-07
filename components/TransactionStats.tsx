'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface TransactionOverviewItem {
  successful_transaction_count: number;
  usdc_tx_count: number;
  usdc_total: string;
  ngn_tx_count: number;
  ngn_total: string;
}

export default function TransactionStats() {
  const [overview, setOverview] = useState<TransactionOverviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/overview');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch overview');
      }

      const data = result.data?.[0] ?? null;
      setOverview(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="loading h-6 w-24 mb-2"></div>
            <div className="loading h-8 w-32 mb-1"></div>
            <div className="loading h-4 w-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">⚠️ Supabase Not Configured</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Add your Supabase credentials to .env to view transaction statistics.
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">{error}</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="card">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transaction data</p>
      </div>
    );
  }

  const usdcTotalNum = parseFloat(overview.usdc_total);
  const ngnTotalNum = parseFloat(overview.ngn_total);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 shadow-lg border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
            Successful Transactions
          </h3>
          <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-4xl font-bold text-white mb-2">
          {formatNumber(overview.successful_transaction_count)}
        </p>
        <p className="text-sm text-white/80">All successful (USDC + NGN)</p>
      </div>

      <div className="bg-gradient-to-br from-secondary to-secondary-dark rounded-xl p-6 shadow-lg border border-secondary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">USDC</h3>
          <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-4xl font-bold text-white mb-2">{formatCurrency(usdcTotalNum, 'USDC')}</p>
        <p className="text-sm text-white/80">{formatNumber(overview.usdc_tx_count)} transactions</p>
      </div>

      <div className="bg-gradient-to-br from-primary/90 to-primary-dark/90 rounded-xl p-6 shadow-lg border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">NGN</h3>
          <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-4xl font-bold text-white mb-2">{formatCurrency(ngnTotalNum, 'NGN')}</p>
        <p className="text-sm text-white/80">{formatNumber(overview.ngn_tx_count)} transactions</p>
      </div>
    </div>
  );
}
