import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import type { CompanyResponse } from '@/lib/company-conferi';
import { MODEL_HTML_TEMPLATE } from '@/lib/gold-report-template';
import { getActiveTemplateHtml } from '@/lib/admin/report-templates';

const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (s: Record<string, unknown>, k: string, fb = 'Não informado') => { const v = s[k]; return v === undefined || v === null || v === '' || v === '0' ? fb : String(v); };

function buildData(response: CompanyResponse, plate: string, status: string, message: string) {
  const r = asRecord(response);
  const bin = asRecord(r.bin);
  const est = asRecord(r.estadual);
  const agg = asRecord(r.agregados);
  const sol = asRecord(r.solicitacao);
  const grav = asRecord(r.gravame);
  const leilao = asRecord(r.leilao);
  const sinistro = asRecord(r.sinistro);
  const comercial = asRecord(r.comercializacao);
  const recall = asRecord(r.recall);
  const cv = asRecord(r.comunicacaoVenda);
  const rf = asRecord(r.historicoRouboFurto);
  const parecer = asRecord(r.parecerTecnico);

  const alertas: { icone: string; texto: string; tipo: string }[] = [];
  if (String(sinistro.resposta || '').toUpperCase().includes('SIM')) alertas.push({ icone: 'sinistro', texto: 'Sinistro encontrado!', tipo: 'alerta' });
  const leiloes = asRecord(leilao.leiloes).leilao;
  if (Array.isArray(leiloes) && leiloes.length) alertas.push({ icone: 'leilao', texto: 'Consta oferta em leilão', tipo: 'alerta' });
  if (String(comercial.resposta || '').trim() !== '' && String(comercial.resposta) !== '0') alertas.push({ icone: 'info', texto: 'Consta comercialização por seguradora', tipo: 'atencao' });
  const rfAlert = rf.alertaMensagem;
  if (rfAlert) alertas.push({ icone: 'roubo', texto: String(rfAlert), tipo: 'alerta' });
  const restJud = String(est.restricaoJudicial || '').toUpperCase();
  if (restJud && restJud !== 'NADA CONSTA' && restJud !== '') alertas.push({ icone: 'judicial', texto: 'Restrição judicial!', tipo: 'alerta' });

  const emplacamento: string[][] = [];
  const pushEmp = (label: string, key: string, src: Record<string, unknown> = est) => {
    const v = src[key];
    if (v !== undefined && v !== null && v !== '') emplacamento.push([label, String(v)]);
  };
  pushEmp('Placa', 'placa'); pushEmp('Chassi', 'chassi'); pushEmp('Cor', 'cor');
  pushEmp('Ano fabricação', 'anoFabricacao'); pushEmp('UF Faturado', 'uf_faturado'); pushEmp('Espécie', 'especie');
  pushEmp('Situação Chassi', 'situacao'); pushEmp('Terceiro eixo', 'terceiroEixo'); pushEmp('Número DI', 'numeroDI');
  pushEmp('Grupo modelo veículo', 'grupoModeloVeiculo'); pushEmp('Marca/Modelo', 'modelo'); pushEmp('Tipo de veículo', 'tipoVeiculo');
  pushEmp('Ano modelo', 'anoModelo'); pushEmp('Lotação', 'qtdPassageiros'); pushEmp('Cilindradas', 'cilindradas');
  pushEmp('Combustível', 'combustivel'); pushEmp('Município/UF', 'municipio'); pushEmp('UF de Origem', 'UfDeOrigem' in agg ? 'UfDeOrigem' : 'uf');
  pushEmp('Situação', 'situacao'); pushEmp('Potência', 'potencia'); pushEmp('Procedência', 'procedencia');
  pushEmp('Capacidade carga', 'capacidadeCarga');

  const baseBin: string[][] = Object.entries(bin).map(([k, v]) => [k, v === null || v === undefined || v === '' ? 'Não Informado' : String(v)]);
  const baseEstadual: string[][] = Object.entries(est).map(([k, v]) => [k, v === null || v === undefined || v === '' ? 'Não Informado' : String(v)]);

  const restricoesArr = Array.isArray(est.restricoes) ? est.restricoes : [];
  const restricoes = Object.keys(est)
    .filter(k => k.toLowerCase().includes('restric') || k.toLowerCase().includes('renajud') || k.toLowerCase().includes('renainf'))
    .map(k => ({ rotulo: k, status: String(est[k]).toUpperCase().includes('NADA CONSTA') || String(est[k]).toUpperCase().includes('NAO CONSTA') ? 'ok' : 'alerta', texto: String(est[k]) }));

  const data = {
    consulta: {
      numero: String(sol.codigoConsulta || ''),
      produto: 'CONSULTA PREMIUM OLHO NO DOC',
      realizadaEm: String(sol.dataHora || ''),
      placa: (plate || '').toUpperCase(),
      marcaModelo: `${text(bin, 'marca', text(est, 'marca'))}/${text(bin, 'modelo', text(est, 'modelo'))}`,
      logoUrl: '',
    },
    alertas,
    emplacamento,
    baseBin,
    baseEstadual,
    proprietario: bin.nomeProprietario || est.proprietario ? { atual: String(bin.nomeProprietario || est.proprietario || '') } : undefined,
    debitos: (est.debitoMulta || est.debitoIpva) ? {
      multas: est.debitoMulta ? `Débito de multas: ${est.debitoMulta}` : 'Nada consta',
      nota: '',
    } : undefined,
    gravame: Array.isArray(grav.gravame) ? grav.gravame : (grav.resposta ? [{ descricao: String(grav.resposta) }] : []),
    recall: (recall.Mensagem || recall.Mensagem2) ? `${recall.Mensagem || ''} ${recall.Mensagem2 || ''}`.trim() : undefined,
    restricoes: restricoes.length ? restricoes : undefined,
    comparativo: undefined,
    vendaDireta: { status: r.vendaDireta && asRecord(r.vendaDireta).constaVendaDireta ? 'alerta' : 'ok', texto: String(asRecord(r.vendaDireta).mensagem || 'VENDA DIRETA - NADA CONSTA') },
    eventoCorporativo: { status: r.eventoCorporativo && asRecord(r.eventoCorporativo).constaEventoCorporativo ? 'alerta' : 'ok', texto: String(asRecord(r.eventoCorporativo).mensagem || 'EVENTO CORPORATIVO - NADA CONSTA') },
    parecer: { nivel: String(parecer.cor || 'amarelo') },
    sinistroCortesia: sinistro.resposta ? { status: String(sinistro.resposta).toUpperCase().includes('SIM') ? 'alerta' : 'ok', titulo: String(sinistro.mensagem || ''), descricao: '' } : undefined,
    indicioSinistroCortesia: r.indicioSinistro2 ? { status: String(asRecord(r.indicioSinistro2).mensagem || '').toLowerCase().includes('consta') ? 'alerta' : 'ok' } : undefined,
    comercializacao: comercial.mensagem ? String(comercial.mensagem) : undefined,
    comunicacaoVenda: cv.mensagem ? String(cv.mensagem) : undefined,
    leilao: Array.isArray(leiloes) ? leiloes.map((l: any) => ({
      Cor: l.cor, Lote: l.lote, Marca: l.marca, Patio: l.patio, Placa: l.placa, Chassi: l.chassi, Modelo: l.modelo,
      'ID leilao': l.idLeilao, 'NR motor': l.nr_motor, 'Ano modelo': l.anoModelo, Comitente: l.comitente, Leiloeiro: l.leiloeiro,
      'Qtd eixos': l.qtd_eixos, 'Data leilao': l.dataLeilao, Combustivel: l.combustivel, 'Ano fabricacao': l.anoFabricacao,
      'Categoria do veiculo': l.categoriaDoVeiculo,
    })) : undefined,
    rouboFurto: rf.alertaCodigo ? {
      possuiHistorico: String(rf.alertaCodigo) === '1',
      mensagem: String(rf.alertaMensagem || ''),
      registros: Array.isArray(asRecord(rf.historico).rouboFurto) ? asRecord(rf.historico).rouboFurto : [],
    } : undefined,
    odometro: [],
  };

  return data;
}

export async function goldReportHtml(input: CompanyResponse, plate: string, status: string, message: string) {
  const data = buildData(input, plate, status, message);
  const template = await getActiveTemplateHtml();
  return template.replace('__DATA__', JSON.stringify(data));
}

export async function renderGoldPdf(response: CompanyResponse, plate: string, status: string, message: string) {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await puppeteer.executablePath();
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(await goldReportHtml(response, plate, status, message), { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' } });
    return Buffer.from(pdf);
  } finally { await browser.close(); }
}

export const reportHash = (pdf: Buffer) => crypto.createHash('sha256').digest('hex');