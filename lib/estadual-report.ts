import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { ESTADUAL_HTML_TEMPLATE } from '@/lib/estadual-report-template';

const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const norm = (v: unknown) => String(v ?? '').trim();
const plateWithDash = (v: unknown) => { const p = norm(v).replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); return p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p; };
const NI = 'Não informado';
const fmt = (v: unknown) => norm(v) || NI;
const situacaoFix = (v: unknown) => {
  const s = norm(v).toUpperCase();
  return s === 'CIRCULACAO' ? 'CIRCULAÇÃO' : fmt(v);
};
const isPositive = (v: unknown) => {
  const u = norm(v).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (!u || /^0([.,]0+)?$/.test(u)) return false;
  if (/^(NADA CONSTA|NAO CONSTA|NAO EXISTE|NAO HA|SEM RESTRICAO|SEM REGISTRO|NENHUM REGISTRO|NAO)/.test(u)) return false;
  return true;
};

export function buildEstadualData(input: unknown, plate: string, customerName?: string) {
  const r = asRecord(input);
  const est = asRecord(r.estadual);
  const sol = asRecord(r.solicitacao);

  const campos: [string, string, boolean?][] = [
    ['Placa', plateWithDash(est.placa || plate)],
    ['Situação', situacaoFix(est.situacao)],
    ['Marca/Modelo', `${fmt(est.marca)} / ${fmt(est.modelo)}`],
    ['Tipo de veículo', fmt(est.tipoVeiculo)],
    ['Categoria', fmt(est.categoria)],
    ['Ano fabricação/Ano modelo', `${fmt(est.anoFabricacao)} / ${fmt(est.anoModelo)}`],
    ['Procedência', fmt(est.procedencia)],
    ['Município/UF', `${fmt(est.municipio)} / ${fmt(est.uf)}`],
    ['Chassi', [fmt(est.chassi), norm(est.tipoChassi)].filter(Boolean).join(' ')],
    ['Motor', fmt(est.motor)],
    ['Renavam', fmt(est.renavam)],
    ['Combustível', fmt(est.combustivel)],
    ['Cor', fmt(est.cor)],
    ['Capacidade de passageiros', fmt(est.qtdPassageiros)],
    ['Potência', fmt(est.potencia)],
    ['Cilindradas', fmt(est.cilindradas)],
    ['Espécie', fmt(est.especie)],
    ['Capacidade de carga', fmt(est.capacidadeCarga)],
  ];

  const debitos: [string, string, boolean?][] = [
    ['Multas', `${fmt(est.existeDebitoMulta)}`, isPositive(est.existeDebitoMulta)],
    ['Multas', `R$ ${fmt(est.debitoMulta)}`, isPositive(est.debitoMulta)],
    ['IPVA', 'Consultar Detran / Sefaz', false],
    ['IPVA', 'R$ *', false],
    ['Licenciamento', fmt(est.existeDebitoLicenciamento), isPositive(est.existeDebitoLicenciamento)],
    ['Licenciamento', `R$ ${fmt(est.debitoLicenciamento)}`, isPositive(est.debitoLicenciamento)],
  ];

  const restricoes: [string, string, boolean?][] = [
    ['Roubo e Furto', fmt(est.restricaoFurto), isPositive(est.restricaoFurto)],
    ['Restrição Administrativa', fmt(est.restricaoAdm), isPositive(est.restricaoAdm)],
    ['Restrição Tributária', fmt(est.restrTributaria), isPositive(est.restrTributaria)],
    ['Restrição Judiciária', fmt(est.restricaoJudicial), isPositive(est.restricaoJudicial)],
    ['Restrição Financeira', fmt(est.restricaoFinanceira), isPositive(est.restricaoFinanceira)],
    ['Comunicação de Venda', fmt(est.comunicacaoVendaAtiva), isPositive(est.comunicacaoVendaAtiva)],
    ['Restrição Jurídica', fmt(est.restricoesRenajud), isPositive(est.restricoesRenajud)],
  ];

  const outras = ['restricoes_01', 'restricoes_02', 'restricoes_03', 'restricoes_04', 'restricoes_05', 'outrasRestricoes']
    .map(k => norm(est[k])).filter(v => v && isPositive(v)).map(v => [v.toUpperCase(), ''] as [string, string, boolean?]);

  const selos: string[] = [];
  if (isPositive(est.restricaoJudicial) || isPositive(est.restricoesRenajud)) selos.push('RESTRIÇÃO\nJUDICIAL!');

  return {
    numero: norm(sol.codigoConsulta) || '-',
    cliente: norm(customerName) || '-',
    realizadaEm: norm(sol.dataHora).replace(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}):(\d{2}):\d{2}/, '$1 às $2:$3') || '-',
    placa: plateWithDash(est.placa || plate),
    selos: selos.map(s => s.replace(/\n/g, ' ')),
    campos,
    proprietario: fmt(est.proprietario),
    debitos,
    restricoes,
    outras,
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

export async function estadualReportHtml(input: unknown, plate: string, customerName?: string) {
  const data = buildEstadualData(input, plate, customerName);
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
  return ESTADUAL_HTML_TEMPLATE.replace('__DATA__', JSON.stringify(data));
}

export async function renderEstadualPdf(input: unknown, plate: string, customerName?: string) {
  const html = await estadualReportHtml(input, plate, customerName);
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

export const estadualReportHash = (pdf: Buffer) => crypto.createHash('sha256').update(pdf).digest('hex');
