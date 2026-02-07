'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatsByType {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}

export default function TransactionsByType() {
  const [stats, setStats] = useState<StatsByType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/stats-by-type');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      setStats(result.data || []);
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
        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">⚠️ Supabase Not Configured</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Add your Supabase credentials to .env to view transaction breakdowns.
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {stats.map((stat, index) => (
              <tr key={index} className="hover:bg-primary/5 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm">
                      {stat.transaction_type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${stat.currency === 'USDC' ? 'bg-secondary/20 text-secondary-dark' : 'bg-primary/20 text-primary-dark'}`}>
                    {stat.currency}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatNumber(stat.successful_tx_count)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-dark dark:text-primary">
                  {formatCurrency(stat.total_amount, stat.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
