import type { Metadata } from 'next';
import './globals.css';
import { Footer, Header } from '@/components/site';

export const metadata: Metadata = { title: { default: 'Olho no Doc | Consulte antes de comprar', template: '%s | Olho no Doc' }, description: 'Consulte informações de veículos antes de fechar negócio. Escolha a consulta ideal para a sua decisão.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><Header/><main>{children}</main><Footer/></body></html>; }