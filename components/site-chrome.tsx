'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/site';
import SiteFooter from '@/components/site-footer';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // A home e a área do cliente têm cabeçalho/rodapé próprios.
  if (pathname === '/' || pathname.startsWith('/minha-conta')) return children;

  return (
    <div className={pathname === '/login' ? 'auth-site-chrome' : undefined}>
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
