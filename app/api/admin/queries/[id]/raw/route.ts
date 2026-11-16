import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const q = await prisma.vehicleQuery.findUnique({ where: { id: params.id }, select: { report: true } });
  if (!q) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  return new NextResponse(JSON.stringify(q.report, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
