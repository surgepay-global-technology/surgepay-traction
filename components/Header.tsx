'use client';

import Image from 'next/image';

interface HeaderProps {
  onRefresh?: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-primary via-primary to-primary-dark shadow-md backdrop-blur-md dark:border-slate-800/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="shrink-0 rounded-xl bg-white/95 p-2 shadow-sm ring-1 ring-black/5 dark:bg-white dark:ring-white/20">
            <Image
              src="/surgepay-logo.png"
              alt="SurgePay"
              width={112}
              height={36}
              className="h-8 w-auto sm:h-9"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              Analytics
            </h1>
            <p className="hidden text-xs text-white/85 sm:block sm:text-sm">
              Transaction and wallet metrics
            </p>
          </div>
        </div>

        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-sm ring-1 ring-black/5 transition hover:bg-secondary-dark hover:ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
