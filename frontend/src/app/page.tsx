'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Store, MessageCircle, Shield, UserPlus, Search, Handshake, CheckCircle, ArrowRight, Menu, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Testimonials data ─── */
const testimonials = [
  { name: 'Siti Rahayu', role: 'Penjual Sayur, Desa Sumber Makmur', avatar: '🧕', text: 'Sejak pakai DesaMart, omzet sayuran saya naik 3x lipat! Mudah dipakai dan pembeli dari luar desa pun bisa beli langsung.', stars: 5 },
  { name: 'Budi Santoso', role: 'Pembeli, Kecamatan Jati', avatar: '👨‍🌾', text: 'Belanja produk desa jadi gampang banget. Pengirimannya cepat dan harga jauh lebih murah dari supermarket.', stars: 5 },
  { name: 'Dewi Lestari', role: 'Pengrajin Batik, Desa Cikaret', avatar: '👩‍🎨', text: 'Produk batik saya kini bisa dijangkau pembeli dari seluruh Indonesia. Luar biasa!', stars: 5 },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Warga Desa';

  /* scroll progress */
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      const total = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* typing effect */
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  /* testimonial auto-rotate */
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prevTestimonial = () => setTestimonialIdx(p => (p - 1 + testimonials.length) % testimonials.length);
  const nextTestimonial = () => setTestimonialIdx(p => (p + 1) % testimonials.length);

  /* section refs */
  const hero = useInView(0.1);
  const stats = useInView(0.2);
  const features = useInView(0.1);
  const howItWorks = useInView(0.1);
  const testi = useInView(0.1);

  const G = '#1B5E20';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fff9ec', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 z-[100] h-1 transition-all duration-100" style={{ width: `${scrollProgress}%`, backgroundColor: G }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b bg-white transition-shadow duration-300"
        style={{ borderColor: 'rgba(93,64,55,0.1)', boxShadow: scrollY > 10 ? '0 4px 20px -4px rgba(93,64,55,0.15)' : 'none' }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight" style={{ color: G }}>
            <Leaf className="h-6 w-6" />
            <span>DesaMart</span>
            <img src="/UNIVERSITASTEKNOKRAT.png" alt="Universitas Teknokrat" style={{ height: '32px', width: 'auto', objectFit: 'contain', marginLeft: '4px' }} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="font-bold border-b-2 pb-1" style={{ color: G, borderColor: G }}>Beranda</a>
            <Link href="/products" className="text-stone-600 hover:text-green-800 transition-colors">Marketplace</Link>
            <a href="#tentang" className="text-stone-600 hover:text-green-800 transition-colors">Tentang</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 rounded-xl border font-semibold text-sm transition-all duration-200 hover:bg-green-50 active:scale-95" style={{ borderColor: G, color: G }}>
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 shadow-md hover:opacity-90" style={{ backgroundColor: G }}>
              Daftar
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" style={{ color: G }} onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t`}
          style={{ maxHeight: mobileOpen ? '300px' : '0', borderColor: 'rgba(93,64,55,0.1)' }}>
          <div className="px-6 py-4 flex flex-col gap-4 text-sm font-medium">
            <a href="#" style={{ color: G }} className="font-bold">Beranda</a>
            <Link href="/products" className="text-stone-600" onClick={() => setMobileOpen(false)}>Marketplace</Link>
            <a href="#tentang" className="text-stone-600" onClick={() => setMobileOpen(false)}>Tentang</a>
            <hr style={{ borderColor: 'rgba(93,64,55,0.1)' }} />
            <Link href="/login" className="text-center py-2 rounded-xl border font-semibold" style={{ borderColor: G, color: G }} onClick={() => setMobileOpen(false)}>Masuk</Link>
            <Link href="/register" className="text-center py-2 rounded-xl font-semibold text-white" style={{ backgroundColor: G }} onClick={() => setMobileOpen(false)}>Daftar</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: '#fff9ec' }} className="overflow-hidden">
        <div ref={hero.ref} className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 max-w-7xl">
          <div className={`flex-1 space-y-6 transition-all duration-700 ${hero.inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'rgba(27,94,32,0.1)', color: G }}>
              🌿 Pasar Digital Desa
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: '#1e1c12', letterSpacing: '-0.02em' }}>
              Jual Beli Mudah untuk{' '}
              <span style={{ color: G }}>
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg" style={{ color: '#41493e' }}>
              Platform marketplace yang menghubungkan penjual dan pembeli di desa Anda. Satu akun untuk belanja sekaligus berjualan produk lokal berkualitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link href="/register"
                className="group px-8 py-4 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: G }}>
                Mulai Sekarang
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link href="/products" className="font-semibold hover:underline underline-offset-4 decoration-2 py-4 transition-colors" style={{ color: G }}>
                Pelajari Lebih Lanjut →
              </Link>
            </div>
          </div>

          <div className={`flex-1 w-full max-w-md md:max-w-none transition-all duration-700 delay-300 relative ${hero.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute -z-10 w-full h-full rounded-full blur-3xl scale-110" style={{ backgroundColor: 'rgba(27,94,32,0.06)' }} />
            {/* Floating animation via keyframes in style tag */}
            <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}} .float-img{animation:float 4s ease-in-out infinite}`}</style>
            <div className="float-img">
              <Image src="/hero-illustration.png" alt="Ilustrasi Toko DesaMart" width={600} height={450}
                className="w-full h-auto rounded-2xl shadow-2xl object-cover" style={{ aspectRatio: '4/3' }} priority />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={stats.ref} className={`py-12 bg-white border-y transition-all duration-700 ${stats.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ borderColor: 'rgba(27,94,32,0.08)' }}>
        <div className="container mx-auto px-6 max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Pengguna Aktif', target: 5200, suffix: '+' },
            { label: 'Produk Terdaftar', target: 1800, suffix: '+' },
            { label: 'Transaksi Selesai', target: 12400, suffix: '+' },
            { label: 'Desa Bergabung', target: 48, suffix: '' },
          ].map((s, i) => (
            <div key={i} className="group cursor-default">
              <div className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: G }}>
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <p className="text-sm font-medium text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KEUNGGULAN ── */}
      <section id="features" className="py-20 bg-white">
        <div ref={features.ref} className={`container mx-auto px-6 max-w-7xl transition-all duration-700 ${features.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: G }}>Keunggulan DesaMart</h2>
            <p style={{ color: '#41493e' }}>Solusi digital untuk memajukan ekonomi desa secara aman dan nyaman.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Store, title: 'Jual & Beli', desc: 'Satu akun untuk berbelanja produk desa sekaligus menjual produk Anda sendiri tanpa repot ganti identitas.', delay: '0ms' },
              { icon: MessageCircle, title: 'Chatbot Cerdas', desc: 'Dapatkan bantuan instan dan laporkan kendala melalui chatbot berbasis AI yang siap melayani 24/7.', delay: '100ms' },
              { icon: Shield, title: 'Aman & Terpercaya', desc: 'Setiap transaksi dipantau oleh admin untuk menjaga keamanan Anda dan memastikan produk sampai tujuan.', delay: '200ms' },
            ].map(({ icon: Icon, title, desc, delay }, i) => (
              <div key={i} className="group bg-white p-8 rounded-2xl border cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{ borderColor: 'rgba(93,64,55,0.1)', boxShadow: '0 4px 20px rgba(93,64,55,0.06)', transitionDelay: delay }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ backgroundColor: 'rgba(27,94,32,0.1)' }}>
                  <Icon className="h-7 w-7" style={{ color: G }} />
                </div>
                <h3 className="font-bold text-xl mb-3 transition-colors duration-200 group-hover:text-green-800" style={{ color: '#1e1c12' }}>{title}</h3>
                <p style={{ color: '#41493e' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#faf3e2' }}>
        <div ref={howItWorks.ref} className={`max-w-7xl mx-auto transition-all duration-700 ${howItWorks.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4" style={{ color: G }}>Cara Kerja DesaMart</h2>
              <p style={{ color: '#41493e' }}>Langkah mudah untuk mulai bertransaksi di dalam ekosistem digital desa kita.</p>
            </div>
            <div className="hidden md:block text-8xl select-none" style={{ color: 'rgba(27,94,32,0.12)' }}>❀</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: UserPlus,     title: '1. Daftar Akun',     desc: 'Registrasi mudah hanya dengan nomor telepon aktif.', offset: false, bg: G,          rot: 'rotate(3deg)' },
              { icon: Search,      title: '2. Jelajahi Produk', desc: 'Temukan berbagai kebutuhan harian dan produk lokal unggulan.', offset: true,  bg: '#77574d',    rot: 'rotate(-3deg)' },
              { icon: Handshake,   title: '3. Beli atau Jual',  desc: 'Lakukan transaksi aman atau mulai pasang iklan produk Anda.', offset: false, bg: G,          rot: 'rotate(6deg)' },
              { icon: CheckCircle, title: '4. Selesai!',        desc: 'Pesanan dikirim atau saldo penjualan masuk ke dompet Anda.', offset: true,  bg: '#185e27',   rot: 'rotate(-6deg)' },
            ].map(({ icon: Icon, title, desc, offset, bg, rot }, i) => (
              <div key={i} className={`flex flex-col items-center text-center group cursor-default ${offset ? 'mt-8 md:mt-12' : ''}`}>
                <div className="w-20 h-20 text-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ease-out shadow-md group-hover:scale-110 group-hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: bg, transform: rot }}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-base mb-2 transition-colors duration-300 group-hover:text-green-800" style={{ color: '#1e1c12' }}>{title}</h3>
                <p className="text-sm transition-colors duration-300 group-hover:text-stone-700" style={{ color: '#41493e' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-20 bg-white">
        <div ref={testi.ref} className={`container mx-auto px-6 max-w-4xl transition-all duration-700 ${testi.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: G }}>Kata Mereka</h2>
            <p style={{ color: '#41493e' }}>Warga desa yang sudah merasakan manfaat DesaMart.</p>
          </div>

          <div className="relative">
            <div className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden" style={{ backgroundColor: '#faf3e2' }}>
              <div className="text-6xl mb-4">{testimonials[testimonialIdx].avatar}</div>
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[testimonialIdx].stars)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" style={{ color: '#f59e0b' }} />
                ))}
              </div>
              <p className="text-lg md:text-xl italic mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: '#41493e' }}>
                &ldquo;{testimonials[testimonialIdx].text}&rdquo;
              </p>
              <p className="font-bold" style={{ color: G }}>{testimonials[testimonialIdx].name}</p>
              <p className="text-sm text-stone-500">{testimonials[testimonialIdx].role}</p>
            </div>

            {/* Controls */}
            <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110" style={{ borderColor: 'rgba(27,94,32,0.2)' }}>
              <ChevronLeft className="h-5 w-5" style={{ color: G }} />
            </button>
            <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110" style={{ borderColor: 'rgba(27,94,32,0.2)' }}>
              <ChevronRight className="h-5 w-5" style={{ color: G }} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === testimonialIdx ? '24px' : '8px', height: '8px', backgroundColor: i === testimonialIdx ? G : 'rgba(27,94,32,0.2)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="relative text-white rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden" style={{ backgroundColor: G }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl -ml-24 -mb-24" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

          <div className="z-10 flex-1">
            <h2 className="text-3xl font-bold mb-6">Siap Memajukan Ekonomi Desa?</h2>
            <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Bergabunglah dengan ribuan warga desa lainnya yang telah merasakan kemudahan berbisnis digital.
            </p>
            <Link href="/register"
              className="group inline-flex items-center gap-2 bg-white font-bold text-lg px-10 py-4 rounded-xl shadow-xl transition-all duration-200 active:scale-95 hover:shadow-2xl hover:-translate-y-0.5"
              style={{ color: G }}>
              Daftar Gratis Sekarang
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="z-10 w-full md:w-1/2">
            <Image src="/cta-vegetables.png" alt="Produk lokal desa" width={500} height={350}
              className="rounded-2xl shadow-lg w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              style={{ border: '4px solid rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="tentang" className="border-t" style={{ backgroundColor: '#F5F5F0', borderColor: 'rgba(93,64,55,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4" style={{ color: G }}>
              <Leaf className="h-5 w-5" /><span>DesaMart</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: '#78716c' }}>
              Menanam Harapan, Menuai Kesejahteraan. Marketplace digital terpercaya untuk pemberdayaan ekonomi desa berkelanjutan.
            </p>
            <div className="flex gap-3">
              {['✉', '☎'].map((icon, i) => (
                <a key={i} href={i === 0 ? 'mailto:bantuan@desamart.id' : 'tel:+6281234567890'}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:text-white hover:scale-110"
                  style={{ backgroundColor: '#e7e5e4', color: '#78716c' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = G; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e7e5e4'; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="md:text-right">
            <nav className="flex flex-wrap md:justify-end gap-x-8 gap-y-3 mb-8 text-sm">
              {[
                { label: 'Beranda', href: '#' },
                { label: 'Marketplace', href: '/products' },
                { label: 'Tentang', href: '#tentang' },
                { label: 'Bantuan', href: '/chat' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="transition-colors hover:text-green-800" style={{ color: '#78716c' }}>{label}</Link>
              ))}
            </nav>
            <p className="text-sm" style={{ color: '#78716c' }}>© 2026 DesaMart. Marketplace Desa Digital.</p>
          </div>
        </div>
        {/* Collaboration note */}
        <div className="border-t" style={{ borderColor: 'rgba(93,64,55,0.1)' }}>
          <p className="text-center text-xs py-3 font-medium" style={{ color: '#a8a29e' }}>
            Program ini dibuat atas kerjasama <span className="font-bold text-[#1B5E20]">Universitas Teknokrat Indonesia (UTI)</span> dan <span className="font-bold text-[#1B5E20]">Mitra</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}

