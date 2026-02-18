import { Route } from '@/constants/routes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    Route.HOME,
    Route.LOGIN,
    Route.REGISTER,
    Route.FORGOT_PASSWORD,
    Route.ERROR,
  ];
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicRoute = publicRoutes.includes(pathname as Route);

  // If user is authenticated and tries to access auth pages, redirect to studio
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL(Route.STUDIO, request.url));
  }

  // If user is NOT authenticated and tries to access protected pages
  if (
    !isPublicRoute &&
    !accessToken &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('.')
  ) {
    // If it's the root path, just allow it (landing page is public)
    if (pathname === Route.HOME) return NextResponse.next();

    // Redirect to login
    return NextResponse.redirect(new URL(Route.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
