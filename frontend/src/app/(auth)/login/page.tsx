'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, Eye, EyeOff, Loader2, Leaf, ShieldCheck, Truck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Berhasil masuk!');
      router.push('/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal masuk. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 min-h-screen w-full flex items-center justify-center p-3 md:p-4 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #e3eedd 0%, #fff9ec 45%, #b2d8d2 100%)',
    }}>
      {/* Dynamic Animated Background Blobs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.08); }
        }
        .animate-blob-1 {
          animation: blob-float-1 12s ease-in-out infinite;
        }
        .animate-blob-2 {
          animation: blob-float-2 15s ease-in-out infinite;
        }
      `}} />

      {/* Floating Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#abf4ac] blur-3xl opacity-30 animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#90d792] blur-3xl opacity-25 animate-blob-2 pointer-events-none"></div>

      {/* Subtle Mountain SVG Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><path d='M10 90 L30 70 L50 90 L70 70 L90 90' stroke='green' fill='none' stroke-width='1.5'/><circle cx='50' cy='30' r='10' stroke='green' fill='none' stroke-width='1.5'/></svg>")`,
        backgroundSize: '150px 150px'
      }}></div>

      {/* Main Login Card - Compact version */}
      <main className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_12px_40px_rgba(93,64,55,0.05)] overflow-hidden border border-slate-100/40 transition-all duration-300 relative z-10 hover:shadow-[0_20px_50px_rgba(93,64,55,0.08)]">
        <div className="px-6 pt-6 pb-4 md:px-8 md:pt-7">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shadow-sm transition-all duration-300 hover:rotate-12 cursor-pointer" style={{ backgroundColor: '#1b5e20' }}>
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-[#1b5e20] tracking-wide">DesaMart</h1>
          </div>

          {/* Header Text */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-on-surface mb-0.5">Selamat Datang Kembali</h2>
            <p className="text-xs text-slate-500">Masuk ke akun DesaMart Anda</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 ml-1" htmlFor="email">Email</label>
              <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'email' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'email' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                  <Mail className={`h-4.5 w-4.5 transition-transform duration-300 ${focusedField === 'email' ? 'scale-110 translate-x-0.5' : ''}`} />
                </div>
                <input
                  className="w-full pl-11 pr-9 bg-transparent border-none rounded-xl py-2.5 text-xs focus:ring-0 text-on-surface placeholder-slate-400 transition-all"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="nama@email.com"
                />
                {/\S+@\S+\.\S+/.test(email) && focusedField !== 'email' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-[10px] text-red-600 mt-0.5 ml-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 ml-1" htmlFor="password">Kata Sandi</label>
              <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'password' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                  <Lock className={`h-4.5 w-4.5 transition-transform duration-300 ${focusedField === 'password' ? 'scale-110 translate-x-0.5' : ''}`} />
                </div>
                <input
                  className="w-full pl-11 pr-10 bg-transparent border-none rounded-xl py-2.5 text-xs focus:ring-0 text-on-surface placeholder-slate-400 transition-all tracking-widest"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-600 mt-0.5 ml-1">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between py-0.5">
              <label className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#1b5e20] focus:ring-[#1b5e20] focus:ring-offset-0 transition-all cursor-pointer"
                  type="checkbox"
                  id="remember"
                />
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Ingat saya</span>
              </label>
              <Link className="text-[11px] font-bold text-[#1b5e20] hover:underline transition-colors" href="/forgot-password">
                Lupa kata sandi?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-2.5 bg-[#185e27] hover:bg-[#155222] text-white text-xs font-bold rounded-xl hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 duration-300"
              type="submit"
              disabled={isLoading}
              style={{ boxShadow: '0 4px 12px rgba(24, 94, 39, 0.15)' }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Masuk'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-150"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2.5 bg-white text-slate-400 font-semibold">atau</span>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center mb-1">
            <p className="text-xs text-slate-500">
              Belum punya akun?{' '}
              <Link className="text-[#1b5e20] font-bold hover:underline decoration-2 underline-offset-4 transition-all" href="/register">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Extra Village Context - Compact height */}
        <div className="bg-[#FAF7F0] px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1b5e20]" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aman &amp; Terpercaya</span>
          </div>
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[#1b5e20]" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kirim ke Desa</span>
          </div>
        </div>
      </main>

      {/* Global Footer Component - Compact */}
      <footer className="absolute bottom-4 left-0 right-0 hidden md:block z-10">
        <div className="text-center w-full max-w-7xl mx-auto space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-500">© 2026 DesaMart. Membangun Ekonomi Desa.</p>
          <p className="text-[9px] text-slate-400">Program ini dibuat atas kerjasama <span className="font-bold text-[#1B5E20]">Universitas Teknokrat Indonesia (UTI)</span> dan <span className="font-bold text-[#1B5E20]">Mitra</span>.</p>
        </div>
      </footer>
    </div>
  );
}

