import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLoginCode } from '@/lib/email';
import { hashValue, newCode, normalizeEmail } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : undefined;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email }, update: name ? { name } : {}, create: { email, name, passwordHash: null } });
  const code = newCode();
  await prisma.authCode.deleteMany({ where: { userId: user.id, consumedAt: null } });
  await prisma.authCode.create({ data: { userId: user.id, codeHash: hashValue(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  try { await sendLoginCode(email, code); } catch { return NextResponse.json({ error: 'Não foi possível enviar o código agora.' }, { status: 503 }); }
  return NextResponse.json({ message: 'Se o e-mail estiver correto, enviamos um código de acesso.' });
}