import { Comparison } from '@/components/page-blocks';
import { getCatalogProducts } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default async function ComparisonPage() { return <Comparison products={await getCatalogProducts()}/>; }
