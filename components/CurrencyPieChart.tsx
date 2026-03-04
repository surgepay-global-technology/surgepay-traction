'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, safeFetch } from '@/lib/utils';

interface StatsByCurrency {
  currency: string;
  total_transaction_count: number;
  total_amount: number;
}

const CURRENCY_COLORS: Record<string, string> = {
  'USDC': '#F5A623', // Orange
  'USD': '#F59E0B',  // Amber
  'USDT': '#10B981', // Emerald
  'NGN': '#009B77',  // Teal
  'XLM': '#6366F1',  // Indigo
  'SOL': '#8B5CF6',  // Purple
  'ETH': '#6366F1',  // Blue
  'TRX': '#EF4444',  // Red
  'KES': '#06B6D4',  // Cyan
  'GHS': '#EC4899',  // Pink
  'UGX': '#14B8A6',  // Teal
  'XOF': '#F97316',  // Orange
};

// Generate color for unknown currencies
const getColorForCurrency = (currency: string, index: number): string => {
  if (CURRENCY_COLORS[currency]) return CURRENCY_COLORS[currency];
  
  // Fallback colors for unknown currencies
  const fallbackColors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', 
    '#10B981', '#06B6D4', '#6366F1', '#EF4444'
  ];
  return fallbackColors[index % fallbackColors.length];
};

export default function CurrencyPieChart() {
  const [stats, setStats] = useState<StatsByCurrency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const result = await safeFetch(`/api/transactions/stats-by-currency?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
          signal: controller.signal,
        });
        setStats(result.data || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

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
              <Cell key={`cell-${index}`} fill={getColorForCurrency(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{data.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(data.amount, data.name)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {data.value} transactions ({((data.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
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
          <div key={item.name} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getColorForCurrency(item.name, index) }}
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
