import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { const row = await prisma.setting.findUnique({ where: { key: 'seo.scripts' } }).catch(() => null); const value = row?.value as Record<string, unknown> | undefined; return NextResponse.json({ ga4: typeof value?.ga4 === 'string' ? value.ga4 : '', googleAds: typeof value?.googleAds === 'string' ? value.googleAds : '', metaPixel: typeof value?.metaPixel === 'string' ? value.metaPixel : '', enabled: value?.enabled === true, consentRequired: value?.consentRequired !== false }); }
