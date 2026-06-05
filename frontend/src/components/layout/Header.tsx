'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Leaf, Bell, Menu, X, User, ShoppingBag, Store, LogOut, Shield, Package, PlusCircle, Inbox, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <Leaf className="h-6 w-6" />
          <span>DesaMart</span>
          <img src="/UNIVERSITASTEKNOKRAT.png" alt="Universitas Teknokrat" className="h-8 w-auto ml-1 object-contain" />
        </Link>



        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-slate-600 hover:text-primary-600 font-medium">
                Masuk
              </Link>
              <Link href="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Daftar
              </Link>
            </>
          ) : (
            <>
              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-surface rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700">{user?.name}</span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-lg py-1">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-surface">
                      <User className="h-4 w-4" /> Profil
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-surface">
                      <ShoppingBag className="h-4 w-4" /> Pesanan Saya
                    </Link>
                    <Link href="/seller/products" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-surface">
                      <Store className="h-4 w-4" /> Toko Saya
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <div className="border-t border-slate-100 my-1"></div>
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-surface font-medium">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-surface rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 bg-black/50 z-50 transition-opacity md:hidden",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={cn(
          "fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-6 flex flex-col gap-6 transform transition-transform",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary-600 flex items-center gap-2">
              <Leaf className="h-5 w-5" /> DesaMart
              <img src="/UNIVERSITASTEKNOKRAT.png" alt="Universitas Teknokrat" className="h-7 w-auto ml-1 object-contain" />
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-600 hover:bg-surface rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

            <nav className="flex flex-col gap-2">
              <Link href="/products" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <Store className="h-4 w-4" /> Marketplace
              </Link>

            
            <div className="border-t border-surface-container my-2"></div>
            
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Masuk
                </Link>
                <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Daftar
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Profil
                </Link>
                <Link href="/orders" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Pesanan Saya
                </Link>
                
                <div className="border-t border-surface-container my-2"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">Toko Saya</span>
                
                <Link href="/seller/products" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Package className="h-4 w-4" /> Produk Saya
                </Link>
                <Link href="/seller/products/new" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <PlusCircle className="h-4 w-4" /> Tambah Produk
                </Link>
                <Link href="/seller/orders" className="text-on-surface hover:text-primary hover:bg-surface px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <Inbox className="h-4 w-4" /> Pesanan Masuk
                </Link>
                
                {isAdmin && (
                  <>
                    <div className="border-t border-surface-container my-2"></div>
                    <Link href="/admin" className="text-primary hover:bg-primary/10 px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  </>
                )}
                
                <div className="border-t border-surface-container my-2"></div>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium text-left flex items-center gap-2 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

