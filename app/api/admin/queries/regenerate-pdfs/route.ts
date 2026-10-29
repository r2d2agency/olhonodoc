import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const queries = await prisma.vehicleQuery.findMany({
      where: { companyStatus: 'COMPLETED', report: { not: Prisma.JsonNull } },
      select: { id: true, report: true, normalizedPlate: true, providerMessage: true },
    });

    let regenerated = 0;
    let failed = 0;
    for (const q of queries) {
      try {
        const pdf = Buffer.from(await renderGoldPdf(q.report as unknown as CompanyResponse, q.normalizedPlate, 'COMPLETED', q.providerMessage || ''));
        const hash = reportHash(pdf);
        await prisma.vehicleQuery.update({
          where: { id: q.id },
          data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() },
        });
        regenerated++;
      } catch (err) {
        console.error('Regenerate PDF failed for', q.id, err);
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      cleared: queries.length,
      regenerated,
      failed,
      message: `PDFs regenerados: ${regenerated}/${queries.length}.`,
    });
  } catch (error) {
    console.error('Regenerate PDFs failed', error);
    return NextResponse.json({ error: 'Não foi possível regenerar os PDFs.' }, { status: 500 });
  }
}