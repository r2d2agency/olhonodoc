import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultFooter } from '@/lib/site-footer-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: 'site.footer' } }).catch(() => null);
  const stored = row?.value as Record<string, any> | undefined;
  return NextResponse.json({ ...defaultFooter, ...stored, social: { ...defaultFooter.social, ...(stored?.social || {}) } });
}
