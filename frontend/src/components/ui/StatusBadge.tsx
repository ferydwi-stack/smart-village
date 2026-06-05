import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; className: string }> = {
    // Order Statuses
    pending: { label: 'Menunggu Diproses', className: 'bg-yellow-100 text-yellow-700' },
    processing: { label: 'Dikemas', className: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Dikirim', className: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Selesai', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700' },
    
    // Complaint Statuses
    open: { label: 'Open', className: 'bg-red-100 text-red-700' },
    in_progress: { label: 'Diproses', className: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Selesai', className: 'bg-green-100 text-green-700' },
    closed: { label: 'Ditutup', className: 'bg-slate-100 text-slate-700' },
    
    // Product Statuses
    active: { label: 'Aktif', className: 'bg-green-100 text-green-700' },
    inactive: { label: 'Nonaktif', className: 'bg-slate-100 text-slate-700' },
    deleted: { label: 'Dihapus', className: 'bg-red-100 text-red-700' },
  };

  const config = map[status] || { label: status, className: 'bg-slate-100 text-slate-700' };

  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", config.className)}>
      {config.label}
    </span>
  );
}

