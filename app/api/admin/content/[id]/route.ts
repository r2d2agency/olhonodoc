import { NextResponse } from 'next/server';
import { ContentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';

const isStatus = (status: unknown): status is ContentStatus =>
  typeof status === 'string' && Object.values(ContentStatus).includes(status as ContentStatus);
const isKind = (kind: unknown): kind is 'article' | 'faq' => kind === 'article' || kind === 'faq';
const isSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const prismaCode = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
const respondToWriteError = (error: unknown, action: string) => {
  console.error(`Admin content ${action} failed`, error);
  if (prismaCode(error) === 'P2025') return NextResponse.json({ error: 'Conteúdo não encontrado.' }, { status: 404 });
  if (prismaCode(error) === 'P2002') return NextResponse.json({ error: 'Já existe conteúdo com esses dados.' }, { status: 409 });
  return NextResponse.json({ error: `Não foi possível ${action === 'delete' ? 'excluir' : 'atualizar'} conteúdo.` }, { status: 500 });
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  if (!isKind(body.kind)) return NextResponse.json({ error: 'Tipo de conteúdo inválido.' }, { status: 400 });
  if (body.status !== undefined && !isStatus(body.status)) return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });

  try {
    if (body.kind === 'faq') {
      const data: { question?: string; answer?: string; sortOrder?: number; status?: ContentStatus } = {};
      if (body.question !== undefined) {
        if (typeof body.question !== 'string' || !body.question.trim() || body.question.trim().length > 300) return NextResponse.json({ error: 'Pergunta inválida.' }, { status: 400 });
        data.question = body.question.trim();
      }
      if (body.answer !== undefined) {
        if (typeof body.answer !== 'string' || !body.answer.trim() || body.answer.trim().length > 5000) return NextResponse.json({ error: 'Resposta inválida.' }, { status: 400 });
        data.answer = body.answer.trim();
      }
      if (body.sortOrder !== undefined) {
        if (!Number.isInteger(body.sortOrder) || (body.sortOrder as number) < 0) return NextResponse.json({ error: 'Ordem inválida.' }, { status: 400 });
        data.sortOrder = body.sortOrder as number;
      }
      if (isStatus(body.status)) data.status = body.status;
      const item = await prisma.faqEntry.update({ where: { id: params.id }, data });
      return NextResponse.json({ data: item });
    }

    const data: { title?: string; slug?: string; content?: string; excerpt?: string; seoTitle?: string; seoDescription?: string; status?: ContentStatus; publishedAt?: Date | null } = {};
    for (const field of ['title', 'slug', 'content', 'excerpt', 'seoTitle', 'seoDescription'] as const) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== 'string') return NextResponse.json({ error: `Campo ${field} inválido.` }, { status: 400 });
      const value = field === 'slug' ? body[field].trim().toLowerCase() : body[field];
      const maxLength = { title: 180, slug: 180, content: 50000, excerpt: 500, seoTitle: 180, seoDescription: 320 }[field];
      if (!value.trim() || value.length > maxLength || (field === 'slug' && !isSlug(value))) return NextResponse.json({ error: `Campo ${field} inválido.` }, { status: 400 });
      data[field] = value;
    }
    if (isStatus(body.status)) {
      data.status = body.status;
      data.publishedAt = body.status === ContentStatus.PUBLISHED ? new Date() : null;
    }
    const article = await prisma.article.update({ where: { id: params.id }, data });
    return NextResponse.json({ data: article });
  } catch (error) { return respondToWriteError(error, 'update'); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await requireSuperadmin(); if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const kind = new URL(request.url).searchParams.get('kind');
  if (!isKind(kind)) return NextResponse.json({ error: 'Tipo de conteúdo inválido.' }, { status: 400 });
  try { if (kind === 'faq') await prisma.faqEntry.delete({ where: { id: params.id } }); else await prisma.article.delete({ where: { id: params.id } }); return NextResponse.json({ ok: true }); }
  catch (error) { return respondToWriteError(error, 'delete'); }
}
