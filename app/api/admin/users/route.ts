import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, normalizeEmail, requireSuperadmin } from '@/lib/auth';
import { serverError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const currentUser = await requireSuperadmin();
    if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    const user = await prisma.user.upsert({ where: { email }, update: { name: name || undefined, passwordHash: await hashPassword(password), role: 'ADMIN' }, create: { email, name: name || null, role: 'ADMIN', passwordHash: await hashPassword(password) } });
    return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch { return serverError(); }
}

export async function GET() {
  try {
    const currentUser = await requireSuperadmin();
    if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, username: true, email: true, role: true, createdAt: true } });
    return NextResponse.json({ data: users });
  } catch { return serverError(); }
}
