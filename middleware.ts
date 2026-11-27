import { NextResponse, type NextRequest } from 'next/server';
import { SITE_URL } from '@/lib/site-url';

/** Redireciona 301 o domínio antigo (.com.br) para o canônico (.com). */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (host.toLowerCase().includes('olhonodoc.com.br')) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
