'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { Search, Eye, AlertTriangle, Ban, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ManageUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [userToDeactivate, setUserToDeactivate] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const response = await api.get('/admin/users', { params: { page, search, limit: 10 } });
      return response.data;
    }
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;
    
    try {
      await api.put(`/admin/users/${userToDeactivate}/deactivate`);
      toast.success('User berhasil dinonaktifkan');
      setUserToDeactivate(null);
      refetch();
    } catch (error) {
      toast.error('Gagal menonaktifkan user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Kelola User</h1>
        <p className="text-sm text-slate-500">Daftar pengguna terdaftar di DesaMart</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-lg border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Cari user berdasarkan nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="flex justify-center p-8 bg-white rounded-b-lg border border-t-0 border-slate-100">
          <LoadingSpinner />
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-b-lg border border-t-0 border-slate-100 text-slate-500">
          Tidak ada user ditemukan.
        </div>
      ) : (
        <div className="bg-white rounded-b-lg border border-t-0 border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-surface text-slate-500">
                <tr>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Tanggal Daftar</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-surface/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-on-surface">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      {user.is_active !== false ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Aktif</span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.is_active !== false && (
                          <button 
                            onClick={() => setUserToDeactivate(user.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                            title="Nonaktifkan User"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {user.is_active === false && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 italic">No Action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Deactivate Modal */}
      <ConfirmModal
        isOpen={!!userToDeactivate}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Nonaktifkan User?"
        message="Apakah Anda yakin ingin menonaktifkan akun ini? Pengguna tidak akan bisa masuk ke sistem."
        confirmLabel="Ya, Nonaktifkan"
        confirmVariant="danger"
      />
    </div>
  );
}

