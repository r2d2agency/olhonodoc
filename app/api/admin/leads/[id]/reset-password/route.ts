import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { hashPassword, requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function POST(_request: Request, { params }: { params: { id: string } }) { const current = await requireSuperadmin(); if (!current) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 }); const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } }); if (!target || target.role !== 'CUSTOMER') return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 }); const temporaryPassword = `Olho-${randomBytes(5).toString('base64url')}`; await prisma.user.update({ where: { id: target.id }, data: { passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true } }); await prisma.session.deleteMany({ where: { userId: target.id } }); return NextResponse.json({ data: { temporaryPassword } }); }
