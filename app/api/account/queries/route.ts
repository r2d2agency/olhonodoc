import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { customer: { email: normalizeEmail(user.email) } }, include: { product: { select: { name: true, slug: true } }, query: { select: { normalizedPlate: true, report: true, companyStatus: true, providerMessage: true, providerStatusText: true, codigoConsulta: true, hashPesquisa: true, requestSentAt: true, responseReceivedAt: true, reportPdfGeneratedAt: true, attempts: true } }, payments: { select: { provider: true, status: true, checkoutUrl: true, method: true, rawResponse: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ data: orders.map((order) => {
    const ticketPayment = [...order.payments].reverse().find((p) => {
      const raw: any = p.rawResponse;
      return raw?.ticket_url || raw?.ticketUrl || raw?.external_resource_url || raw?.point_of_interaction?.transaction_data?.ticket_url || p.checkoutUrl;
    });
    const raw: any = ticketPayment?.rawResponse;
    const ticketUrl = raw?.ticket_url || raw?.ticketUrl || raw?.external_resource_url || raw?.point_of_interaction?.transaction_data?.ticket_url || ticketPayment?.checkoutUrl || '';
    return { id: order.id, plate: order.plate, status: order.status, createdAt: order.createdAt, totalCents: order.totalCents ?? order.amountCents, product: order.product, query: order.query, payments: order.payments.map(p => ({ provider: p.provider, status: p.status, checkoutUrl: p.checkoutUrl, method: p.method })), ticketUrl };
  }) });
}
