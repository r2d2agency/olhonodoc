import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowed = new Set(['brand', 'site.settings', 'seo.defaults', 'contact']);
export async function GET(request: Request) {
  try { await requireSuperadmin(); const key = new URL(request.url).searchParams.get('key') || 'brand'; if (!allowed.has(key)) return NextResponse.json({ error: 'Chave inválida' }, { status: 400 }); const row = await prisma.setting.findUnique({ where: { key } }); return NextResponse.json(row?.value ?? {}); } catch { return NextResponse.json({ error: 'Não foi possível carregar' }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try { await requireSuperadmin(); const body = await request.json(); const key = body.key; if (!allowed.has(key) || !body.value || typeof body.value !== 'object') return NextResponse.json({ error: 'Configuração inválida' }, { status: 400 }); const value = Object.fromEntries(Object.entries(body.value).filter(([k, v]) => typeof k === 'string' && (typeof v === 'string' || typeof v === 'boolean')).map(([k, v]) => [k, String(v).slice(0, 1000)])); const row = await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } }); return NextResponse.json(row.value); } catch { return NextResponse.json({ error: 'Não foi possível salvar' }, { status: 500 }); }
}
