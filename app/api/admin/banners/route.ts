import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const KEY = 'site.banners';
type Banner = { id: string; title: string; subtitle: string; imageUrl: string; href: string; enabled: boolean };

function clean(value: unknown): Banner[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const banners = value.map((item) => ({
    id: typeof item?.id === 'string' && item.id ? item.id.slice(0, 80) : crypto.randomUUID(),
    title: typeof item?.title === 'string' ? item.title.trim().slice(0, 120) : '',
    subtitle: typeof item?.subtitle === 'string' ? item.subtitle.trim().slice(0, 240) : '',
    imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl.trim().slice(0, 3_000_000) : '',
    href: typeof item?.href === 'string' ? item.href.trim().slice(0, 300) : '',
    enabled: item?.enabled !== false,
  }));
  if (banners.some((banner) => !banner.title || !banner.imageUrl || !/^https?:\/\//i.test(banner.imageUrl) && !banner.imageUrl.startsWith('/') && !/^data:image\//i.test(banner.imageUrl))) return null;
  return banners;
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
  const banners = clean(await request.json().catch(() => null));
  if (!banners) return NextResponse.json({ error: 'Banners inválidos.' }, { status: 400 });
  const row = await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: banners }, update: { value: banners } });
  return NextResponse.json(row.value);
}
