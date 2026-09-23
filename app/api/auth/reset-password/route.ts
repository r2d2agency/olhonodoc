import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, hashValue } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!token || password.length < 8) return NextResponse.json({ error: 'Token e senha válida são obrigatórios.' }, { status: 400 });
  const code = await prisma.authCode.findFirst({ where: { codeHash: `reset:${hashValue(token)}`, consumedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!code || !code.user.passwordHash) return NextResponse.json({ error: 'O link expirou ou já foi utilizado.' }, { status: 400 });
  await prisma.$transaction([prisma.user.update({ where: { id: code.userId }, data: { passwordHash: await hashPassword(password) } }), prisma.authCode.update({ where: { id: code.id }, data: { consumedAt: new Date() } }), prisma.session.deleteMany({ where: { userId: code.userId } })]);
  return NextResponse.json({ message: 'Senha redefinida. Você já pode entrar.' });
}
