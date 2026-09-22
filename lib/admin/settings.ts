import { prisma } from '@/lib/prisma';

export async function getSetting<T>(key: string, fallback: T): Promise<T> { const setting = await prisma.setting.findUnique({ where: { key } }); return setting ? setting.value as T : fallback; }
export async function setSetting(key: string, value: unknown) { return prisma.setting.upsert({ where: { key }, update: { value: value as object }, create: { key, value: value as object } }); }
