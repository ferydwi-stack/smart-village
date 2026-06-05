'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { Search, ChevronRight, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ManageComplaintsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints', page, search, status],
    queryFn: async () => {
      const response = await api.get('/admin/complaints', { params: { page, search, status, limit: 10 } });
      return response.data;
    }
  });

  const complaints = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const categoryColors: Record<string, string> = {
    'Produk': 'bg-red-500',
    'Transaksi': 'bg-blue-500',
    'Pengiriman': 'bg-orange-500',
    'Akun': 'bg-purple-500',
    'FAQ': 'bg-green-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Kelola Pengaduan</h1>
        <p className="text-sm text-slate-500">Daftar keluhan dan pertanyaan dari pengguna</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Cari pengaduan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
          />
        </div>


      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-slate-100 text-slate-500">
          Tidak ada pengaduan ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex">
              {/* Category Color Bar */}
              <div className={cn("w-2", categoryColors[item.category] || "bg-slate-300")}></div>

              <div className="flex-1 p-5">
                <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                  <div>
                    <span className="text-xs font-medium text-slate-400">#CMP-{item.id.slice(0, 8).toUpperCase()}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-6 w-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {item.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-on-surface text-sm">{item.user?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-start">
                    <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                  "{item.raw_message}"

                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full text-white",
                      categoryColors[item.category] || "bg-surface0"
                    )}>
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                  </div>


                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}
    </div>
  );
}

