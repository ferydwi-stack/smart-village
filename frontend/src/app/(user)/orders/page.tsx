'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBuyerOrders } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, ChevronRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { key: '', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'processing', label: 'Dikemas' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBuyerOrders(activeTab, page, 10);
  const orders = data?.data || [];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-on-surface">Pesanan Saya</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6 custom-scrollbar bg-white rounded-t-lg px-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                activeTab === tab.key
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-slate-100 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-slate-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            illustration={<Package className="h-16 w-16" />}
            title="Belum ada pesanan"
            subtitle="Anda belum melakukan pemesanan untuk kategori ini."
            actionLabel="Mulai Belanja"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-3 mb-3 gap-2">
                  <div>
                    <span className="text-xs font-medium text-slate-400">Order ID</span>
                    <p className="text-sm font-bold text-slate-700">#ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDate(order.created_at)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {order.product?.images && order.product.images.length > 0 ? (
                      <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-slate-400 m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-sm line-clamp-1">{order.product?.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Dari: {order.seller?.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-600">{order.quantity} x {formatCurrency(order.product?.price || 0)}</p>
                      <p className="text-sm font-bold text-primary-600">{formatCurrency(order.total_price)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-3 pt-3 flex justify-end">
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Lihat Detail <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

