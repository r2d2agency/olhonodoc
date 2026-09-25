import { NextResponse } from 'next/server';
import { ContentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';

const isContentStatus = (status: unknown): status is ContentStatus =>
  typeof status === 'string' && Object.values(ContentStatus).includes(status as ContentStatus);
const isSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const isContentKind = (kind: string | null): kind is 'article' | 'faq' => kind === 'article' || kind === 'faq';

export async function GET(request: Request) {
  const user = await requireAdmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const kind = new URL(request.url).searchParams.get('kind');
  if (!isContentKind(kind)) return NextResponse.json({ error: 'Tipo de conteúdo inválido.' }, { status: 400 });
  try {
    if (kind === 'faq') return NextResponse.json({ data: await prisma.faqEntry.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }) });
    return NextResponse.json({ data: await prisma.article.findMany({ include: { category: { select: { id: true, name: true, slug: true } } }, orderBy: { updatedAt: 'desc' } }) });
  } catch (error) { console.error('Admin content list failed', error); return NextResponse.json({ error: 'Não foi possível carregar conteúdo.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }

  if (!isContentKind(typeof body.kind === 'string' ? body.kind : null)) return NextResponse.json({ error: 'Tipo de conteúdo inválido.' }, { status: 400 });
  if (body.status !== undefined && !isContentStatus(body.status)) return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });

  try {
    if (body.kind === 'faq') {
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
      if (!question || !answer || question.length > 300 || answer.length > 5000) return NextResponse.json({ error: 'Pergunta e resposta são obrigatórias e devem respeitar os limites de tamanho.' }, { status: 400 });
      if (body.sortOrder !== undefined && (!Number.isInteger(body.sortOrder) || (body.sortOrder as number) < 0)) return NextResponse.json({ error: 'Ordem inválida.' }, { status: 400 });
      const status = isContentStatus(body.status) ? body.status : ContentStatus.DRAFT;
      const item = await prisma.faqEntry.create({ data: { question, answer, status, sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0 } });
      return NextResponse.json({ data: item }, { status: 201 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!title || title.length > 180 || !isSlug(slug) || !content || content.length > 50000) return NextResponse.json({ error: 'Título, slug válido e conteúdo são obrigatórios e devem respeitar os limites de tamanho.' }, { status: 400 });
    if (typeof body.excerpt === 'string' && body.excerpt.length > 500) return NextResponse.json({ error: 'Resumo excede o limite de 500 caracteres.' }, { status: 400 });
    if (typeof body.seoTitle === 'string' && body.seoTitle.length > 180) return NextResponse.json({ error: 'Título SEO excede o limite de 180 caracteres.' }, { status: 400 });
    if (typeof body.seoDescription === 'string' && body.seoDescription.length > 320) return NextResponse.json({ error: 'Descrição SEO excede o limite de 320 caracteres.' }, { status: 400 });
    const status = isContentStatus(body.status) ? body.status : ContentStatus.DRAFT;
    const categoryId = typeof body.categoryId === 'string' && body.categoryId ? body.categoryId : null;
    const article = await prisma.article.create({ data: { title, slug, content, categoryId, excerpt: typeof body.excerpt === 'string' ? body.excerpt : null, status, seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null, seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null, publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null } });
    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    console.error('Admin content create failed', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'Já existe conteúdo com esses dados.' }, { status: 409 });
    return NextResponse.json({ error: 'Não foi possível criar conteúdo.' }, { status: 500 });
  }
}
