import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { hashPassword, requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const current = await requireSuperadmin();
  if (!current) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });

  // O id pode ser o do User ou o do Customer (a lista de leads mostra userId || id).
  let target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } });
  if (!target || target.role !== 'CUSTOMER') {
    const customer = await prisma.customer.findFirst({
      where: { OR: [{ id: params.id }, { userId: params.id }] },
      select: { id: true, userId: true, email: true, name: true, user: { select: { id: true, role: true } } },
    });
    target = customer?.user && customer.user.role === 'CUSTOMER' ? customer.user : null;

    // Cliente sem User vinculado: cria o acesso para permitir login.
    if (customer && !target) {
      try {
        const created = await prisma.user.create({
          data: { name: customer.name, email: customer.email, role: 'CUSTOMER', passwordHash: null },
        });
        await prisma.customer.update({ where: { id: customer.id }, data: { userId: created.id } });
        target = { id: created.id, role: 'CUSTOMER' };
      } catch (error) {
        console.error('[admin reset-password] falha ao criar acesso:', error);
      }
    }
  }

  if (!target || target.role !== 'CUSTOMER') return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });

  const temporaryPassword = `Olho-${randomBytes(5).toString('base64url')}`;
  await prisma.user.update({ where: { id: target.id }, data: { passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true } });
  await prisma.session.deleteMany({ where: { userId: target.id } });
  return NextResponse.json({ data: { temporaryPassword } });
}
