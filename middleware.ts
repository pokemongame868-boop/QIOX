// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ── Route protection rules ────────────────────────────────
const PROTECTED_ROUTES = ['/profile', '/cart', '/dashboard'];
const SELLER_ROUTES    = ['/dashboard/seller'];
const ADMIN_ROUTES     = ['/dashboard/admin'];
const AUTH_ROUTES      = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build Supabase client that can read/write cookies
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // ── Auth routes: redirect logged-in users home ──────────
  if (AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (user) return NextResponse.redirect(new URL('/', request.url));
    return response;
  }

  // ── Protected routes: require login ────────────────────
  const needsAuth = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  if (needsAuth && !user) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ── Role-based routes ───────────────────────────────────
  if (user && (SELLER_ROUTES.some(r => pathname.startsWith(r)) ||
               ADMIN_ROUTES.some(r => pathname.startsWith(r)))) {

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? user.user_metadata?.role ?? 'buyer';

    // Seller routes need seller or admin
    if (SELLER_ROUTES.some(r => pathname.startsWith(r)) &&
        !['seller', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/?error=no-access', request.url));
    }

    // Admin routes need admin
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=no-access', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
