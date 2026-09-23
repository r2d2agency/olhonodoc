import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const plate = new URL(request.url).searchParams.get('plate')?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const queries = await prisma.vehicleQuery.findMany({ where: plate ? { normalizedPlate: plate } : undefined, include: { order: { include: { product: { select: { name: true } }, customer: { select: { name: true, email: true } } } } }, orderBy: { queriedAt: 'desc' }, take: 200 });
    return NextResponse.json({ data: queries });
  } catch (error) { console.error('Admin query list failed', error); return NextResponse.json({ error: 'Não foi possível carregar as consultas.' }, { status: 500 }); }
}
