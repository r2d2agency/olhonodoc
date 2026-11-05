'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/site';
import SiteFooter from '@/components/site-footer';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') return children;

  return (
    <div className={pathname === '/login' ? 'auth-site-chrome' : undefined}>
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
