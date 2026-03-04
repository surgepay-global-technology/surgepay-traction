'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate, safeFetch } from '@/lib/utils';

interface Transaction {
  id: string;
  transaction_type: string;
  status: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  metadata?: any;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch('/api/transactions/recent?limit=10', {
          signal: controller.signal,
        });
        setTransactions(result.data || []);
        setError(null);
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="loading h-96 w-full"></div>
      </div>
    );
  }

  if (error) {
    const isSupabaseError = error.toLowerCase().includes('supabase') || error.includes('503');
    return (
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          {isSupabaseError ? '⚠️ Supabase Not Configured' : '⚠️ Failed to Load Data'}
        </p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          {isSupabaseError
            ? 'Add your Supabase credentials to .env to view recent transactions.'
            : 'There was a problem fetching recent transactions. Please try again.'}
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No transactions found
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
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(tx.transaction_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm">
                    {tx.transaction_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-dark dark:text-primary">
                  {formatCurrency(tx.amount_cents / 100, tx.currency)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {tx.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
