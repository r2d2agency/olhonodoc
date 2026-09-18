import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({ where: { slug: params.slug, status: 'ACTIVE' } });
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  return NextResponse.json({ data: product });
}