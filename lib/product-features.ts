import { prisma } from '@/lib/prisma';

const KEY = 'product.features';

export async function getStoredFeatures(): Promise<Record<string, string[]> | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    if (row?.value && typeof row.value === 'object' && !Array.isArray(row.value)) return row.value as Record<string, string[]>;
  } catch { /* sem config */ }
  return null;
}

export async function saveStoredFeatures(data: Record<string, string[]>) {
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: data }, update: { value: data } });
}
