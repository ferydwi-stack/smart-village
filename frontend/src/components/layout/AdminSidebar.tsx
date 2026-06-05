'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, AlertTriangle, BarChart, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Kelola User', icon: Users, href: '/admin/users' },
    { label: 'Kelola Produk', icon: Package, href: '/admin/products' },
    { label: 'Kelola Pengaduan', icon: AlertTriangle, href: '/admin/complaints', badge: 0 }, // TODO: Dynamic badge
  ];

  return (
    <aside className="w-64 bg-[#0a200e] text-slate-300 hidden md:flex flex-col py-6 border-r border-primary-800/20">
      <div className="px-6 mb-8">
        <h1 className="font-bold text-xl text-white">DesaMart Admin</h1>
        <p className="text-xs text-primary-300">Panel Kontrol</p>
      </div>

      <nav className="flex flex-col gap-1 px-4 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-primary-100 hover:bg-primary-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-red-900/20 hover:text-red-400 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

