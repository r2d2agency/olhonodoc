import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const entries = await prisma.faqEntry.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ data: entries.map(e => ({ q: e.question, a: e.answer })) });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
