'use client';

import { useEffect, useState } from 'react';
import type { UsersStats, WalletsAllData } from '@/lib/api-types';
import { isBackendUnavailableError } from '@/lib/dashboard-empty';
import { formatNumber, safeFetch, shortenAddress } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

function KpiCardPrimary({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary to-primary-dark p-5 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/85">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-white/70">{sub}</p>
    </div>
  );
}

function KpiCardMuted({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-panel dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-panel-dark">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

export default function AllWalletsOnBase() {
  const [walletsData, setWalletsData] = useState<WalletsAllData | null>(null);
  const [usersStats, setUsersStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const walletsResult = await safeFetch<WalletsAllData>(`/api/wallets/all?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
          signal,
        });
        setWalletsData(walletsResult.data ?? null);

        try {
          const usersResult = await safeFetch<UsersStats>(`/api/users/stats?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal,
          });
          setUsersStats(usersResult.data ?? null);
        } catch {
          if (!signal.aborted) setUsersStats(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load');
        setWalletsData(null);
        setUsersStats(null);
      } finally {
        if (!signal.aborted) setLoading(false);
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

  if (!walletsData || walletsData.wallet_addresses.length === 0) {
    return (
      <EmptyState
        variant="empty"
        title="No wallets to list"
        description="Wallet addresses appear when successful transactions include them in their records."
      />
    );
  }

  const sortedWallets = [...walletsData.wallet_addresses].sort((a, b) => {
    const aCount = walletsData.wallet_details[a]?.txCount || 0;
    const bCount = walletsData.wallet_details[b]?.txCount || 0;
    return bCount - aCount;
  });

  const displayedWallets = showAll ? sortedWallets : sortedWallets.slice(0, 3);

  return (
    <div className="space-y-6">
      {usersStats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCardPrimary
            label="Total users"
            value={formatNumber(usersStats.total_users)}
            sub="Registered"
          />
          <KpiCardMuted
            label="Tier 1"
            value={formatNumber(usersStats.tier1_verified)}
            sub="Verified"
          />
          <KpiCardMuted
            label="Tier 2"
            value={formatNumber(usersStats.tier2_verified)}
            sub="Verified"
          />
          <KpiCardMuted
            label="Tier 3"
            value={formatNumber(usersStats.tier3_verified)}
            sub="Verified"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
          User verification breakdown isn’t available in this view.
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {showAll ? `All addresses (${walletsData.wallet_addresses.length})` : 'Most active'}
          </h3>
          {walletsData.wallet_addresses.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {showAll ? 'Show top 3' : `Show all ${walletsData.wallet_addresses.length}`}
            </button>
          )}
        </div>

        <div className={`space-y-2 ${showAll ? 'max-h-96 overflow-y-auto pr-1' : ''}`}>
          {displayedWallets.map((address, index) => {
            const details = walletsData.wallet_details[address] || { txCount: 0, totalVolume: 0 };
            return (
              <div
                key={address}
                className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-primary/25 hover:bg-white dark:border-slate-700/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      <span className="lg:hidden">{shortenAddress(address)}</span>
                      <span className="hidden lg:inline">{address}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Wallet</p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark dark:bg-primary/20 dark:text-primary">
                    {formatNumber(details.txCount)} txs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
