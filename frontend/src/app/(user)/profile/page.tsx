'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/layout/Header';
import { Camera, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, getProfile } = useAuthStore();
  
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profil berhasil diperbarui');
      await getProfile(); // Refresh profile in store
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold text-on-surface">Profil Saya</h1>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-on-surface mt-4">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            
            <span className="mt-2 inline-block text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full">
              {user?.role === 'admin' ? 'Admin' : 'Pembeli & Penjual'}
            </span>
            
            <p className="text-xs text-slate-400 mt-2">
              Bergabung sejak {user?.created_at ? formatDate(user.created_at) : '-'}
            </p>
          </div>


          {/* Edit Profile Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">Informasi Dasar</h3>
            
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 w-full rounded-lg border-slate-200 bg-surface text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>


        </div>
      </main>
    </div>
  );
}

