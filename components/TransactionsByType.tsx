'use client';

import { useEffect, useState } from 'react';
import type { TransactionStatsByTypeRow } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatCurrency, formatNumber, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function TransactionsByType() {
  const [stats, setStats] = useState<TransactionStatsByTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch<TransactionStatsByTypeRow[]>('/api/transactions/stats-by-type', {
          signal: controller.signal,
        });
        setStats(result.data || []);
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
        <div className="loading h-64 w-full rounded-xl" />
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

  if (stats.length === 0) {
    return <EmptyState variant="empty" />;
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="table-container border-0">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Currency
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Count
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
            {stats.map((stat, index) => (
              <tr
                key={`${stat.transaction_type}-${stat.currency}-${index}`}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                <td className="whitespace-nowrap px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-dark px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {stat.transaction_type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      stat.currency === 'USDC'
                        ? 'bg-secondary/25 text-secondary-dark dark:text-secondary'
                        : 'bg-primary/15 text-primary-dark dark:text-primary'
                    }`}
                  >
                    {stat.currency}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatNumber(stat.successful_tx_count)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-primary-dark dark:text-primary">
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
