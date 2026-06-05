'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Camera, X, Edit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const categories = [
  "Makanan & Minuman", "Pertanian & Perkebunan", "Kerajinan Tangan", 
  "Pakaian & Aksesoris", "Elektronik", "Rumah Tangga", "Jasa", "Lainnya"
];

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(id as string);
  const { mutate: updateProduct, isPending } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category_id: String(product.category_id || ''),
        price: String(product.price || ''),
        stock: String(product.stock || ''),
        description: product.description || '',
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    
    for (const file of fileList) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Format file ${file.name} tidak didukung.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Ukuran file ${file.name} melebihi 2MB.`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (existingImages.length + images.length + validFiles.length > 5) {
      toast.error('Maksimal 5 foto per produk.');
      return;
    }

    setImages([...images, ...validFiles]);
    setPreviews([...previews, ...validPreviews]);
  };

  const removeNewImage = (idx: number) => {
    const newImages = [...images];
    newImages.splice(idx, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[idx]);
    newPreviews.splice(idx, 1);
    setPreviews(newPreviews);
  };

  const removeExistingImage = (idx: number) => {
    const newExisting = [...existingImages];
    newExisting.splice(idx, 1);
    setExistingImages(newExisting);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Nama produk wajib diisi';
    if (!formData.category_id) newErrors.category_id = 'Kategori wajib dipilih';
    if (!formData.price || parseFloat(formData.price) < 100) newErrors.price = 'Harga minimal Rp 100';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Stok tidak boleh negatif';
    if (!formData.description) newErrors.description = 'Deskripsi wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('category_id', formData.category_id);
    submitData.append('price', formData.price);
    submitData.append('stock', formData.stock);
    submitData.append('description', formData.description);
    
    // Append existing images that are kept
    submitData.append('existing_images', JSON.stringify(existingImages));
    
    // Append new images
    images.forEach((image) => {
      submitData.append('images', image);
    });

    updateProduct(
      { id: id as string, data: submitData },
      {
        onSuccess: () => {
          toast.success('Produk berhasil diperbarui!');
          router.push('/seller/products');
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || 'Gagal memperbarui produk';
          toast.error(message);
        },
      }
    );
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 flex justify-center">
          <div className="w-full max-w-2xl bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Edit className="h-6 w-6 text-primary-600" />
              <h1 className="text-xl font-bold text-slate-800">Edit Produk</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Foto Produk</label>
                
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {/* Existing Images */}
                  {existingImages.map((img, idx) => (
                    <div key={`exist-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-white/80 text-red-600 p-0.5 rounded-full hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* New Image Previews */}
                  {previews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-primary-200">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-white/80 text-red-600 p-0.5 rounded-full hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5">Baru</span>
                    </div>
                  ))}
                  
                  {existingImages.length + previews.length < 5 && (
                    <label className="border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors aspect-square">
                      <Camera className="h-6 w-6 text-slate-400" />
                      <span className="text-xs text-slate-500 mt-1">Upload</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Format JPG, PNG, WebP. Maks 2MB per foto. Maks 5 foto.
                </p>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={String(idx + 1)}>{cat}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id}</p>}
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  />
                  {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  />
                  {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  maxLength={2000}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-xs text-red-600">{errors.description}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-slate-400">{formData.description.length}/2000</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  href="/seller/products"
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
