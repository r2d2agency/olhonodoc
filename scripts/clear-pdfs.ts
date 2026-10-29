import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('Limpando PDFs antigos...');
  const result = await prisma.vehicleQuery.updateMany({
    where: { companyStatus: 'COMPLETED', report: { not: Prisma.JsonNull } },
    data: { reportPdf: { set: null }, reportPdfHash: null, reportPdfGeneratedAt: null },
  });
  console.log(`Limpos: ${result.count} consultas.`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
