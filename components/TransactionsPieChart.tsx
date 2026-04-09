'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TransactionStatsByTypeRow } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatNumber, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

const COLORS = ['#5F2AF3', '#009B77', '#ADEE68', '#F5A623', '#4A1ED4', '#007B5F', '#8ECC4A', '#E09400'];

export default function TransactionsPieChart() {
  const [stats, setStats] = useState<TransactionStatsByTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch<TransactionStatsByTypeRow[]>(
          `/api/transactions/stats-by-type?t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal: controller.signal,
          }
        );
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
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">By type</p>
        <div className="loading h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4 sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">By type</p>
        <EmptyState
          variant={isBackendUnavailableError(error) ? 'unavailable' : 'error'}
          compact
          devDetail={error}
        />
      </div>
    );
  }

  const typeAggregated: Record<string, number> = {};
  stats.forEach((stat) => {
    if (!typeAggregated[stat.transaction_type]) {
      typeAggregated[stat.transaction_type] = 0;
    }
    typeAggregated[stat.transaction_type] += stat.successful_tx_count;
  });

  const pieData = Object.entries(typeAggregated).map(([name, value]) => ({
    name,
    value,
  }));

  const totalTxs = pieData.reduce((sum, item) => sum + item.value, 0);

  if (totalTxs === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">By type</p>
        <EmptyState variant="empty" compact title="No type mix yet" />
      </div>
    );
  }

  return (
    <div className="card">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">By type</p>
      <h3 className="mb-4 text-center text-base font-semibold text-slate-900 dark:text-white">
        Transaction share
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as (typeof pieData)[0];
                const percentage = totalTxs ? ((data.value / totalTxs) * 100).toFixed(1) : '0';
                return (
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg dark:border-slate-600 dark:bg-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {formatNumber(data.value)} transactions
                    </p>
                    <p className="text-xs text-slate-500">{percentage}% of total</p>
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
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-600/80 dark:bg-slate-800/40"
          >
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-500">{formatNumber(item.value)} txs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
