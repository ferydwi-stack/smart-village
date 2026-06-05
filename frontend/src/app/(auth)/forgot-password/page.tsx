'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email wajib diisi');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      // Simulation: Get the link from response!
      setResetLink(response.data.data.reset_link);
      toast.success('Link reset berhasil dibuat!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memproses permintaan';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
      <div className="mb-6">
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Lupa Kata Sandi</h1>
        <p className="text-sm text-slate-500">
          {isSuccess 
            ? 'Sistem berhasil membuat link reset password untuk Anda.' 
            : 'Masukkan email Anda untuk menerima link reset password (Simulasi).'}
        </p>
      </div>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Buat Link Reset'}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          
          <div className="bg-surface p-4 rounded-lg border border-slate-100 break-all">
            <p className="text-xs text-slate-500 mb-1">Link Reset Password Anda:</p>
            <a 
              href={resetLink} 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
            >
              {resetLink}
            </a>
          </div>

          <p className="text-xs text-slate-400">
            *Karena ini adalah sistem simulasi, silakan klik link di atas untuk langsung menuju halaman ganti password.
          </p>

          <Link 
            href="/login" 
            className="w-full inline-flex justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      )}
    </div>
  );
}

