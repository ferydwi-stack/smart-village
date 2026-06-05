import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/products') || 
                          pathname.startsWith('/orders') || 
                          pathname.startsWith('/seller') || 
                          pathname.startsWith('/chat') || 
                          pathname.startsWith('/profile');
                          
  // const isAdminRoute = pathname.startsWith('/admin');
  const isAdminRoute = false; // Disabled to prevent refresh issue, relying on client-side check in layout

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      // Redirect to login if no token
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    if (isAdminRoute && role !== 'admin') {
      // Redirect to products if not admin
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  // Redirect authenticated users away from auth pages (Disabled by user request)
  // if (token && (pathname === '/login' || pathname === '/register')) {
  //   return NextResponse.redirect(new URL('/products', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/products/:path*', 
    '/orders/:path*', 
    '/seller/:path*', 
    '/chat/:path*', 
    '/profile/:path*', 
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
