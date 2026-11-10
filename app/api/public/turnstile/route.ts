import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'turnstile' } });
    const value = row?.value as { siteKey?: string } | undefined;
    return NextResponse.json({ siteKey: value?.siteKey || '' });
  } catch {
    return NextResponse.json({ siteKey: '' });
  }
}