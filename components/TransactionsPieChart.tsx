'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatNumber, safeFetch } from '@/lib/utils';

interface StatsByType {
  transaction_type: string;
  currency: string;
  successful_tx_count: number;
  total_amount: number;
}

const COLORS = ['#009B77', '#F5A623', '#007B5F', '#E09400', '#00C9A7', '#FF6B35'];

export default function TransactionsPieChart() {
  const [stats, setStats] = useState<StatsByType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch(`/api/transactions/stats-by-type?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
          signal: controller.signal,
        });
        setStats(result.data || []);
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
    return null;
  }

  // Prepare data for pie chart - group by transaction type (sum across currencies)
  const typeAggregated: Record<string, number> = {};
  stats.forEach(stat => {
    if (!typeAggregated[stat.transaction_type]) {
      typeAggregated[stat.transaction_type] = 0;
    }
    typeAggregated[stat.transaction_type] += stat.successful_tx_count;
  });

  const pieData = Object.entries(typeAggregated).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Transaction Distribution by Type
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={120}
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
                const data = payload[0].payload;
                const totalTxs = pieData.reduce((sum, item) => sum + item.value, 0);
                const percentage = ((data.value / totalTxs) * 100).toFixed(1);
                return (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{data.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatNumber(data.value)} transactions
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage}% of total
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
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {pieData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(item.value)} txs
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
