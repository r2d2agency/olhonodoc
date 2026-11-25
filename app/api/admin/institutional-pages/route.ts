import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { getInstitutionalPages, saveInstitutionalPages, type InstitutionalPageKey, DEFAULT_PAGES } from '@/lib/institutional-pages';

export const dynamic = 'force-dynamic';
const KEYS: InstitutionalPageKey[] = ['termos', 'privacidade', 'cookies', 'sobre'];

export async function GET() {
  if (!await requireSuperadmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  return NextResponse.json({ data: await getInstitutionalPages() });
}

export async function PUT(request: Request) {
  if (!await requireSuperadmin()) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const value = body?.data ?? body;
  if (!value || typeof value !== 'object') return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const pages = { ...DEFAULT_PAGES };
  for (const key of KEYS) {
    const item = value[key];
    if (!item || typeof item !== 'object') return NextResponse.json({ error: `Página ${key} inválida.` }, { status: 400 });
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const content = typeof item.content === 'string' ? item.content : '';
    if (!title || title.length > 160 || content.length > 100_000) return NextResponse.json({ error: `Título ou conteúdo de ${key} inválido.` }, { status: 400 });
    pages[key] = { title, content };
  }
  await saveInstitutionalPages(pages);
  return NextResponse.json({ data: pages });
}
