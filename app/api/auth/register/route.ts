import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword, normalizeEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (name.length < 2) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
    const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password), role: 'CUSTOMER' } });
    await createSession(user.id);
    return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Não foi possível criar sua conta agora.' }, { status: 500 }); }
}
