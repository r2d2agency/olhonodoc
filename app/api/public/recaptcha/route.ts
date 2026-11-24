import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'recaptcha' } });
    const value = row?.value as { siteKey?: string } | undefined;
    return NextResponse.json({ siteKey: value?.siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '' });
  } catch {
    return NextResponse.json({ siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '' });
  }
}
