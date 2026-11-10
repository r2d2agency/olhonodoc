import { prisma } from '@/lib/prisma';
import { MODEL_HTML_TEMPLATE } from '@/lib/gold-report-template';
import { HYBRID_HTML_TEMPLATE } from '@/lib/gold-report-template-hibrido';

const LIST_KEY = 'report.templates';
const ACTIVE_KEY = 'report.activeTemplate';

export type ReportTemplate = { id: string; name: string; html: string; updatedAt: string };

export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  { id: 'gold-classic', name: 'Gold Clássico', html: MODEL_HTML_TEMPLATE, updatedAt: new Date().toISOString() },
  { id: 'laudo-hibrido', name: 'Laudo Híbrido', html: HYBRID_HTML_TEMPLATE, updatedAt: new Date().toISOString() },
  { id: 'gold-dark', name: 'Gold Escuro', html: MODEL_HTML_TEMPLATE.replace('--azul:#1e3a8a', '--azul:#0f172a').replace('--azul-claro:#2563eb', '--azul-claro:#1e293b'), updatedAt: new Date().toISOString() },
  { id: 'gold-minimal', name: 'Gold Minimal', html: MODEL_HTML_TEMPLATE.replace('font-size:12px', 'font-size:11px'), updatedAt: new Date().toISOString() },
];

export async function listReportTemplates(): Promise<ReportTemplate[]> {
  const row = await prisma.setting.findUnique({ where: { key: LIST_KEY } });
  const value = row?.value;
  if (Array.isArray(value) && value.length) return value as ReportTemplate[];
  return DEFAULT_TEMPLATES;
}

export async function saveReportTemplates(templates: ReportTemplate[]) {
  await prisma.setting.upsert({ where: { key: LIST_KEY }, create: { key: LIST_KEY, value: templates }, update: { value: templates } });
}

export async function getActiveTemplateId(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: ACTIVE_KEY } });
  return typeof row?.value === 'string' ? row.value : DEFAULT_TEMPLATES[0].id;
}

export async function setActiveTemplateId(id: string) {
  await prisma.setting.upsert({ where: { key: ACTIVE_KEY }, create: { key: ACTIVE_KEY, value: id }, update: { value: id } });
}

export async function getActiveTemplateHtml(): Promise<string> {
  const id = await getActiveTemplateId();
  const templates = await listReportTemplates();
  return templates.find(t => t.id === id)?.html || DEFAULT_TEMPLATES[0].html;
}