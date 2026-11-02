import { prisma } from '../lib/prisma';
import { renderGoldPdf, reportHash } from '../lib/gold-report';
import { Prisma } from '@prisma/client';
import type { CompanyResponse } from '../lib/company-conferi';

async function main() {
  console.log('Buscando consultas concluídas com report...');
  const queries = await prisma.vehicleQuery.findMany({
    where: { companyStatus: 'COMPLETED', report: { not: Prisma.JsonNull } },
    select: { id: true, report: true, normalizedPlate: true, providerMessage: true },
  });

  console.log(`Encontradas: ${queries.length}`);
  let regenerated = 0;
  let failed = 0;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    try {
      const pdf = Buffer.from(
        await renderGoldPdf(q.report as unknown as CompanyResponse, q.normalizedPlate, 'COMPLETED', q.providerMessage || ''),
      );
      const hash = reportHash(pdf);
      await prisma.vehicleQuery.update({
        where: { id: q.id },
        data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() },
      });
      regenerated++;
      if (regenerated % 10 === 0) {
        console.log(`Progresso: ${regenerated}/${queries.length}...`);
      }
    } catch (err) {
      console.error(`Falha em ${q.id}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`Concluído. Regenerados: ${regenerated}, Falhas: ${failed}`);
}

main()
  .catch((e) => {
    console.error('Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
