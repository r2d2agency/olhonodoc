import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { BIN_HTML_TEMPLATE } from '@/lib/bin-report-template';

const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const norm = (v: unknown) => String(v ?? '').trim();
const plateWithDash = (v: unknown) => { const p = norm(v).replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); return p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p; };
/** Regra 1: conteúdo que indica ocorrência. */
const isPositive = (v: unknown): boolean => {
  const s = norm(v); if (!s) return false;
  const u = s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/^0([.,]0+)?$/.test(u)) return false;
  if (/^(NADA CONSTA|NAO CONSTA|NAO EXISTE|NAO HA|SEM RESTRICAO|SEM REGISTRO|NENHUM REGISTRO|NAO POSSUI|NAO)/.test(u)) return false;
  return true;
};

const SITUACAO_FIX: Record<string, string> = { 'EM CIRCULACAO': 'CIRCULAÇÃO', 'CIRCULACAO': 'CIRCULAÇÃO' };

export function buildBinData(input: unknown, plate: string, customerName?: string) {
  const r = asRecord(input);
  const bin = asRecord(r.bin);
  const sol = asRecord(r.solicitacao);
  const sitRaw = norm(bin.situacao);
  const situacao = SITUACAO_FIX[sitRaw.toUpperCase()] || sitRaw;
  const NI = 'Não informado';
  const munUf = `${norm(bin.municipio) || NI} / ${norm(bin.Uf || bin.uf) || NI}`;
  const chassiBase = norm(bin.chassi) || NI;
  const tipoChassi = norm(bin.tipoChassi);
  const chassi = tipoChassi ? `${chassiBase} ${tipoChassi}` : chassiBase;

  const fmt = (v: unknown) => norm(v) || NI;
  const campos: [string, string, boolean?][] = [
    ['Placa', plateWithDash(bin.placa || plate)],
    ['Situação', situacao],
    ['Marca/Modelo', `${fmt(bin.marca)} / ${fmt(bin.modelo)}`],
    ['Tipo de veículo', fmt(bin.tipoVeiculo)],
    ['Montagem', norm(bin.montagem) || 'COMPLETA'],
    ['Ano fabricação/Ano modelo', `${fmt(bin.anoFabricacao)} / ${fmt(bin.anoModelo)}`],
    ['Procedência', fmt(bin.procedencia)],
    ['Município/UF', munUf],
    ['Chassi', chassi],
    ['Motor', fmt(bin.motor)],
    ['Renavam', fmt(bin.renavam)],
    ['Combustível', fmt(bin.combustivel)],
    ['Cor', fmt(bin.cor)],
    ['Capacidade de passageiros', fmt(bin.lotacao)],
    ['Cilindradas', fmt(bin.cilindradas)],
    ['Espécie', fmt(bin.especie)],
    ['Peso bruto (PBT)', fmt(bin.pbt)],
    ['Peso bruto (CMT)', fmt(bin.cmt)],
    ['Potência', fmt(bin.potencia)],
    ['Eixo', fmt(bin.numeroEixos)],
    ['Eixo Traseiro Dif', fmt(bin.numeroEixoTraseiro)],
    ['Eixo auxiliar', fmt(bin.numeroEixoAuxiliar)],
    ['Número da Carroceria', fmt(bin.numCarroceria)],
    ['Número do Câmbio', fmt(bin.caixaCambio)],
  ];

  // Selos: só aparecem quando há ocorrência. Cada um define seu ícone.
  const selos: { icone: 'carro' | 'alerta'; texto: string }[] = [];
  const rf = asRecord(r.historicoRouboFurto);
  const rfCodigo = norm(rf.alertaCodigo);
  const rfAtivo = ['1', 'SIM', 'S', 'TRUE'].includes(rfCodigo.toUpperCase())
    || isPositive(bin.restricao3) || isPositive(bin.ocorrencias) || /roubo|furt/i.test(norm(bin.restricoes));
  if (rfAtivo) selos.push({ icone: 'carro', texto: 'HISTÓRICO DE\nROUBO E/OU\nFURTO!' });
  const restrKeys = ['restricao1', 'restricao2', 'restricao4', 'restricaoRenainf', 'restricaoRenajud']
    .map(k => norm(bin[k])).filter(v => v && isPositive(v) && !/DEFERIDA/i.test(v));
  if (restrKeys.length) selos.push({ icone: 'alerta', texto: 'RESTRIÇÃO\nJUDICIAL!' });

  // Queixa e histórico de roubo/furto.
  const queixaAtiva = rfAtivo;
  const historicoRfAtivo = rfAtivo;

  // Histórico de ocorrências: cards com os dados essenciais de cada BO.
  const rfHist = asRecord(rf.historico);
  const rfRaw = rfHist.rouboFurto;
  const rfArr = Array.isArray(rfRaw) ? rfRaw : [];
  const dateBR = (v: unknown) => {
    const s = norm(v);
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    return s || NI;
  };
  const ocorrencias = rfArr.map((item: unknown) => {
    const o = asRecord(item);
    return {
      ocorrencia: norm(o.ocorrencia) || NI,
      ano: (norm(o.anoBo).match(/\d{4}/) || [])[0] || NI,
      orgaoSeguranca: norm(o.orgaoSeguranca) || NI,
      numeroBo: /nao informado/i.test(norm(o.numeroBo)) ? NI : norm(o.numeroBo) || NI,
      municipioUf: `${norm(o.municipioOcorrencia) || NI} / ${norm(o.Ufocorrencia) || NI}`,
      dataOcorrencia: dateBR(o.dataOcorrencia),
    };
  });

  return {
    numero: norm(sol.codigoConsulta) || '-',
    cliente: norm(customerName) || '-',
    realizadaEm: norm(sol.dataHora).replace(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}):(\d{2}):\d{2}/, '$1 às $2:$3') || '-',
    placa: plateWithDash(bin.placa || plate),
    selos,
    campos,
    restricoes: [norm(bin.restricoes)]
      .filter(v => v && isPositive(v)).join(', ') || 'NADA CONSTA',
    queixaAtiva,
    historicoRfAtivo,
    ocorrencias,
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

export async function binReportHtml(input: unknown, plate: string, customerName?: string) {
  const data = buildBinData(input, plate, customerName);
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
  return BIN_HTML_TEMPLATE.replace('__DATA__', JSON.stringify(data));
}

export async function renderBinPdf(input: unknown, plate: string, customerName?: string) {
  const html = await binReportHtml(input, plate, customerName);
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

export const binReportHash = (pdf: Buffer) => crypto.createHash('sha256').update(pdf).digest('hex');
