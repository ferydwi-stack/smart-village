'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, Minus, Plus, Store, MessageCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id as string);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <EmptyState
            illustration={<ShoppingBag className="h-16 w-16" />}
            title="Produk tidak ditemukan"
            subtitle="Produk mungkin sudah dihapus atau link tidak valid."
            actionLabel="Kembali ke Marketplace"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  const handleQuantityChange = (type: 'plus' | 'minus') => {
    if (type === 'plus') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      } else {
        toast.error('Stok tidak mencukupi');
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error('Stok habis');
      return;
    }
    router.push(`/checkout/${product.id}?quantity=${quantity}`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/products" className="hover:text-primary-600">Marketplace</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-on-surface font-medium">{product.category?.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* LEFT: Images */}
          <div className="md:col-span-3 space-y-4">
            <div className="aspect-[4/3] bg-white rounded-xl overflow-hidden border border-slate-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ShoppingBag className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImageIdx === idx ? 'border-primary-600' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-surface-container shadow-sm space-y-4">
              <div>
                <span className="bg-surface-container text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                  {product.category?.name}
                </span>
                <h1 className="text-2xl font-bold text-on-surface mt-2">{product.name}</h1>
              </div>

              <p className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </p>

              <div className="border-t border-b border-slate-100 py-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Jumlah</span>
                
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button 
                    onClick={() => handleQuantityChange('minus')}
                    className="p-2 text-slate-600 hover:text-primary-600 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-on-surface">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('plus')}
                    className="p-2 text-slate-600 hover:text-primary-600 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Stok: <span className="font-medium text-on-surface">{product.stock} tersedia</span></span>
                <span className="text-slate-500">Total: <span className="font-bold text-primary-600 text-lg">{formatCurrency(product.price * quantity)}</span></span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </button>
              </div>
            </div>



            {/* Description */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-on-surface mb-3">Deskripsi Produk</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
