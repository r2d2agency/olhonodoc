import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { const row = await prisma.setting.findUnique({ where: { key: 'site.footer' } }).catch(() => null); return NextResponse.json(row?.value || null); }
