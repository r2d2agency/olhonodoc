import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { submitOrderToCompany } from '@/lib/company-query';

export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
  try { return NextResponse.json({ data: await submitOrderToCompany(body.orderId) }); }
  catch (error) { if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 }); if (error instanceof Error && error.message === 'PRODUCT_NOT_INTEGRATED') return NextResponse.json({ error: 'Produto ainda não está vinculado a uma consulta Company.' }, { status: 409 }); return NextResponse.json({ error: 'Não foi possível enviar a consulta.' }, { status: 502 }); }
}
