import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  if (params.id === currentUser.id) return NextResponse.json({ error: 'Você não pode excluir a própria conta.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Usuário e dados vinculados foram excluídos.' });
}