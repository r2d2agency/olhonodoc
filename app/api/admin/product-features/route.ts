import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveStoredFeatures } from '@/lib/product-features';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, slug: true, name: true, shortName: true, features: true, description: true, useCase: true, sortOrder: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ data: products.map(p => ({ ...p, features: Array.isArray(p.features) ? (p.features as string[]) : [] })) });
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items) || items.length > 100) return NextResponse.json({ error: 'Lista inválida.' }, { status: 400 });
  for (const item of items) {
    if (typeof item?.id !== 'string') return NextResponse.json({ error: 'Produto inválido.' }, { status: 400 });
    const features = item.features;
    if (!Array.isArray(features) || features.length > 30 || features.some((f: unknown) => typeof f !== 'string' || f.length > 120)) return NextResponse.json({ error: 'Características inválidas.' }, { status: 400 });
    await prisma.product.update({ where: { id: item.id }, data: { features } });
  }
  const bySlug: Record<string, string[]> = {};
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.id }, select: { slug: true } });
    if (product) bySlug[product.slug] = item.features;
  }
  await saveStoredFeatures(bySlug);
  return NextResponse.json({ ok: true });
}
