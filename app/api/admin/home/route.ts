import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireSuperadmin } from '@/lib/auth';
import { getHomeConfig, sanitizeHomePayload } from '@/lib/home-cms';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try { await requireSuperadmin(); return NextResponse.json(await getHomeConfig()); }
  catch (error) { console.error('Home CMS load failed', error); return NextResponse.json({ error: 'Não foi possível carregar a home' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    await requireSuperadmin();
    const payload = sanitizeHomePayload(await request.json());
    await prisma.$transaction(async (tx) => {
      await tx.setting.upsert({ where: { key: 'home.theme' }, create: { key: 'home.theme', value: payload.theme }, update: { value: payload.theme } });
      await tx.homeSection.deleteMany({});
      if (payload.sections.length) await tx.homeSection.createMany({ data: payload.sections.map((section) => ({ type: section.type, name: section.name, sortOrder: section.sortOrder, status: section.visible ? 'ACTIVE' : 'INACTIVE', settings: section.settings as Prisma.InputJsonValue })) });
    });
    return NextResponse.json(await getHomeConfig());
  } catch (error) { console.error('Home CMS save failed', error); return NextResponse.json({ error: 'Não foi possível salvar a home' }, { status: 400 }); }
}
