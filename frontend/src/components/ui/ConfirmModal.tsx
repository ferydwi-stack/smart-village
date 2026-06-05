import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-scaleUp">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 text-sm">{message}</p>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-4 bg-surface border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", variantClasses[confirmVariant])}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

