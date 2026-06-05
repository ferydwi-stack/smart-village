'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuantity = parseInt(searchParams.get('quantity') || '1');
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(id as string);
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">Produk tidak ditemukan</h1>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium mt-2 block">
              Kembali ke Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!address) {
      newErrors.address = 'Alamat pengiriman wajib diisi';
    } else if (address.length < 10) {
      newErrors.address = 'Alamat minimal 10 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = () => {
    if (!validate()) return;
    
    createOrder(
      {
        product_id: product.id,
        quantity: initialQuantity,
        shipping_address: address,
        note: note,
      },
      {
        onSuccess: (newOrder) => {
          toast.success('Pesanan berhasil dibuat!');
          router.push(`/orders/${newOrder.id}`);
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || 'Gagal membuat pesanan';
          toast.error(message);
        },
      }
    );
  };

  const total = product.price * initialQuantity;

  return (
    <div className="min-height-screen bg-slate-50 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/products/${product.id}`} className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium">
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali</span>
          </Link>
          <h1 className="font-bold text-lg text-slate-800">Checkout</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT: Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Alamat */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h2 className="font-bold text-slate-800">Alamat Pengiriman</h2>
              </div>
              
              <div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  placeholder="Masukkan alamat pengiriman di desa Anda (minimal 10 karakter)..."
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Catatan untuk Penjual (Opsional)</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                placeholder="Contoh: Tolong kirim yang matang ya pak."
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{note.length}/500</p>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm sticky top-24 space-y-4">
              <h2 className="font-bold text-slate-800">Ringkasan Pesanan</h2>
              
              <div className="flex gap-3 py-4 border-t border-b border-slate-100">
                <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-slate-400 m-auto" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {initialQuantity} x {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim</span>
                  <span className="text-green-600 font-medium">Rp 0 (Gratis)</span>
                </div>
                <div className="border-t border-slate-100 my-2 pt-2 flex justify-between font-bold text-slate-800 text-base">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isCreating}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Konfirmasi Pesanan'}
              </button>
              
              <p className="text-xs text-slate-400 text-center">
                Dengan mengonfirmasi, Anda menyetujui ketentuan transaksi di DesaMart.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
