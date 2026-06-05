'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderDetail, useCancelOrder, useConfirmOrder } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowLeft, ShoppingBag, MapPin, User, Check, Clock, Package, Truck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: order, isLoading } = useOrderDetail(id as string);
  const { mutate: cancelOrder } = useCancelOrder();
  const { mutate: confirmOrder } = useConfirmOrder();
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">Pesanan tidak ditemukan</h1>
            <Link href="/orders" className="text-primary-600 hover:text-primary-700 font-medium mt-2 block">
              Kembali ke Pesanan Saya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    cancelOrder(
      { id: order.id, reason: cancelReason },
      {
        onSuccess: () => {
          toast.success('Pesanan berhasil dibatalkan');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan');
        },
      }
    );
  };

  const handleConfirm = () => {
    confirmOrder(order.id, {
      onSuccess: () => {
        toast.success('Pesanan selesai!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Gagal mengonfirmasi pesanan');
      },
    });
  };

  // Timeline steps
  const steps = [
    { key: 'pending', label: 'Pesanan Dibuat', icon: Clock },
    { key: 'processing', label: 'Diterima & Dikemas', icon: Package },
    { key: 'shipped', label: 'Dikirim', icon: Truck },
    { key: 'completed', label: 'Selesai', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey: string) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'completed'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (order.status === 'cancelled') {
      return stepIdx === 0 ? 'completed' : 'pending';
    }

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orders" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Detail Pesanan</h1>
            <p className="text-sm text-slate-500">#ORD-{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT: Status & Timeline */}
          <div className="md:col-span-3 space-y-6">
            {/* Status Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Status Pesanan</span>
                <StatusBadge status={order.status} />
              </div>
              
              {order.status === 'cancelled' && (
                <div className="bg-red-50 p-3 rounded-lg text-sm text-red-600 mb-4">
                  Pesanan dibatalkan. {order.cancel_reason && `Alasan: ${order.cancel_reason}`}
                </div>
              )}

              {/* Vertical Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-100">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key);
                  const Icon = step.icon;

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={cn(
                        "z-10 h-8 w-8 rounded-full flex items-center justify-center border-2",
                        status === 'completed' ? "bg-primary-600 border-primary-600 text-white" :
                        status === 'current' ? "bg-white border-primary-600 text-primary-600 pulse" :
                        "bg-white border-slate-200 text-slate-300"
                      )}>
                        {status === 'completed' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <p className={cn(
                          "text-sm font-bold",
                          status === 'pending' ? "text-slate-400" : "text-slate-800"
                        )}>
                          {step.label}
                        </p>
                        {status === 'current' && (
                          <p className="text-xs text-slate-500 mt-0.5">Status saat ini</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary & Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-800">Produk</h2>
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {order.product?.images && order.product.images.length > 0 ? (
                    <img src={order.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-slate-400 m-auto" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 text-sm line-clamp-2">{order.product?.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.quantity} x {formatCurrency(order.product?.price || 0)}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800">
                <span>Total Bayar</span>
                <span className="text-primary-600">{formatCurrency(order.total_price)}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h2 className="font-bold text-slate-800">Alamat Pengiriman</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {order.shipping_address}
              </p>
              {order.note && (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <span className="font-medium text-slate-700">Catatan:</span> "{order.note}"
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    {order.seller?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{order.seller?.name}</h3>
                    <p className="text-xs text-slate-500">Penjual</p>
                  </div>
                </div>
                <Link href={`/chat`} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                  Tanya Penjual
                </Link>
              </div>
            </div>

            {/* Actions */}
            {order.status === 'pending' && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full border border-red-600 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg transition-colors"
              >
                Batalkan Pesanan
              </button>
            )}

            {order.status === 'shipped' && (
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Konfirmasi Pesanan Selesai
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Batalkan Pesanan?"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Batalkan"
        confirmVariant="danger"
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        title="Pesanan Selesai?"
        message="Pastikan Anda sudah menerima barang dengan baik sebelum mengonfirmasi pesanan selesai."
        confirmLabel="Ya, Selesai"
        confirmVariant="primary"
      />
    </div>
  );
}
