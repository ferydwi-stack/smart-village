import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-slate-100 shadow-sm">
      {illustration && <div className="text-slate-300 mb-4">{illustration}</div>}
      <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">{subtitle}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

