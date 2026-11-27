import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Consultas veiculares', alternates: { canonical: '/consultas' } };
import { ProductCatalog } from '@/components/page-blocks';
import { getCatalogProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function ConsultasPage() { return <ProductCatalog products={await getCatalogProducts()}/>; }
