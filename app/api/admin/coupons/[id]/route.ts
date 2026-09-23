import { NextResponse } from 'next/server';
import { CouponStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireSuperadmin();
    const body = await request.json();
    const coupon = await prisma.coupon.update({ where: { id: params.id }, data: {
      description: body.description === undefined ? undefined : String(body.description),
      status: body.status === CouponStatus.ARCHIVED ? CouponStatus.ARCHIVED : body.status === CouponStatus.INACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE,
      startsAt: body.startsAt === undefined ? undefined : body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt === undefined ? undefined : body.endsAt ? new Date(body.endsAt) : null,
    } });
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Admin coupon update failed', error);
    return NextResponse.json({ error: 'Não foi possível atualizar o cupom' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireSuperadmin();
    const existing = await prisma.coupon.findUnique({ where: { id: params.id }, select: { redemptionCount: true } });
    if (!existing) return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    if (existing.redemptionCount > 0) {
      const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { status: CouponStatus.ARCHIVED } });
      return NextResponse.json(coupon);
    }
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin coupon deletion failed', error);
    return NextResponse.json({ error: 'Não foi possível remover o cupom' }, { status: 400 });
  }
}
