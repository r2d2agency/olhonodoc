import { prisma } from '@/lib/prisma';

const KEY = 'marketing.templates';
export type MessageTemplate = { id: string; name: string; channel: 'email' | 'whatsapp'; subject: string; body: string; updatedAt: string };

export async function listTemplates(): Promise<MessageTemplate[]> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = row?.value;
  return Array.isArray(value) ? value as MessageTemplate[] : [];
}

export async function saveTemplates(templates: MessageTemplate[]) {
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: templates }, update: { value: templates } });
}
