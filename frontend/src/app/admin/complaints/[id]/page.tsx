'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowLeft, User, Bot, Loader2, Check } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: complaint, isLoading, refetch } = useQuery({
    queryKey: ['admin-complaint', id],
    queryFn: async () => {
      const response = await api.get(`/admin/complaints/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });

  const { mutate: takeAction, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/admin/complaints/${id}/action`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Tindakan berhasil disimpan');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan tindakan');
    }
  });

  const [status, setStatus] = useState('');
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');

  // Set initial status when data loaded
  useState(() => {
    if (complaint) {
      setStatus(complaint.status);
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!complaint) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border border-slate-100 text-slate-500">
        Pengaduan tidak ditemukan.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error('Catatan wajib diisi');
      return;
    }

    // Map UI action to Backend anticipated values
    const actionMap: Record<string, string> = {
      'warn_user': 'warning',
      'delete_product': 'product_deleted',
      'suspend_account': 'account_suspended',
      'no_action': 'no_action'
    };

    takeAction({
      status: status || complaint.status,
      action: actionMap[action] || 'no_action',
      note: notes // Backend expects 'note' not 'notes'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/complaints" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-surface-container transition-colors">
          <ArrowLeft className="h-5 w-5 text-on-surface" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Tangani Pengaduan</h1>
          <p className="text-sm text-slate-500 font-medium">Ticket ID: #CMP-{complaint.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Info & History */}
        <div className="lg:col-span-3 space-y-6">
          {/* Complaint Info */}
          <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <StatusBadge status={complaint.status} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDateTime(complaint.created_at)}</span>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 bg-surface rounded-xl border border-surface-container">
              <div className="h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                {complaint.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-on-surface">{complaint.user?.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{complaint.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Kategori AI:</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {complaint.category}
              </span>
              <span className="text-slate-400 font-medium">Confidence: {(complaint.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Full Chat History */}
          <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm overflow-hidden flex flex-col">
            <h2 className="font-bold text-on-surface mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Riwayat Percakapan
            </h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
              {complaint.messages && complaint.messages.length > 0 ? (
                complaint.messages.map((msg: any) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      msg.sender === 'user' 
                        ? "bg-white border border-surface-container text-on-surface rounded-tr-none" 
                        : msg.sender === 'admin'
                          ? "bg-primary text-white rounded-tl-none"
                          : "bg-surface text-on-surface rounded-tl-none border border-surface-container"
                    )}>
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {msg.sender === 'bot' ? 'Assistant' : msg.sender}
                      </span>
                      <span className="text-[9px] text-slate-300">•</span>
                      <span className="text-[9px] text-slate-300 font-medium">{formatDateTime(msg.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-sm py-10 italic">Belum ada percakapan terekam.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm sticky top-6">
            <h2 className="font-bold text-on-surface mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Keputusan Admin
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status Penanganan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border-surface-container bg-surface focus:border-primary focus:ring-primary text-sm font-medium transition-all"
                >
                  <option value="open">Open (Baru)</option>
                  <option value="in_progress">Dalam Proses</option>
                  <option value="resolved">Selesai (Resolved)</option>
                  <option value="closed">Ditutup (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tindakan Sistem</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full rounded-xl border-surface-container bg-surface focus:border-primary focus:ring-primary text-sm font-medium transition-all"
                >
                  <option value="">Tidak Ada Tindakan</option>
                  <option value="warn_user">Kirim Peringatan ke User</option>
                  <option value="delete_product">Hapus Produk Melanggar</option>
                  <option value="suspend_account">Nonaktifkan Akun Penjual</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Respon / Catatan Internal</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border-surface-container bg-surface focus:border-primary focus:ring-primary text-sm transition-all"
                  placeholder="Tulis alasan keputusan Anda atau respon untuk warga..."
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20 active:scale-[0.98]"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                Simpan & Jalankan Aksi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add necessary icons to the imports at top
import { MessageSquare, Shield } from 'lucide-react';
