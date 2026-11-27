import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getTestimonials, saveTestimonials, type Testimonial } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  return NextResponse.json({ data: await getTestimonials() });
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items) || items.length > 50) return NextResponse.json({ error: 'Lista inválida.' }, { status: 400 });
  const clean: Testimonial[] = items.map((t: any, i: number) => ({
    id: typeof t?.id === 'string' && t.id ? t.id : `item-${Date.now()}-${i}`,
    type: t?.type === 'video' ? 'video' : 'text',
    name: String(t?.name || '').slice(0, 120),
    text: String(t?.text || '').slice(0, 2000),
    photoUrl: String(t?.photoUrl || '').slice(0, 3_000_000),
    youtubeUrl: String(t?.youtubeUrl || '').slice(0, 500),
    active: Boolean(t?.active),
    sortOrder: Number(t?.sortOrder) || i + 1,
    rating: Math.max(0, Math.min(5, Number(t?.rating ?? 5))),
  }));
  if (clean.some(t => !t.name || (t.type === 'text' && !t.text) || (t.type === 'video' && !t.youtubeUrl))) {
    return NextResponse.json({ error: 'Preencha nome e texto ou link do vídeo.' }, { status: 400 });
  }
  await saveTestimonials(clean);
  return NextResponse.json({ data: clean });
}
