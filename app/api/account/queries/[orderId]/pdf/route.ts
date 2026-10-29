import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, customer: { userId: user.id } },
    select: { plate: true, query: { select: { id: true, report: true, normalizedPlate: true, companyStatus: true, providerMessage: true } } },
  });
  if (!order) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });

  if (!order.query?.report || order.query.companyStatus !== 'COMPLETED') {
    return NextResponse.json(
      { error: order.query?.companyStatus === 'PROCESSING' ? 'O laudo está sendo processado.' : 'Laudo ainda não disponível.' },
      { status: 409 },
    );
  }

  try {
    const pdf = Buffer.from(await renderGoldPdf(order.query.report as unknown as CompanyResponse, order.query.normalizedPlate, 'COMPLETED', order.query.providerMessage || ''));
    const hash = reportHash(pdf);

    void prisma.vehicleQuery.update({
      where: { id: order.query.id },
      data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() },
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laudo-${order.query.normalizedPlate || order.plate}-${Date.now()}.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Customer PDF: falha ao gerar sob demanda', error);
    return NextResponse.json({ error: 'Não foi possível gerar o PDF.' }, { status: 500 });
  }
}
