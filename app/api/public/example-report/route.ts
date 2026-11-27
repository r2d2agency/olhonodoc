import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: 'site.exampleReport' } }).catch(() => null);
  const value = row?.value as { dataUrl?: string; name?: string } | undefined;
  if (!value?.dataUrl?.startsWith('data:application/pdf;base64,')) {
    return NextResponse.json({ error: 'Exemplo indisponível.' }, { status: 404 });
  }
  const base64 = value.dataUrl.split(',')[1];
  return new NextResponse(Buffer.from(base64, 'base64'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${value.name || 'relatorio-exemplo.pdf'}"`,
      'Cache-Control': 'no-store',
    },
  });
}
