'use client';

import { useEffect, useState } from 'react';
import type { WalletTransactionRow } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatCurrency, formatDate, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<WalletTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch<WalletTransactionRow[]>('/api/transactions/recent?limit=10', {
          signal: controller.signal,
        });
        setTransactions(result.data || []);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="loading h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant={isBackendUnavailableError(error) ? 'unavailable' : 'error'}
        devDetail={error}
      />
    );
  }

  if (transactions.length === 0) {
    return <EmptyState variant="empty" />;
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="table-container border-0">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(tx.transaction_date)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-dark px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {tx.transaction_type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-primary-dark dark:text-primary">
                  {formatCurrency(tx.amount_cents / 100, tx.currency)}
                </td>
                <td className="max-w-xs truncate px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                  {tx.description || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
