import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('x-olhonodoc-path', request.nextUrl.pathname);
  }
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
