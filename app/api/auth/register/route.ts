import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (name.length < 2) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 });
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) return NextResponse.json({ error: 'Escolha um usuário com 3 a 30 caracteres.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing?.role === 'SUPERADMIN') return NextResponse.json({ error: 'Este e-mail deve entrar pelo acesso administrativo.' }, { status: 409 });
  if (existing) return NextResponse.json({ error: 'Este usuário já está cadastrado.' }, { status: 409 });
  const user = await prisma.user.create({ data: { name, username, email: null, passwordHash: await hashPassword(password), role: 'CUSTOMER' } });
  await createSession(user.id);
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}