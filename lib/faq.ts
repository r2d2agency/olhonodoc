import { prisma } from '@/lib/prisma';

export type FaqItem = { q: string; a: string };

/** FAQ publicado no admin. Ordem: sortOrder crescente, depois mais recentes. */
export async function getPublishedFaqs(): Promise<FaqItem[]> {
  try {
    const entries = await prisma.faqEntry.findMany({
      where: { status: { not: 'ARCHIVED' as any } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return entries.map(e => ({ q: e.question, a: e.answer }));
  } catch {
    return [];
  }
}
