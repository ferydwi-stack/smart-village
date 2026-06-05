'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyProducts, useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { formatCurrency } from '@/lib/utils';
import { Package, Search, Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useMyProducts(page, 100);
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const allProducts = data?.data || [];
  const products = search.trim()
    ? allProducts.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;
  const totalPages = data?.totalPages || 1;

  const handleDelete = () => {
    if (!productToDelete) return;
    
    deleteProduct(productToDelete, {
      onSuccess: () => {
        toast.success('Produk berhasil dihapus');
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Gagal menghapus produk');
      },
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    updateProduct(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Produk diatur ke ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}`);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Gagal mengubah status');
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Produk Saya</h1>
              <p className="text-sm text-slate-500">Kelola produk yang Anda jual di DesaMart</p>
            </div>
            
            <Link 
              href="/seller/products/new"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Tambah Produk
            </Link>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-t-lg border-b border-slate-100 flex items-center">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Cari produk Anda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Product List */}
          {isLoading ? (
            <div className="flex justify-center p-8 bg-white rounded-b-lg border border-t-0 border-slate-100">
              <LoadingSpinner />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              illustration={<Package className="h-16 w-16" />}
              title="Belum ada produk"
              subtitle="Mulai jual produk Anda dengan menambahkannya ke DesaMart."
              actionLabel="Tambah Produk Pertama"
              actionHref="/seller/products/new"
            />
          ) : (
            <div className="bg-white rounded-b-lg border border-t-0 border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs uppercase bg-surface text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 md:px-6 py-3">Produk</th>
                      <th scope="col" className="px-3 md:px-6 py-3">Harga</th>
                      <th scope="col" className="px-3 md:px-6 py-3">Stok</th>
                      <th scope="col" className="px-3 md:px-6 py-3 text-center">Status</th>
                      <th scope="col" className="px-3 md:px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product.id} className="border-b border-surface-container hover:bg-surface/50">
                        <td className="px-3 md:px-6 py-4 flex items-center gap-2 md:gap-3">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-slate-400 m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.category?.name}</p>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          {product.stock > 0 ? (
                            <span className="text-green-600 font-medium">{product.stock}</span>
                          ) : (
                            <span className="text-red-600 font-medium">Habis!</span>
                          )}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                              product.status === 'active' ? 'bg-primary-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <Link 
                              href={`/seller/products/${product.id}/edit`}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => setProductToDelete(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
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
        </main>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Produk?"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

