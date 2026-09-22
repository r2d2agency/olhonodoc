import { prisma } from '@/lib/prisma';

export const defaultBrand = { name: 'Olho no Doc', tagline: 'Sua tranquilidade é nosso foco.', logoLight: '/logo-olho-no-doc.png', logoDark: '/logo-olho-no-doc.png', primary: '#061b2f', accent: '#18c887' };
export async function getBrandConfig() {
  try { const row = await prisma.setting.findUnique({ where: { key: 'brand' } }); const value = row?.value && typeof row.value === 'object' ? row.value as Record<string, unknown> : {}; return { ...defaultBrand, ...Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string')) }; } catch { return defaultBrand; }
}
