import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const result = await prisma.vehicleQuery.updateMany({
      where: { companyStatus: 'COMPLETED', report: { not: Prisma.JsonNull } },
      data: { reportPdf: { set: null }, reportPdfHash: null, reportPdfGeneratedAt: null },
    });
    return NextResponse.json({ ok: true, cleared: result.count, message: 'PDFs antigos limpos. Serão regerados na próxima solicitação de download.' });
  } catch (error) {
    console.error('Regenerate PDFs failed', error);
    return NextResponse.json({ error: 'Não foi possível limpar os PDFs.' }, { status: 500 });
  }
}