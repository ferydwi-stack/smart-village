'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Nama lengkap wajib diisi';
    else if (formData.name.length < 3) newErrors.name = 'Nama minimal 3 karakter';
    
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    
    if (!formData.phone) newErrors.phone = 'Nomor telepon wajib diisi';
    
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    else if (formData.address.length < 10) newErrors.address = 'Alamat minimal 10 karakter';
    
    if (!formData.password) newErrors.password = 'Kata sandi wajib diisi';
    else if (formData.password.length < 8) newErrors.password = 'Kata sandi minimal 8 karakter';
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Pendaftaran berhasil!');
      router.push('/products');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 33;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 33;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 34;
    return score;
  };

  const getPasswordStrengthLabel = (pwd: string) => {
    const score = getPasswordStrength(pwd);
    if (score <= 33) return 'Lemah';
    if (score <= 66) return 'Sedang';
    return 'Kuat';
  };

  const getPasswordStrengthColor = (pwd: string) => {
    const score = getPasswordStrength(pwd);
    if (score <= 33) return 'bg-red-500';
    if (score <= 66) return 'bg-amber-500';
    return 'bg-green-600';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl max-w-[1000px] w-full flex flex-col md:flex-row overflow-hidden min-h-[600px]">
      {/* Inject Custom Style for Floating Animation & Micro-interactions */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.8deg); }
        }
        @keyframes custom-pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-custom-float {
          animation: custom-float 5s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: custom-pulse-subtle 6s ease-in-out infinite;
        }
        .input-active-glow {
          box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.15);
        }
      `}} />

      {/* Form Left */}
      <div className="flex-1 p-8 md:p-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 transition-all duration-300 hover:translate-x-1" style={{ color: '#1B5E20' }}>Buat Akun Baru</h1>
          <p className="text-sm text-slate-600">Daftar sekarang dan mulai jual beli di marketplace desa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 transition-colors duration-200">Nama Lengkap</label>
            <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'name' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'name' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                <User className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'name' ? 'scale-110 translate-x-0.5' : ''}`} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="pl-12 pr-10 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400"
                placeholder="Masukkan nama lengkap Anda"
              />
              {formData.name.length >= 3 && focusedField !== 'name' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600 animate-pulse">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'email' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'email' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                <Mail className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'email' ? 'scale-110 translate-x-0.5' : ''}`} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="pl-12 pr-10 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400"
                placeholder="contoh@email.com"
              />
              {/\S+@\S+\.\S+/.test(formData.email) && focusedField !== 'email' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>}
          </div>

          {/* Telepon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Telepon</label>
            <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'phone' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                <Phone className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'phone' ? 'scale-110 translate-x-0.5' : ''}`} />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className="pl-12 pr-10 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400"
                placeholder="08123456789"
              />
              {formData.phone.length >= 9 && focusedField !== 'phone' && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Contoh: 08123456789</p>
            {errors.phone && <p className="text-xs text-red-600 mt-1.5">{errors.phone}</p>}
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap</label>
            <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'address' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
              <div className={`absolute top-3.5 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'address' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                <MapPin className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'address' ? 'scale-110 translate-x-0.5' : ''}`} />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                rows={3}
                className="pl-12 pr-10 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400 resize-none"
                placeholder="Masukkan alamat desa Anda"
              />
              {formData.address.length >= 10 && focusedField !== 'address' && (
                <div className="absolute top-3.5 right-4 flex items-center text-green-600">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {errors.address && <p className="text-xs text-red-600 mt-1.5">{errors.address}</p>}
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi</label>
              <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'password' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                  <Lock className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'password' ? 'scale-110 translate-x-0.5' : ''}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-12 pr-10 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400 tracking-widest"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Kekuatan Kata Sandi:</span>
                    <span style={{ color: getPasswordStrength(formData.password) > 66 ? '#1B5E20' : '#D97706' }}>{getPasswordStrengthLabel(formData.password)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor(formData.password)}`} 
                      style={{ width: `${getPasswordStrength(formData.password)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-1.5 tracking-normal">Minimal 8 karakter dengan huruf dan angka</p>
              {errors.password && <p className="text-xs text-red-600 mt-1.5 tracking-normal">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi</label>
              <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'confirmPassword' ? 'border-[#1B5E20] bg-white ring-2 ring-[#1B5E20]/15 shadow-sm' : 'border-transparent bg-[#F4F1EA]'}`}>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-[#1B5E20]' : 'text-slate-400'}`}>
                  <Lock className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'confirmPassword' ? 'scale-110 translate-x-0.5' : ''}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-12 w-full rounded-xl border-none bg-transparent py-3 text-sm focus:ring-0 text-on-surface placeholder-slate-400 tracking-widest"
                  placeholder="••••••••"
                />
                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5 tracking-normal">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 duration-300"
              style={{ backgroundColor: '#185e27', boxShadow: '0 4px 14px rgba(24, 94, 39, 0.2)' }}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Daftar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold hover:underline transition-colors" style={{ color: '#1B5E20' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Illustration Right */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden" style={{ backgroundColor: '#FAF7F0' }}>
        {/* Soft Animated Ambient Background Blobs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#EBE7DC] blur-3xl opacity-80 animate-pulse-subtle"></div>
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#E5E0D3] blur-3xl opacity-70 animate-pulse-subtle" style={{ animationDelay: '2.5s' }}></div>

        {/* Animated Floating Card */}
        <div className="relative w-full max-w-sm aspect-square bg-[#1A1814] rounded-[2.5rem] p-4 flex items-center justify-center mb-10 shadow-2xl overflow-hidden animate-custom-float">
          <img 
            src="/register-illustration.png" 
            alt="Ilustrasi Pasar Desa" 
            className="w-full h-full object-cover rounded-[2rem] hover:scale-105 transition-transform duration-700 cursor-pointer"
          />
        </div>
        
        <div className="text-center space-y-6">
          <p className="text-slate-700 font-medium text-lg">
            Bergabunglah dengan komunitas desa digital kami
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Petani Terverifikasi</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Produk Lokal Segar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



