import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function DashboardSection({
  title,
  description,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <section className={['scroll-mt-24', className].filter(Boolean).join(' ')}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
