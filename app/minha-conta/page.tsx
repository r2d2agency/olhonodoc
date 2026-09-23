import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCatalogProducts } from '@/lib/catalog';
import CustomerPortal from './portal';

export const dynamic = 'force-dynamic';

export default async function MinhaContaPage({ searchParams }: { searchParams: { placa?: string; origem?: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') redirect('/login?next=/minha-conta');
  const products = await getCatalogProducts();
  return <CustomerPortal name={user.name || user.email || 'Cliente'} products={products} initialPlate={searchParams.placa || ''} source={searchParams.origem || ''}/>;
}
