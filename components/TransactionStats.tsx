'use client';

import { useEffect, useState } from 'react';
import type { TransactionOverviewRow } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatCurrency, formatNumber, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function TransactionStats() {
  const [overview, setOverview] = useState<TransactionOverviewRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch<TransactionOverviewRow[]>(
          `/api/transactions/overview?t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal: controller.signal,
          }
        );
        const data = result.data?.[0] ?? null;
        setOverview(data);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="loading mb-2 h-5 w-24" />
            <div className="loading mb-1 h-10 w-36" />
            <div className="loading h-4 w-40" />
          </div>
        ))}
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

  if (!overview) {
    return <EmptyState variant="empty" />;
  }

  const currencies = overview.currencies || [];

  const getGradientColors = (index: number) => {
    const colorSchemes = [
      { from: 'from-primary', to: 'to-primary-dark', border: 'border-primary/20' },
      { from: 'from-secondary', to: 'to-secondary-dark', border: 'border-secondary/25' },
      { from: 'from-violet-500', to: 'to-violet-700', border: 'border-violet-500/20' },
      { from: 'from-teal-500', to: 'to-teal-700', border: 'border-teal-500/20' },
      { from: 'from-orange-500', to: 'to-orange-700', border: 'border-orange-500/20' },
      { from: 'from-pink-500', to: 'to-pink-700', border: 'border-pink-500/20' },
    ];
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary to-primary-dark p-6 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">
            Total transactions
          </h3>
          <span className="rounded-lg bg-white/10 p-2 text-white/90">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {formatNumber(overview.successful_transaction_count)}
        </p>
        <p className="mt-1 text-sm text-white/75">Successful only</p>
      </div>

      {currencies.map((currency, index) => {
        const totalNum = parseFloat(currency.total);
        const colors = getGradientColors(index);

        return (
          <div
            key={currency.currency}
            className={`rounded-2xl border bg-gradient-to-br p-6 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark ${colors.from} ${colors.to} ${colors.border}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">
                {currency.currency}
              </h3>
              <span className="rounded-lg bg-black/10 p-2 text-white/90 dark:bg-white/10">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {formatCurrency(totalNum, currency.currency)}
            </p>
            <p className="mt-1 text-sm text-white/75">{formatNumber(currency.tx_count)} transactions</p>
          </div>
        );
      })}
    </div>
  );
}
