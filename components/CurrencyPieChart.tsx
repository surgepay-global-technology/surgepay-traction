'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TransactionStatsByCurrency } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatCurrency, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

const CURRENCY_COLORS: Record<string, string> = {
  USDC: '#F5A623',
  USD: '#F59E0B',
  USDT: '#10B981',
  NGN: '#009B77',
  XLM: '#6366F1',
  SOL: '#8B5CF6',
  ETH: '#6366F1',
  TRX: '#EF4444',
  KES: '#06B6D4',
  GHS: '#EC4899',
  UGX: '#14B8A6',
  XOF: '#F97316',
};

const getColorForCurrency = (currency: string, index: number): string => {
  if (CURRENCY_COLORS[currency]) return CURRENCY_COLORS[currency];
  const fallbackColors = [
    '#5F2AF3',
    '#ADEE68',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
  ];
  return fallbackColors[index % fallbackColors.length];
};

export default function CurrencyPieChart() {
  const [stats, setStats] = useState<TransactionStatsByCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch<TransactionStatsByCurrency[]>(
          `/api/transactions/stats-by-currency?t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal: controller.signal,
          }
        );
        setStats(result.data || []);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load');
        setStats([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">By currency</p>
        <div className="loading h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4 sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">By currency</p>
        <EmptyState
          variant={isBackendUnavailableError(error) ? 'unavailable' : 'error'}
          compact
          devDetail={error}
        />
      </div>
    );
  }

  const pieData = stats.map((stat) => ({
    name: stat.currency,
    value: stat.total_transaction_count,
    amount: stat.total_amount,
  }));

  const totalCount = pieData.reduce((sum, item) => sum + item.value, 0);

  if (totalCount === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">By currency</p>
        <EmptyState variant="empty" compact title="No currency mix yet" />
      </div>
    );
  }

  return (
    <div className="card">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">By currency</p>
      <h3 className="mb-4 text-center text-base font-semibold text-slate-900 dark:text-white">
        Volume share
      </h3>

      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={118}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorForCurrency(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as (typeof pieData)[0];
                const pct = totalCount ? ((data.value / totalCount) * 100).toFixed(1) : '0';
                return (
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg dark:border-slate-600 dark:bg-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(data.amount, data.name)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.value} transactions ({pct}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ paddingLeft: '16px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {pieData.map((item, index) => (
          <div
            key={item.name}
            className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-600/80 dark:bg-slate-800/40"
          >
            <div className="mb-1 flex items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: getColorForCurrency(item.name, index) }}
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(item.amount, item.name)}
            </p>
            <p className="text-xs text-slate-500">{item.value} transactions</p>
          </div>
        ))}
      </div>
    </div>
  );
}
