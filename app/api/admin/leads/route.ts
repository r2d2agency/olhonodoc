import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 500 });
    const customers = await prisma.customer.findMany({ select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 500 });
    const byEmail = new Map<string, { id: string; name: string | null; email: string | null; createdAt: Date; orders: { id: string; plate: string; status: string; amountCents: number; createdAt: Date; product: { name: string } }[] }>();
    for (const user of users) if (user.email) byEmail.set(user.email.toLowerCase(), { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, orders: [] });
    for (const customer of customers) byEmail.set(customer.email.toLowerCase(), { id: customer.id, name: customer.name, email: customer.email, createdAt: customer.createdAt, orders: [] });
    const orders = await prisma.order.findMany({ include: { customer: { select: { email: true } }, product: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 1000 });
    for (const order of orders) { const lead = order.customer?.email ? byEmail.get(order.customer.email.toLowerCase()) : undefined; if (lead) lead.orders.push({ id: order.id, plate: order.plate, status: order.status, amountCents: order.totalCents ?? order.amountCents, createdAt: order.createdAt, product: order.product }); }
    return NextResponse.json({ data: [...byEmail.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) });
  } catch (error) { console.error('Admin leads failed', error); return NextResponse.json({ error: 'Não foi possível carregar leads.' }, { status: 500 }); }
}
