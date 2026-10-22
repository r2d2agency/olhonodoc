import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { reconcilePendingPayments } from '@/lib/payment-reconciliation';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Dispara a reconciliação de pagamentos pendentes com o provedor.
 * Pode ser chamada pelo painel ou por um agendador externo (cron da hospedagem).
 */
export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  try {
    const body = await request.json().catch(() => ({}));
    const limit = typeof body?.limit === 'number' ? body.limit : undefined;
    const result = await reconcilePendingPayments({ limit });
    void logger.info('admin.payments.reconciled', { ...result, userId: user.id });
    return NextResponse.json({ data: result });
  } catch (error) {
    void logger.error('admin.payments.reconcile_failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível reconciliar os pagamentos.' }, { status: 500 });
  }
}
