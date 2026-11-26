import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const KEY = 'site.footer';
const defaults = {
  description: 'Informação para você decidir melhor antes de comprar um veículo.',
  copyright: '© 2026 Olho no Doc.',
  social: { instagram: '', facebook: '', youtube: '', linkedin: '', whatsapp: '' },
  columns: [
    { title: 'Consultas', links: [{ label: 'Consulta Premium', href: '/consultas/consulta-premium' }, { label: 'Consulta Essencial', href: '/consultas/consulta-essencial' }, { label: 'Comparar consultas', href: '/comparar-consultas' }] },
    { title: 'Institucional', links: [{ label: 'Como funciona', href: '/como-funciona' }, { label: 'Sobre', href: '/sobre' }, { label: 'FAQ', href: '/faq' }, { label: 'Contato', href: '/contato' }] },
    { title: 'Conteúdos', links: [{ label: 'Blog', href: '/blog' }, { label: 'Exemplo de relatório', href: '/exemplo-relatorio' }, { label: 'Termos de uso', href: '/termos-de-uso' }, { label: 'Privacidade', href: '/politica-de-privacidade' }, { label: 'Reembolso', href: '/politica-de-reembolso' }] },
  ],
};

export async function GET() {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const stored = row?.value as Record<string, any> | undefined;
  return NextResponse.json({ ...defaults, ...stored, social: { ...defaults.social, ...(stored?.social || {}) } });
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const value = await request.json().catch(() => null);
  if (!value || typeof value.description !== 'string' || typeof value.copyright !== 'string' || !Array.isArray(value.columns) || value.columns.length > 6) return NextResponse.json({ error: 'Rodapé inválido.' }, { status: 400 });
  const social = { ...defaults.social };
  if (value.social && typeof value.social === 'object') {
    for (const key of Object.keys(social) as (keyof typeof social)[]) if (typeof value.social[key] === 'string') social[key] = value.social[key].slice(0, 500);
  }
  const payload = { description: value.description, copyright: value.copyright, social, phone: String(value.phone || '').slice(0, 80), email: String(value.email || '').slice(0, 160), floatingWhatsapp: String(value.floatingWhatsapp || '').slice(0, 500), columns: value.columns };
  const row = await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: payload }, update: { value: payload } });
  return NextResponse.json(row.value);
}
