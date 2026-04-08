'use client';

type Variant = 'empty' | 'unavailable' | 'error';

const defaultCopy: Record<
  Variant,
  { title: string; description: string }
> = {
  empty: {
    title: 'Nothing to show yet',
    description: 'When there is activity, it will appear here.',
  },
  unavailable: {
    title: 'Live data isn’t available here',
    description:
      'This preview can’t reach the analytics backend. Deployed environments with data connected will show real metrics.',
  },
  error: {
    title: 'Couldn’t load this section',
    description: 'Check your connection and use refresh, or try again in a moment.',
  },
};

function Icon({ variant }: { variant: Variant }) {
  const ring =
    'flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400';
  if (variant === 'empty') {
    return (
      <div className={ring} aria-hidden>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293L9.293 13.293A1 1 0 008.586 13H6"
          />
        </svg>
      </div>
    );
  }
  if (variant === 'unavailable') {
    return (
      <div className={ring} aria-hidden>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className={ring} aria-hidden>
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
    </div>
  );
}

interface EmptyStateProps {
  variant: Variant;
  title?: string;
  description?: string;
  className?: string;
  /** Tighter padding for chart/table slots */
  compact?: boolean;
  /** Shown only in development builds (e.g. raw error for debugging). */
  devDetail?: string;
}

export default function EmptyState({
  variant,
  title,
  description,
  className = '',
  compact = false,
  devDetail,
}: EmptyStateProps) {
  const copy = defaultCopy[variant];
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white text-center dark:border-slate-700/80 dark:from-slate-900/50 dark:to-slate-900/30',
        compact ? 'py-10 px-4' : 'py-14 px-6',
        className,
      ].join(' ')}
    >
      <Icon variant={variant} />
      <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title ?? copy.title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description ?? copy.description}
      </p>
      {process.env.NODE_ENV === 'development' && devDetail ? (
        <p className="mt-3 max-w-md break-all font-mono text-[10px] text-slate-400 dark:text-slate-500">
          {devDetail}
        </p>
      ) : null}
    </div>
  );
}
