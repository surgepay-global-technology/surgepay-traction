'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface StatsByCurrency {
  currency: string;
  total_transaction_count: number;
  total_amount: number;
}

const CURRENCY_COLORS: Record<string, string> = {
  'USDC': '#F5A623', // Orange
  'NGN': '#009B77',  // Teal
};

export default function CurrencyPieChart() {
  const [stats, setStats] = useState<StatsByCurrency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/stats-by-currency');
      const result = await response.json();
      setStats(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading h-80 w-full"></div>
      </div>
    );
  }

  const pieData = stats.map(stat => ({
    name: stat.currency,
    value: stat.total_transaction_count,
    amount: stat.total_amount,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Volume Distribution by Currency
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CURRENCY_COLORS[entry.name] || '#666'} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value} transactions`,
              props.payload.name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {pieData.map((item) => (
          <div key={item.name} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: CURRENCY_COLORS[item.name] }}
              />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.name}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {formatCurrency(item.amount, item.name)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.value} transactions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
