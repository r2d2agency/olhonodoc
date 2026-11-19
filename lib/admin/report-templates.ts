import { prisma } from '@/lib/prisma';
import { MODEL_HTML_TEMPLATE } from '@/lib/gold-report-template';
import { HYBRID_HTML_TEMPLATE } from '@/lib/gold-report-template-hibrido';

const LIST_KEY = 'report.templates';
const ACTIVE_KEY = 'report.activeTemplate';
/** Versão do layout do template padrão. Incrementar ao alterar MODEL_HTML_TEMPLATE. */
const TEMPLATE_VERSION = '2026-11-18-spec-v5';
const VERSION_KEY = 'report.templateVersion';

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

export async function resetReportTemplates() {
  await prisma.setting.delete({ where: { key: LIST_KEY } }).catch(() => undefined);
  await saveReportTemplates(DEFAULT_TEMPLATES);
  await setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
  await prisma.setting.upsert({ where: { key: VERSION_KEY }, create: { key: VERSION_KEY, value: TEMPLATE_VERSION }, update: { value: TEMPLATE_VERSION } });
  return DEFAULT_TEMPLATES;
}

/** Migra automaticamente os templates padrão salvos no banco quando o layout do código muda. */
async function ensureTemplateVersion() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: VERSION_KEY } });
    if (row?.value === TEMPLATE_VERSION) return;
    const id = await getActiveTemplateId();
    const stored = (await listReportTemplates()).map(t => ({ ...t }));
    const defaultIds = new Set(DEFAULT_TEMPLATES.map(t => t.id));
    let changed = false;
    // Atualiza somente os templates padrão; templates customizados são preservados.
    for (const t of stored) {
      if (defaultIds.has(t.id)) {
        const fresh = DEFAULT_TEMPLATES.find(d => d.id === t.id);
        if (fresh && t.html !== fresh.html) { t.html = fresh.html; changed = true; }
      }
    }
    // Corrige também templates customizados que copiaram o regex quebrado
    for (const t of stored) {
      if (t.html.includes('d{2}') && t.html.includes('$1 s')) { t.html = t.html.replace(/var realizada[^\n]*\n/, ''); changed = true; }
    }
    if (changed) await saveReportTemplates(stored);
    // Se o ativo ainda tiver regex inválida, volta para o padrão corrigido
    const active = stored.find(t => t.id === id);
    if (active && active.html.includes('d{2}/d')) await setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
    await prisma.setting.upsert({ where: { key: VERSION_KEY }, create: { key: VERSION_KEY, value: TEMPLATE_VERSION }, update: { value: TEMPLATE_VERSION } });
  } catch { /* segue com o que estiver salvo */ }
}

export async function getActiveTemplateHtml(): Promise<string> {
  await ensureTemplateVersion();
  const id = await getActiveTemplateId();
  const templates = await listReportTemplates();
  return templates.find(t => t.id === id)?.html || DEFAULT_TEMPLATES[0].html;
}