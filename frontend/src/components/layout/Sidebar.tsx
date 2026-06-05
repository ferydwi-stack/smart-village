'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, ShoppingBag, Package, PlusCircle, Inbox, MessageCircle, User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Marketplace', icon: Store, href: '/products' },
    { label: 'Pesanan Saya', icon: ShoppingBag, href: '/orders' },
    { type: 'divider' },
    { type: 'label', label: 'Toko Saya' },
    { label: 'Produk Saya', icon: Package, href: '/seller/products' },
    { label: 'Tambah Produk', icon: PlusCircle, href: '/seller/products/new' },
    { label: 'Pesanan Masuk', icon: Inbox, href: '/seller/orders', badge: 0 }, // TODO: Dynamic badge
    { type: 'divider' },
    { label: 'Chat Bantuan', icon: MessageCircle, href: '/chat' },
    { label: 'Profil', icon: User, href: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex flex-col gap-1 px-4">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="border-t border-slate-100 my-3"></div>;
          }
          
          if (item.type === 'label') {
            return (
              <span key={index} className="text-xs font-semibold text-slate-400 uppercase px-3 mb-1">
                {item.label}
              </span>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href!}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary-50 text-primary-600 border-l-4 border-primary-600 rounded-l-none" 
                  : "text-slate-600 hover:bg-surface hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

