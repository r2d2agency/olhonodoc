import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';

export async function POST(request: Request) {
  const currentUser = await requireSuperadmin();
  if (!currentUser) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const inviteCode = typeof body?.inviteCode === 'string' ? body.inviteCode : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  if (!process.env.ADMIN_INVITE_CODE || inviteCode !== process.env.ADMIN_INVITE_CODE) return NextResponse.json({ error: 'Código de cadastro administrativo inválido.' }, { status: 400 });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email }, update: { name: name || undefined, role: 'SUPERADMIN' }, create: { email, name: name || null, role: 'SUPERADMIN', passwordHash: null } });
  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}