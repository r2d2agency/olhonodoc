import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, normalizeEmail, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch { return NextResponse.json({ error: 'Não foi possível entrar agora.' }, { status: 500 }); }
}
