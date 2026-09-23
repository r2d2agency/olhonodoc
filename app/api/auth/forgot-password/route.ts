import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { hashValue, normalizeEmail } from '@/lib/auth';
import { sendPasswordReset } from '@/lib/email';

const genericResponse = { message: 'Se houver uma conta com esse e-mail, enviaremos instruções para redefinir a senha.' };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, passwordHash: true } });
  if (!user?.email || !user.passwordHash) return NextResponse.json(genericResponse);
  const recent = await prisma.authCode.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } } });
  if (recent >= 3) return NextResponse.json(genericResponse);
  const token = randomBytes(32).toString('hex');
  await prisma.authCode.deleteMany({ where: { userId: user.id, consumedAt: null } });
  await prisma.authCode.create({ data: { userId: user.id, codeHash: `reset:${hashValue(token)}`, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
  try {
    const origin = new URL(request.url).origin;
    await sendPasswordReset(user.email, `${origin}/redefinir-senha?token=${token}`);
  } catch {
    return NextResponse.json(genericResponse);
  }
  return NextResponse.json(genericResponse);
}
