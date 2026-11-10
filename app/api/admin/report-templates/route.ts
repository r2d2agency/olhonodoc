import { NextResponse } from 'next/server';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { listReportTemplates, saveReportTemplates, setActiveTemplateId, getActiveTemplateId, ReportTemplate } from '@/lib/admin/report-templates';

function clean(input: unknown): ReportTemplate[] | null {
  if (!Array.isArray(input) || input.length > 50) return null;
  const templates = input.map((item) => ({
    id: typeof item?.id === 'string' && item.id ? item.id.slice(0, 80) : crypto.randomUUID(),
    name: typeof item?.name === 'string' ? item.name.trim().slice(0, 160) : '',
    html: typeof item?.html === 'string' ? item.html.slice(0, 2_000_000) : '',
    updatedAt: new Date().toISOString(),
  }));
  if (templates.some((t) => !t.name || !t.html)) return null;
  const ids = new Set(templates.map((t) => t.id));
  if (ids.size !== templates.length) return null;
  return templates;
}

export async function GET() {
  const user = await requireAdmin(); if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const [templates, activeId] = await Promise.all([listReportTemplates(), getActiveTemplateId()]);
  return NextResponse.json({ data: { templates, activeId } });
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.activeId) { await setActiveTemplateId(String(body.activeId)); return NextResponse.json({ data: { activeId: body.activeId } }); }
  const templates = clean(body?.templates ?? body);
  if (!templates) return NextResponse.json({ error: 'Lista de templates inválida.' }, { status: 400 });
  await saveReportTemplates(templates);
  return NextResponse.json({ data: templates });
}