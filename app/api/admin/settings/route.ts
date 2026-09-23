import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPublicSmtpConfiguration, saveSmtpConfiguration } from '@/lib/smtp-settings';
import { sendSmtpTest } from '@/lib/email';

const allowed = new Set(['brand', 'site.settings', 'seo.defaults', 'contact']);

export async function GET(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const key = new URL(request.url).searchParams.get('key') || 'brand';
  if (key === 'email.smtp') {
    try { return NextResponse.json(await getPublicSmtpConfiguration()); }
    catch { return NextResponse.json({ error: 'Não foi possível carregar a configuração de SMTP.' }, { status: 500 }); }
  }
  if (!allowed.has(key)) return NextResponse.json({ error: 'Chave inválida.' }, { status: 400 });
  try { const row = await prisma.setting.findUnique({ where: { key } }); return NextResponse.json(row?.value ?? {}); }
  catch { return NextResponse.json({ error: 'Não foi possível carregar.' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.key === 'email.smtp') {
    const value = body.value;
    if (!value || typeof value !== 'object' || typeof value.host !== 'string' || !value.host.trim() || typeof value.user !== 'string' || !value.user.trim() || typeof value.from !== 'string' || !/^\S+@\S+\.\S+$/.test(value.from) || !Number.isInteger(value.port) || value.port < 1 || value.port > 65535 || typeof value.secure !== 'boolean' || (value.password !== undefined && typeof value.password !== 'string')) return NextResponse.json({ error: 'Parâmetros SMTP inválidos.' }, { status: 400 });
    try {
      await saveSmtpConfiguration({ host: value.host.trim(), port: value.port, user: value.user.trim(), from: value.from.trim(), secure: value.secure, password: value.password || undefined });
      return NextResponse.json(await getPublicSmtpConfiguration());
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível salvar a configuração SMTP.' }, { status: 500 }); }
  }
  const key = body?.key;
  if (!allowed.has(key) || !body?.value || typeof body.value !== 'object') return NextResponse.json({ error: 'Configuração inválida.' }, { status: 400 });
  const value = Object.fromEntries(Object.entries(body.value).filter(([k, v]) => typeof k === 'string' && (typeof v === 'string' || typeof v === 'boolean')).map(([k, v]) => { const text = String(v); const limit = k === 'logoLight' || k === 'logoDark' ? 4_000_000 : 1000; return [k, text.slice(0, limit)]; }));
  try { const row = await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } }); return NextResponse.json(row.value); }
  catch { return NextResponse.json({ error: 'Não foi possível salvar.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.action !== 'test-email' || typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)) return NextResponse.json({ error: 'Informe um e-mail válido para teste.' }, { status: 400 });
  try { await sendSmtpTest(body.email); return NextResponse.json({ message: 'E-mail de teste enviado.' }); }
  catch (error) {
    console.error('[admin/settings] falha ao enviar e-mail de teste', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Não foi possível enviar o e-mail de teste. Verifique a configuração SMTP.' }, { status: 503 });
  }
}
