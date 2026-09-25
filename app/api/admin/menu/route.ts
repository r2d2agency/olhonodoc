import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const KEY = 'site.menu';

type MenuItem = { id: string; label: string; href: string; parentId: string | null; enabled: boolean };

function clean(value: unknown): MenuItem[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const items = value.map((item) => ({
    id: typeof item?.id === 'string' && item.id ? item.id.slice(0, 80) : crypto.randomUUID(),
    label: typeof item?.label === 'string' ? item.label.trim().slice(0, 80) : '',
    href: typeof item?.href === 'string' ? item.href.trim().slice(0, 300) : '',
    parentId: typeof item?.parentId === 'string' && item.parentId ? item.parentId.slice(0, 80) : null,
    enabled: item?.enabled !== false,
  }));
  if (items.some((item) => !item.label || !item.href || (!item.href.startsWith('/') && !/^https?:\/\//i.test(item.href)))) return null;
  const ids = new Set(items.map((item) => item.id));
  if (items.some((item) => item.parentId && !ids.has(item.parentId))) return null;
  return items;
}

export async function GET() {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  return NextResponse.json(Array.isArray(row?.value) ? row.value : []);
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const items = clean(await request.json().catch(() => null));
  if (!items) return NextResponse.json({ error: 'Itens de menu inválidos.' }, { status: 400 });
  const row = await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: items }, update: { value: items } });
  return NextResponse.json(row.value);
}
