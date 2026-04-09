'use client';

import { useEffect, useState } from 'react';
import type { AppDownloadsData } from '@/lib/api-types';
import { formatNumber, safeFetch } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function AppDownloads() {
  const [data, setData] = useState<AppDownloadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setFailed(false);
        const result = await safeFetch<AppDownloadsData>('/api/app-downloads', {
          signal: controller.signal,
        });
        setData(result.data ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setData(null);
          setFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <div className="loading mb-2 h-5 w-28" />
            <div className="loading h-9 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (failed) {
    return <EmptyState variant="error" title="Couldn’t load download metrics" />;
  }

  const apple = data?.apple_downloads ?? null;
  const google = data?.google_play_downloads ?? null;

  if (apple === null && google === null) {
    return (
      <EmptyState
        variant="empty"
        title="Download counts aren’t shown here"
        description="Figures appear when this deployment publishes App Store and Play Store totals."
      />
    );
  }

  const total = (apple ?? 0) + (google ?? 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary to-primary-dark p-6 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">App Store</h3>
          <span className="text-white/80">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-white">
          {apple !== null ? formatNumber(apple) : '—'}
        </p>
        <p className="mt-1 text-sm text-white/75">Apple</p>
      </div>

      <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary to-secondary-dark p-6 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-dark">Google Play</h3>
          <span className="text-primary-dark/90">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L12.001 12l5.697-3.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z" />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-primary-dark">
          {google !== null ? formatNumber(google) : '—'}
        </p>
        <p className="mt-1 text-sm text-primary-dark/80">Android</p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/90 to-primary-dark p-6 shadow-panel ring-1 ring-black/5 dark:shadow-panel-dark">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">Combined</h3>
          <span className="rounded-lg bg-white/10 p-1.5 text-white/90">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-white">{formatNumber(total)}</p>
        <p className="mt-1 text-sm text-white/75">Stores with data only</p>
      </div>
    </div>
  );
}
