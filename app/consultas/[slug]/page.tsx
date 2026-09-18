import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/page-blocks';
import { getProduct, products } from '@/data/products';
export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export default function ProductPage({ params }: { params: { slug: string } }) { const product = getProduct(params.slug); if (!product) notFound(); return <ProductDetail product={product}/>; }