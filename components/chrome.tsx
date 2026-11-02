'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/site';
import SiteFooter from '@/components/site-footer';

export function Chrome() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <>
      <Header />
      <SiteFooter />
    </>
  );
}
