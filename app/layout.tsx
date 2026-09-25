import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/site';
import SiteFooter from '@/components/site-footer';

export const metadata: Metadata = { metadataBase: new URL('https://olhonodoc.com.br'), title: { default: 'Olho no Doc | Consulte antes de comprar', template: '%s | Olho no Doc' }, description: 'Consulte informações veiculares antes de fechar negócio. Escolha o nível de consulta que combina com sua decisão.', alternates: { canonical: '/' }, openGraph: { type: 'website', locale: 'pt_BR', siteName: 'Olho no Doc', title: 'Olho no Doc | Consulte antes de comprar', description: 'Informação veicular organizada para ajudar você a decidir melhor.' } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><Header/><main>{children}</main><SiteFooter/></body></html>; }