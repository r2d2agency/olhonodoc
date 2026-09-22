import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/page-blocks';
import { getCatalogProduct, getCatalogProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export default async function ProductPage({ params }: { params: { slug: string } }) { const product = await getCatalogProduct(params.slug); if (!product) notFound(); return <ProductDetail product={product}/>; }
export async function generateStaticParams() { return (await getCatalogProducts()).map((product) => ({ slug: product.slug })); }
