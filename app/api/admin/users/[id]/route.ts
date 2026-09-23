import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';

const userSelect = { id: true, name: true, email: true, role: true, createdAt: true, notifyNewConsultationOrders: true, notifyConsultationStatusChanges: true, notifySystemAlerts: true } as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const field of ['notifyNewConsultationOrders', 'notifyConsultationStatusChanges', 'notifySystemAlerts'] as const) {
    if (field in body && typeof body[field] !== 'boolean') return NextResponse.json({ error: 'Preferência inválida.' }, { status: 400 });
    if (field in body) data[field] = body[field];
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: 'Nenhuma alteração informada.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } });
  if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) return NextResponse.json({ error: 'Usuário interno não encontrado.' }, { status: 404 });
  const updated = await prisma.user.update({ where: { id: params.id }, data, select: userSelect });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  if (params.id === currentUser.id) return NextResponse.json({ error: 'Você não pode excluir a própria conta.' }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } });
  if (!target || !['ADMIN', 'SUPERADMIN'].includes(target.role)) return NextResponse.json({ error: 'Usuário interno não encontrado.' }, { status: 404 });
  if (target.role === 'SUPERADMIN' && await prisma.user.count({ where: { role: 'SUPERADMIN' } }) <= 1) return NextResponse.json({ error: 'O último SUPERADMIN não pode ser excluído.' }, { status: 400 });
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Usuário excluído.' });
}
