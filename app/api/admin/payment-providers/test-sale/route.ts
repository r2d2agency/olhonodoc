import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPaymentConfiguration, createOfflinePayment } from '@/lib/payment-provider';

export const dynamic = 'force-dynamic';

const POST = async (request: Request) => {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const method = body?.method === 'pix' ? 'pix' : body?.method === 'boleto' ? 'bolbradesco' : body?.method === 'card' ? 'card' : '';
  if (!method) return NextResponse.json({ error: 'Método inválido (pix, boleto ou card).' }, { status: 400 });

  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago' || !config.mercadopago.accessToken) {
    return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 400 });
  }

  const testEmail = user.email || 'teste@olhonodoc.com.br';
  const customer = await prisma.customer.upsert({
    where: { email: testEmail },
    update: {},
    create: { email: testEmail, name: 'Teste Admin', postalCode: '01001000', street: 'Rua Teste', number: '1', neighborhood: 'Centro', city: 'São Paulo', state: 'SP' },
  });

  const product = await prisma.product.findFirst({ where: { status: 'ACTIVE' } });
  if (!product) return NextResponse.json({ error: 'Nenhum produto ativo encontrado.' }, { status: 400 });

  const order = await prisma.order.create({
    data: { plate: 'TEST0000', productId: product.id, customerId: customer.id, amountCents: 1, subtotalCents: 1, discountCents: 0, totalCents: 1, status: 'PENDING' },
  });

  try {
    if (method === 'card') {
      return NextResponse.json({ data: { message: 'Cartão requer tokenização no cliente; use o checkout real.' } });
    }
    const result = await createOfflinePayment(order.id, {
      paymentMethodId: method as 'pix' | 'bolbradesco',
      payerEmail: testEmail,
      payerFirstName: 'Teste',
      payerLastName: 'Admin',
      payerIdentification: { type: 'CPF', number: '11144477735' },
      notificationUrl: `${new URL(request.url).origin}/api/webhooks/mercadopago`,
    });
    return NextResponse.json({ data: { orderId: order.id, status: result.status, qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64, ticketUrl: result.ticketUrl } });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: code || 'Falha ao gerar cobrança.', orderId: order.id }, { status: 502 });
  }
};

export { POST };
