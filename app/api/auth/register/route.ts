import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, normalizeEmail } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  if (name.length < 2) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.role === 'SUPERADMIN') return NextResponse.json({ error: 'Este e-mail deve entrar pelo acesso administrativo.' }, { status: 409 });
  const user = existing ?? await prisma.user.create({ data: { name, email, passwordHash: null, role: 'CUSTOMER' } });
  if (existing && existing.name !== name) await prisma.user.update({ where: { id: existing.id }, data: { name } });
  await createSession(user.id);
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}