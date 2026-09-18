import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({ where: { status: 'ACTIVE' }, orderBy: { priceCents: 'desc' } });
  return NextResponse.json({ data: products });
}