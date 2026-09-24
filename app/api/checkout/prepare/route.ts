import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const productSlug = typeof body?.productSlug === 'string' ? body.productSlug : '';
  const plate = typeof body?.plate === 'string' ? normalizeDigits(body.plate).toUpperCase() : '';
  const address = body?.address;
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Placa inválida.' }, { status: 400 });
  if (!address || typeof address !== 'object' || !String(address.postalCode || '').replace(/\D/g, '').match(/^\d{8}$/) || !String(address.street || '').trim() || !String(address.number || '').trim() || !String(address.neighborhood || '').trim() || !String(address.city || '').trim() || !/^[A-Z]{2}$/.test(String(address.state || '').toUpperCase())) return NextResponse.json({ error: 'Preencha o endereço completo.' }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { slug: productSlug, status: 'ACTIVE' } });
  if (!product) return NextResponse.json({ error: 'Produto indisponível.' }, { status: 404 });
  const customer = await prisma.customer.upsert({ where: { email: user.email }, update: { name: user.name || undefined, phone: typeof body.phone === 'string' ? normalizeDigits(body.phone) : undefined, postalCode: String(address.postalCode).replace(/\D/g, ''), street: String(address.street).trim(), number: String(address.number).trim(), complement: String(address.complement || '').trim() || null, neighborhood: String(address.neighborhood).trim(), city: String(address.city).trim(), state: String(address.state).toUpperCase() }, create: { email: user.email, name: user.name, postalCode: String(address.postalCode).replace(/\D/g, ''), street: String(address.street).trim(), number: String(address.number).trim(), complement: String(address.complement || '').trim() || null, neighborhood: String(address.neighborhood).trim(), city: String(address.city).trim(), state: String(address.state).toUpperCase() } });
  const existing = await prisma.order.findFirst({ where: { customerId: customer.id, plate, productId: product.id, status: 'PENDING', createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) } }, orderBy: { createdAt: 'desc' } });
  const order = existing || await prisma.order.create({ data: { plate, productId: product.id, customerId: customer.id, amountCents: product.promotionalPriceCents || product.priceCents, subtotalCents: product.priceCents, totalCents: product.promotionalPriceCents || product.priceCents, status: 'PENDING' } });
  return NextResponse.json({ data: { orderId: order.id, status: order.status, product: product.name, amountCents: order.totalCents } }, { status: existing ? 200 : 201 });
}
