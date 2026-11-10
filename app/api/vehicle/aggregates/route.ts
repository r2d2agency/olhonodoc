import { NextResponse } from 'next/server';
import { getCompanySettings, requestCompanyDetailed, companyAction } from '@/lib/company-conferi';
import { prisma } from '@/lib/prisma';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const ipHits = new Map<string, { count: number; reset: number }>();

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // dev fallback if not configured
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }).toString(),
    });
    const data = await res.json();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (entry && now < entry.reset) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: 'Muitas consultas. Tente novamente em instantes.' }, { status: 429 });
    }
    entry.count += 1;
  } else {
    ipHits.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
  }

  const body = await request.json().catch(() => null);
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  const token = typeof body?.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Informe uma placa válida.' }, { status: 400 });

  // Only enforce Turnstile if a secret is configured
  if (process.env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(token, ip);
    if (!ok) return NextResponse.json({ error: 'Verificação CAPTCHA falhou.' }, { status: 403 });
  }

  try {
    const config = await getCompanySettings();
    const detailed = await requestCompanyDetailed('conferi-agregados', config.environment, { usuario: config.usuario, senha: config.senha }, { placa: plate });
    const result = companyAction(detailed.data);
    return NextResponse.json({ data: { status: result.status, action: result.action, httpStatus: detailed.httpStatus, durationMs: detailed.durationMs, request: detailed.data.solicitacao || null, aggregates: detailed.data.agregados || null, hashPesquisa: detailed.data.hashPesquisa || null } });
  } catch (error) { console.error('[vehicle-aggregates] failed', error instanceof Error ? error.message : error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível consultar os dados do veículo.' }, { status: 502 }); }
}