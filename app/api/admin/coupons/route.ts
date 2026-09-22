import { NextResponse } from 'next/server';
import { CouponDiscountType, CouponStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';
import { normalizeCouponCode } from '@/lib/coupons';

export async function GET() {
  try {
    await requireSuperadmin();
    const coupons = await prisma.coupon.findMany({ include: { product: { select: { id: true, name: true } }, assignments: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Admin coupon list failed', error);
    return NextResponse.json({ error: 'Não foi possível carregar os cupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperadmin();
    const body = await request.json();
    const coupon = await prisma.coupon.create({ data: {
      code: normalizeCouponCode(String(body.code ?? '')),
      description: body.description ? String(body.description) : null,
      discountType: body.discountType === CouponDiscountType.PERCENTAGE ? CouponDiscountType.PERCENTAGE : CouponDiscountType.FIXED,
      value: Number(body.value), status: body.status === CouponStatus.INACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE,
      startsAt: body.startsAt ? new Date(body.startsAt) : null, endsAt: body.endsAt ? new Date(body.endsAt) : null,
      maxRedemptions: body.maxRedemptions == null ? null : Number(body.maxRedemptions),
      perCustomerLimit: body.perCustomerLimit == null ? null : Number(body.perCustomerLimit),
      minOrderCents: body.minOrderCents == null ? null : Number(body.minOrderCents), maxDiscountCents: body.maxDiscountCents == null ? null : Number(body.maxDiscountCents),
      productId: body.productId || null,
    } });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Admin coupon creation failed', error);
    return NextResponse.json({ error: 'Não foi possível criar o cupom' }, { status: 400 });
  }
}
