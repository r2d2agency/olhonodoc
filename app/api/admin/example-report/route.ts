import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const KEY = 'site.exampleReport';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = row?.value as { dataUrl?: string; name?: string } | undefined;
  return NextResponse.json({ dataUrl: value?.dataUrl || '', name: value?.name || '' });
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const dataUrl = typeof body?.dataUrl === 'string' && body.dataUrl.startsWith('data:application/pdf;base64,') ? body.dataUrl : '';
  const name = typeof body?.name === 'string' ? body.name.slice(0, 120) : 'relatorio-exemplo.pdf';
  if (!dataUrl || dataUrl.length > 12_000_000) return NextResponse.json({ error: 'Envie um PDF válido de até 8 MB.' }, { status: 400 });
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: { dataUrl, name } }, update: { value: { dataUrl, name } } });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  await prisma.setting.delete({ where: { key: KEY } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
