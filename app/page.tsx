'use client';

import { useEffect, useState, useCallback } from 'react';
import TransactionStats from '@/components/TransactionStats';
import TransactionsByType from '@/components/TransactionsByType';
import TransactionsPieChart from '@/components/TransactionsPieChart';
import CurrencyPieChart from '@/components/CurrencyPieChart';
import RecentTransactions from '@/components/RecentTransactions';
import AllWalletsOnBase from '@/components/AllWalletsOnBase';
import AppDownloads from '@/components/AppDownloads';
import Header from '@/components/Header';
import DashboardSection from '@/components/DashboardSection';

const AUTO_REFRESH_INTERVAL = 30 * 1000;

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    setMounted(true);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(95,42,243,0.12),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(95,42,243,0.18),transparent)]">
      <Header onRefresh={handleRefresh} />

      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <p className="text-right text-xs text-slate-500 dark:text-slate-400">
          {mounted && lastRefresh ? (
            <>
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·
              Refreshes every 30s
            </>
          ) : (
            <span className="inline-block h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          )}
        </p>
      </div>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSection
          title="Overview"
          description="Successful transaction counts and volume by currency."
        >
          <TransactionStats key={`stats-${refreshKey}`} />
        </DashboardSection>

        <DashboardSection
          title="Distribution"
          description="How activity splits across currencies and transaction types."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CurrencyPieChart key={`currency-chart-${refreshKey}`} />
            <TransactionsPieChart key={`type-chart-${refreshKey}`} />
          </div>
        </DashboardSection>

        <DashboardSection
          title="App downloads"
          description="Published figures from app stores when configured for this deployment."
        >
          <AppDownloads key={`downloads-${refreshKey}`} />
        </DashboardSection>

        <DashboardSection
          title="Wallets & users"
          description="On-chain wallet activity linked from transactions, alongside user totals when available."
        >
          <AllWalletsOnBase key={`all-wallets-${refreshKey}`} />
        </DashboardSection>

        <DashboardSection
          title="Breakdown"
          description="Successful transactions grouped by type and currency."
        >
          <TransactionsByType key={`type-${refreshKey}`} />
        </DashboardSection>

        <DashboardSection
          title="Recent activity"
          description="Latest successful transactions, newest first."
        >
          <RecentTransactions key={`recent-${refreshKey}`} />
        </DashboardSection>
      </main>
    </div>
  );
}
