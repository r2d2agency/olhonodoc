import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const KEY = 'site.footer';
const defaults = { description: 'Informação para você decidir melhor antes de comprar um veículo.', copyright: '© 2026 Olho no Doc.', columns: [{ title: 'Consultas', links: [{ label: 'Consulta Premium', href: '/consultas/consulta-premium' }, { label: 'Consulta Essencial', href: '/consultas/consulta-essencial' }] }, { title: 'Institucional', links: [{ label: 'Como funciona', href: '/como-funciona' }, { label: 'Contato', href: '/contato' }] }, { title: 'Conteúdos', links: [{ label: 'Blog', href: '/blog' }, { label: 'Privacidade', href: '/politica-de-privacidade' }] }] };

export async function GET() { const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 }); const row = await prisma.setting.findUnique({ where: { key: KEY } }); return NextResponse.json(row?.value || defaults); }
export async function PUT(request: Request) { const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 }); const value = await request.json().catch(() => null); if (!value || typeof value.description !== 'string' || typeof value.copyright !== 'string' || !Array.isArray(value.columns) || value.columns.length > 6) return NextResponse.json({ error: 'Rodapé inválido.' }, { status: 400 }); const row = await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } }); return NextResponse.json(row.value); }
