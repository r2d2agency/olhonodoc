import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashValue, normalizeEmail } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const user = await prisma.user.findUnique({ where: { email } });
  const authCode = user ? await prisma.authCode.findFirst({ where: { userId: user.id, consumedAt: null }, orderBy: { createdAt: 'desc' } }) : null;
  if (!user || !authCode || authCode.expiresAt < new Date() || authCode.attempts >= 5) return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 });
  if (hashValue(code) !== authCode.codeHash) { await prisma.authCode.update({ where: { id: authCode.id }, data: { attempts: { increment: 1 } } }); return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 }); }
  await prisma.authCode.update({ where: { id: authCode.id }, data: { consumedAt: new Date() } });
  await createSession(user.id);
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } });
}