import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { GRAVAME_HTML_TEMPLATE } from '@/lib/gravame-report-template';

const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const norm = (v: unknown) => String(v ?? '').trim();
const plateWithDash = (v: unknown) => { const p = norm(v).replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); return p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p; };
const maskDocument = (v: unknown) => {
  const digits = norm(v).replace(/\D/g, '');
  if (digits.length === 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  if (digits.length === 14) return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/****-**`;
  return digits ? '***' : '';
};
const dateBR = (v: unknown) => {
  const s = norm(v);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : s;
};

export function buildGravameData(input: unknown, plate: string, customerName?: string) {
  const r = asRecord(input);
  const grav = asRecord(r.gravame);
  const sol = asRecord(r.solicitacao);
  const rawRecords = Array.isArray(grav.gravame) ? grav.gravame : Array.isArray(grav.registros) ? grav.registros : [];
  const gravames = rawRecords.map((item: unknown) => {
    const g = asRecord(item);
    // Mascara documento do financiado; número do gravame/contrato vêm da Company quando disponíveis.
    // Ordem espelha o bloco de referência: esquerda e direita lado a lado.
    return [
      ['Placa', plateWithDash(g.placa)],
      ['Chassi', norm(g.chassi)],
      ['Renavam', norm(g.renavam)],
      ['UF', norm(g.uf)],
      ['UF da Placa', '-'],
      ['Nome Financiado', norm(g.nomeFinanciado)],
      ['Nome Agente', norm(g.nomeFinanceira) || '-'],
      ['Data Contrato', norm(g.dataGravame) || '-'],
      ['Data do Gravame', norm(g.dataGravame) || '-'],
      ['Número Gravame', norm(g.numeroGravame) || '-'],
      ['Status Veículo', norm(g.statusVeiculo || g.situacao || '-')],
      ['Descrição de Status', '-'],
    ] as [string, string][];
  });
  return {
    numero: norm(sol.codigoConsulta) || '-',
    cliente: norm(customerName) || '-',
    realizadaEm: norm(sol.dataHora).replace(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}):(\d{2}):\d{2}/, '$1 às $2:$3') || '-',
    placa: plateWithDash(plate || norm(r.placa)),
    consta: gravames.length > 0 || /consta/i.test(norm(grav.resposta)),
    resposta: norm(grav.resposta) || (gravames.length ? 'Veículo constou/consta na base de gravames' : 'Nada consta'),
    gravames,
    hashPesquisa: norm(r.hashPesquisa),
    logoUrl: '',
  };
}

async function resolveLogoDataUrl(): Promise<string> {
  try {
    const { getBrandConfig } = await import('@/lib/brand');
    const brand = await getBrandConfig();
    const logo = norm(brand.logoDark || brand.logoLight);
    if (!logo) return '';
    if (/^data:image\//i.test(logo) || /^https?:\/\//i.test(logo)) return logo;
    if (logo.startsWith('/')) {
      const file = path.join(process.cwd(), 'public', logo.replace(/^\/+/, ''));
      const buf = await fs.readFile(file);
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch { /* segue sem logo */ }
  return '';
}

export async function renderGravamePdf(input: unknown, plate: string, customerName?: string) {
  const data = buildGravameData(input, plate, customerName);
  data.logoUrl = await resolveLogoDataUrl();
  try {
    if (data.hashPesquisa) {
      const baseUrl = norm(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').replace(/\/$/, '');
      if (baseUrl) {
        const url = `${baseUrl}/validar/${encodeURIComponent(data.hashPesquisa)}`;
        (data as any).validationUrl = url;
        (data as any).qrCode = await QRCode.toDataURL(url, { width: 120, margin: 1, errorCorrectionLevel: 'M' });
      }
    }
  } catch { /* QR opcional */ }
  const html = GRAVAME_HTML_TEMPLATE.replace('__DATA__', JSON.stringify(data));
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: typeof executablePath === 'string' ? executablePath : await executablePath });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaType('print');
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => (document.getElementById('relatorio') as HTMLElement)?.children.length > 0, { timeout: 15000 }).catch(() => {});
    await Promise.race([page.evaluate(() => (document as any).fonts?.ready).catch(() => undefined), new Promise(r => setTimeout(r, 2000))]);
    return await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally { await browser.close(); }
}

export const gravameReportHash = (pdf: Buffer) => crypto.createHash('sha256').update(pdf).digest('hex');
