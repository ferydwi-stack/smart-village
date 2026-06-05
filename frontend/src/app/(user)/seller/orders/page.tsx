'use client';

import { useState } from 'react';
import { useSellerOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Package, ChevronDown, ChevronUp, MapPin, Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const tabs = [
  { key: '', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'processing', label: 'Dikemas' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch } = useSellerOrders(activeTab, page, 10);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const orders = data?.data || [];

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatus(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success(`Pesanan berhasil diupdate ke: ${status}`);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Gagal mengupdate status');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-on-surface">Pesanan Masuk</h1>
            <p className="text-sm text-slate-500">Kelola pesanan dari pembeli toko Anda</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto border-b border-surface-container mb-6 hide-scrollbar bg-white rounded-t-lg px-2">
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
                    ? "text-primary font-bold"
                    : "text-slate-500 hover:text-on-surface"
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              illustration={<Package className="h-16 w-16" />}
              title="Belum ada pesanan"
              subtitle="Belum ada pesanan masuk untuk kategori ini."
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const isExpanded = expandedOrders[order.id];
                
                return (
                  <div key={order.id} className="bg-white rounded-lg border border-surface-container overflow-hidden">
                    {/* Header */}
                    <div className="p-4 flex flex-row justify-between items-center gap-2 border-b border-surface/10 bg-surface/30">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{formatDateTime(order.created_at)}</p>
                        <p className="text-sm font-bold text-on-surface">#ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <button 
                          onClick={() => toggleExpand(order.id)}
                          className="p-1 text-slate-400 hover:text-primary rounded-full hover:bg-surface transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Buyer & Product */}
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-surface text-primary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 border border-surface-container">
                            {order.buyer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface text-sm">{order.buyer?.name}</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Pembeli</p>
                          </div>
                        </div>

                        <div className="flex gap-3 bg-surface/50 p-3 rounded-lg flex-1 max-w-full md:max-w-md border border-surface-container">
                          <div className="h-12 w-12 bg-white rounded border border-surface-container overflow-hidden flex-shrink-0">
                            {order.product?.images && order.product.images.length > 0 ? (
                              <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-slate-400 m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-on-surface line-clamp-1">{order.product?.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{order.quantity} x {formatCurrency(order.product?.price || 0)}</p>
                            <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(order.total_price)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div className="flex gap-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-slate-700">Alamat:</span>
                              <p className="text-xs mt-0.5">{order.shipping_address}</p>
                            </div>
                          </div>
                          
                          {order.note && (
                            <div className="text-sm bg-yellow-50 p-2.5 rounded-lg text-yellow-800 italic text-xs">
                              <span className="font-bold not-italic">Catatan:</span> "{order.note}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 border border-red-600 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Terima & Kemas'}
                            </button>
                          </>
                        )}

                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Tandai Dikirim'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

