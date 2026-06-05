'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Package, Receipt, AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data.data;
    }
  });

  const { data: complaintsData, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ['admin-recent-complaints'],
    queryFn: async () => {
      const response = await api.get('/admin/complaints?limit=3');
      return response.data.data;
    }
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users?limit=5');
      return response.data.data;
    }
  });

  if (isStatsLoading || isComplaintsLoading || isUsersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const recentComplaints = complaintsData || [];
  const recentActivity = usersData || [];
  
  // Transform category stats for the chart
  const categoryStats = stats?.complaints_by_category 
    ? Object.entries(stats.complaints_by_category).map(([name, count]) => ({
        label: name || 'Umum',
        value: (count as number) * 10 // scale for display
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan aktivitas DesaMart dari data riil sistem</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Total User</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats?.total_users || 0}</h3>
            <span className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" /> +12% bln ini
            </span>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Produk</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats?.total_products || 0}</h3>
            <span className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" /> +5% bln ini
            </span>
          </div>
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Transaksi Hari Ini</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats?.today_orders || 0}</h3>
            <span className="text-xs text-slate-400 mt-1">Transaksi selesai</span>
          </div>
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
            <Receipt className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Pengaduan Pending</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats?.pending_complaints || 0}</h3>
            {stats?.pending_complaints > 0 ? (
              <span className="text-xs text-red-600 font-medium mt-1">Butuh penanganan</span>
            ) : (
              <span className="text-xs text-green-600 font-medium mt-1">Semua teratasi</span>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center border",
            stats?.pending_complaints > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-surface-container text-slate-400 border-surface-container"
          )}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-surface-container shadow-sm">
          <h2 className="font-bold text-on-surface mb-4">Statistik Pengaduan per Kategori</h2>
          
          <div className="flex items-end justify-start h-48 pt-4 gap-6 overflow-x-auto hide-scrollbar">
            {categoryStats.length > 0 ? categoryStats.map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-16 md:w-20 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-40">
                  <div 
                    className="w-10 bg-primary-100 hover:bg-primary rounded-t-lg transition-all cursor-help relative group"
                    style={{ height: `${Math.min(item.value, 100)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value / 10} Aduan
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase text-center leading-tight truncate w-full">{item.label}</span>
              </div>
            )) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data pengaduan
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints Sidebar */}
        <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-on-surface">Aduan Terbaru</h2>
            <Link href="/admin/complaints" className="text-xs font-bold text-primary hover:text-primary-700 uppercase tracking-tight">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-4">
            {recentComplaints.length > 0 ? recentComplaints.map((item: any) => (
              <div key={item.id} className="border-b border-surface/10 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-on-surface">{item.user?.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{item.message}</p>
                <span className={cn(
                  "inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  item.category === 'Produk' || item.category === 'Produk Bermasalah' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {item.category}
                </span>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-4">Tidak ada aduan terbaru</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm">
        <h2 className="font-bold text-on-surface mb-4">Pendaftar Terbaru (Log User)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-surface text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tanggal Gabung</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? recentActivity.map((user: any, idx: number) => (
                <tr key={user.id || idx} className="border-b border-surface/10 last:border-0 hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-on-surface">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                      user.is_active ? "text-green-600 bg-green-50 border-green-100" : "text-red-600 bg-red-50 border-red-100"
                    )}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada user terdaftar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

