import { NextResponse } from 'next/server';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { listTemplates, saveTemplates, MessageTemplate } from '@/lib/admin/templates';

function clean(input: unknown): MessageTemplate[] | null {
  if (!Array.isArray(input) || input.length > 100) return null;
  const templates = input.map((item) => ({
    id: typeof item?.id === 'string' && item.id ? item.id.slice(0, 80) : crypto.randomUUID(),
    name: typeof item?.name === 'string' ? item.name.trim().slice(0, 160) : '',
    channel: item?.channel === 'whatsapp' ? 'whatsapp' as const : 'email' as const,
    subject: typeof item?.subject === 'string' ? item.subject.trim().slice(0, 200) : '',
    body: typeof item?.body === 'string' ? item.body.trim().slice(0, 10000) : '',
    updatedAt: new Date().toISOString(),
  }));
  if (templates.some((template) => !template.name || !template.body)) return null;
  const ids = new Set(templates.map((template) => template.id));
  if (ids.size !== templates.length) return null;
  return templates;
}

export async function GET() { const user = await requireAdmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 }); return NextResponse.json({ data: await listTemplates() }); }

export async function PUT(request: Request) {
  const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const templates = clean(body?.templates ?? body);
  if (!templates) return NextResponse.json({ error: 'Lista de templates inválida. Verifique nome e corpo de cada template.' }, { status: 400 });
  await saveTemplates(templates);
  return NextResponse.json({ data: templates });
}
