import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function currentCustomer() {
  const user = await getCurrentUser();
  return user && user.role === 'CUSTOMER' && user.email ? user : null;
}

export async function GET() {
  const user = await currentCustomer();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const customer = await prisma.customer.findFirst({ where: { OR: [{ userId: user.id }, { email: user.email! }] } });
  return NextResponse.json({ data: { name: user.name || customer?.name || '', email: user.email, phone: customer?.phone || '', cpf: customer?.cpf || '', postalCode: customer?.postalCode || '', street: customer?.street || '', number: customer?.number || '', complement: customer?.complement || '', neighborhood: customer?.neighborhood || '', city: customer?.city || '', state: customer?.state || '' } });
}

export async function PATCH(request: Request) {
  const user = await currentCustomer();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? normalizeDigits(body.phone) : '';
  if (name.length < 2 || !/^\d{10,13}$/.test(phone)) return NextResponse.json({ error: 'Nome e WhatsApp válidos são obrigatórios.' }, { status: 400 });
  const data = { name, phone, postalCode: typeof body.postalCode === 'string' ? normalizeDigits(body.postalCode) : null, street: typeof body.street === 'string' ? body.street.trim() : null, number: typeof body.number === 'string' ? body.number.trim() : null, complement: typeof body.complement === 'string' ? body.complement.trim() || null : null, neighborhood: typeof body.neighborhood === 'string' ? body.neighborhood.trim() : null, city: typeof body.city === 'string' ? body.city.trim() : null, state: typeof body.state === 'string' ? body.state.trim().toUpperCase() : null };
  const existing = await prisma.customer.findFirst({ where: { OR: [{ userId: user.id }, { email: user.email! }] } });
  const customer = existing ? await prisma.customer.update({ where: { id: existing.id }, data }) : await prisma.customer.create({ data: { email: user.email!, ...data } });
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  return NextResponse.json({ data: { ...data, email: user.email, cpf: customer.cpf || '' } });
}
