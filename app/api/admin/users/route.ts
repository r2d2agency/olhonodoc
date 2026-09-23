import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, normalizeEmail, requireSuperadmin } from '@/lib/auth';

const userSelect = { id: true, name: true, email: true, role: true, createdAt: true, notifyNewConsultationOrders: true, notifyConsultationStatusChanges: true, notifySystemAlerts: true } as const;

export async function POST(request: Request) {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  if (!name || name.length > 100) return NextResponse.json({ error: 'Informe um nome válido.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing) return NextResponse.json({ error: 'Já existe uma conta com esse e-mail.' }, { status: 409 });
  const user = await prisma.user.create({ data: { email, name, role: 'ADMIN', passwordHash: await hashPassword(password), notifyNewConsultationOrders: body.notifyNewConsultationOrders === true, notifyConsultationStatusChanges: body.notifyConsultationStatusChanges === true, notifySystemAlerts: body.notifySystemAlerts === true }, select: userSelect });
  return NextResponse.json({ data: user }, { status: 201 });
}

export async function GET() {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const users = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }, orderBy: { createdAt: 'desc' }, select: userSelect });
  return NextResponse.json({ data: users });
}
