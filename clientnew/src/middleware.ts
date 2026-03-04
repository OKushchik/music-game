import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('access_token')?.value;

  if (pathname.startsWith("/login") || pathname === "/") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
