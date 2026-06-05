'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency, truncate } from '@/lib/utils';
import { Search, SlidersHorizontal, MessageCircle, ShoppingBag, Store } from 'lucide-react';

const categories = [
  "Semua", "Makanan & Minuman", "Pertanian & Perkebunan", "Kerajinan Tangan", 
  "Pakaian & Aksesoris", "Elektronik", "Rumah Tangga", "Jasa", "Lainnya"
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    search,
    category: selectedCategory === 'Semua' ? '' : selectedCategory,
    sort,
    page,
    limit: 100
  });

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Cari produk di DesaMart..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm text-slate-500">
              Menampilkan <span className="font-medium text-on-surface">{products.length}</span> produk
            </span>
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border-slate-200 rounded-lg focus:border-primary-500 focus:ring-primary-500 py-1.5"
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Harga Terendah</option>
                <option value="termahal">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips - Scrollable */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 w-full bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            illustration={<ShoppingBag className="h-16 w-16" />}
            title="Produk tidak ditemukan"
            subtitle="Coba gunakan kata kunci lain atau reset filter kategori."
            actionLabel="Reset Filter"
            actionHref="#"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
                <Link href={`/products/${product.id}`} className="block relative h-48 w-full bg-slate-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShoppingBag className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {product.category?.name || 'Umum'}
                  </span>
                </Link>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${product.id}`} className="font-bold text-on-surface hover:text-primary-600 block mb-1">
                      {truncate(product.name, 40)}
                    </Link>
                    <p className="text-primary-600 font-bold text-lg mb-2">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="h-5 w-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {product.seller?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{product.seller?.name}</span>
                    </div>
                    
                    <Link 
                      href={`/products/${product.id}`}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </main>

      {/* Floating Chat Button */}
      <Link 
        href="/chat"
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>
    </div>
  );
}

