import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-height-screen bg-cream flex flex-col">
      {/* Minimal Header */}
      <header className="py-6 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600 w-fit">
          <Leaf className="h-6 w-6" />
          <span>DesaMart</span>
          <img src="/UNIVERSITASTEKNOKRAT.png" alt="Universitas Teknokrat" className="h-8 w-auto ml-1 object-contain" />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}

