import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { requireAdminAccess, hashPassword, normalizeCpf, normalizeEmail, normalizePhone } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function validPlate(value: string) {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(value) || /^[A-Z]{3}[0-9]{4}$/.test(value);
}

export async function POST(request: Request) {
  const operator = await requireAdminAccess('OPERATIONAL');
  if (!operator) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const phone = typeof body?.phone === 'string' ? normalizePhone(body.phone) : '';
  const cpf = typeof body?.cpf === 'string' ? normalizeCpf(body.cpf) : '';
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  const productSlug = typeof body?.productSlug === 'string' ? body.productSlug : '';
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 300) : '';
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10,13}$/.test(phone) || !/^\d{11}$/.test(cpf) || !validPlate(plate) || !reason) return NextResponse.json({ error: 'Informe cliente, contato, CPF, placa, produto e motivo.' }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { slug: productSlug, status: 'ACTIVE' } });
  if (!product) return NextResponse.json({ error: 'Produto indisponível.' }, { status: 404 });
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const existingCustomer = await prisma.customer.findFirst({ where: { OR: [{ email }, { cpf }] } });
  if (existingCustomer && existingCustomer.email !== email) return NextResponse.json({ error: 'CPF já pertence a outro cliente.' }, { status: 409 });
  const temporaryPassword = `Olho-${randomBytes(8).toString('base64url')}`;
  const result = await prisma.$transaction(async (tx) => {
    const user = existingUser || await tx.user.create({ data: { name, email, passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true, role: 'CUSTOMER' } });
    if (existingUser) await tx.user.update({ where: { id: existingUser.id }, data: { name, passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true } });
    const customer = existingCustomer || await tx.customer.create({ data: { userId: user.id, name, email, phone, cpf } });
    const order = await tx.order.create({ data: { plate, productId: product.id, customerId: customer.id, amountCents: 0, subtotalCents: product.priceCents, discountCents: product.priceCents, totalCents: 0, status: 'PAID', isBonus: true, bonusReason: reason } });
    return { userId: user.id, orderId: order.id };
  });
  return NextResponse.json({ data: { ...result, email, temporaryPassword, message: 'Cliente bonificado criado. Entregue a senha temporária por canal seguro e dispare a consulta pelo admin.' } }, { status: 201 });
}
