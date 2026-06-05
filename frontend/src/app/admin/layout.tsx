'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Leaf, Bell, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  if (!mounted) {
    return null;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const localUser = userStr ? JSON.parse(userStr) : null;
  const isLocalAdmin = localUser?.role === 'admin';

  if (!token || !isLocalAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-cream">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-on-surface mb-2">Akses Terbatas</h1>
          <p className="text-sm text-slate-500 mb-6">
            Halaman ini hanya dapat diakses oleh Admin. Sesi Anda mungkin telah berakhir atau Anda belum login sebagai Admin.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Dark Green Header */}
      <header className="bg-primary-900 text-white h-16 flex items-center justify-between px-6 flex-shrink-0 border-b border-primary-800">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="h-6 w-6 text-primary-300" />
          <span className="tracking-tight">DesaMart Admin</span>
          <img src="/UNIVERSITASTEKNOKRAT.png" alt="Universitas Teknokrat" className="h-8 w-auto ml-2 object-contain" />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-1.5 text-primary-200 hover:text-white hover:bg-primary-800 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-700 text-primary-100 rounded-full flex items-center justify-center font-bold border border-primary-600">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="font-semibold text-sm">{user?.name || 'Admin'}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 bg-surface overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

