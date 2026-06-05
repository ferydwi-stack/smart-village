'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { Search, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ManageProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const response = await api.get('/admin/products', { params: { page, search, limit: 1000 } });
      return response.data;
    }
  });

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/admin/products/${productToDelete}`);
      toast.success('Produk berhasil dihapus');
      setProductToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Kelola Produk</h1>
        <p className="text-sm text-slate-500">Semua produk yang terdaftar di DesaMart</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-lg border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <div className="flex justify-center p-8 bg-white rounded-b-lg border border-t-0 border-slate-100">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-b-lg border border-t-0 border-slate-100 text-slate-500">
          Tidak ada produk ditemukan.
        </div>
      ) : (
        <div className="bg-white rounded-b-lg border border-t-0 border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs uppercase bg-surface text-slate-500">
                <tr>
                  <th className="px-6 py-3">Produk</th>
                  <th className="px-6 py-3">Penjual</th>
                  <th className="px-6 py-3">Harga</th>
                  <th className="px-6 py-3">Stok</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-slate-50 hover:bg-surface/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-slate-400 m-auto" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.category?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.seller?.name}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Produk?"
        message="Apakah Anda yakin ingin menghapus produk ini dari marketplace?"
        confirmLabel="Ya, Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

