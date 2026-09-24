import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCatalogProduct } from '@/lib/catalog';
import CheckoutForm from './form';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: { produto?: string; placa?: string } }) {
  const user = await getCurrentUser();
  const product = searchParams.produto ? await getCatalogProduct(searchParams.produto) : null;
  if (!product) redirect('/consultas');
  if (!user || user.role !== 'CUSTOMER') redirect(`/login?next=${encodeURIComponent(`/checkout?produto=${product.slug}&placa=${searchParams.placa || ''}`)}`);
  return <CheckoutForm product={product} plate={searchParams.placa || ''} />;
}
