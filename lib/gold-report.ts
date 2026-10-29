import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import type { CompanyResponse } from '@/lib/company-conferi';

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (source: Record<string, unknown>, key: string, fallback = 'Não informado') => { const value = source[key]; return value === undefined || value === null || value === '' || value === '0' ? fallback : String(value); };
const esc = (input: string) => input.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
const labelize = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const normalizeResponse = (response: CompanyResponse) => { const source = asRecord(response); return (source.response && typeof source.response === 'object' && !Array.isArray(source.response) ? source.response : source) as CompanyResponse; };

const field = (label: string, value: string) => `<div class="data-cell"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;

const scalarFields = (obj: Record<string, unknown>, skip: string[] = []) => Object.entries(obj)
  .filter(([k, v]) => !skip.includes(k) && (typeof v !== 'object' || v === null))
  .map(([k, v]) => field(labelize(k), v === undefined || v === null || v === '' ? 'Não informado' : String(v)));

const renderArrayTable = (arr: unknown[]) => {
  if (!arr.length) return '<p class="summary">Nenhum registro.</p>';
  const first = asRecord(arr[0]);
  const keys = Object.keys(first);
  const header = keys.map(k => `<th>${esc(labelize(k))}</th>`).join('');
  const rows = arr.map(item => {
    const r = asRecord(item);
    return `<tr>${keys.map(k => `<td>${esc(text(r, k, ''))}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="tbl"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
};

const section = (title: string, subtitle: string, body: string) => `<section class="section"><div class="section-title"><h2>${esc(title)}</h2><small>${esc(subtitle)}</small></div>${body}</section>`;

export function goldReportHtml(input: CompanyResponse, plate: string, status: string, message: string) {
  const envelope = asRecord(input);
  const response = normalizeResponse(input);
  const raw = asRecord(response.agregados);
  const request = { ...asRecord(envelope.request), ...asRecord(response.solicitacao) };
  const modules = [
    ['bin', 'Base BIN'], ['csv', 'Base CSV'], ['historicoRouboFurto', 'Roubo e furto'], ['estadual', 'Restrições estaduais'],
    ['decodificador', 'Decodificador'], ['gravame', 'Gravame'], ['sinistro', 'Sinistro'], ['indicioSinistro', 'Indícios de sinistro'],
    ['parecerTecnico', 'Parecer técnico'], ['leilao', 'Leilão'], ['eventoCorporativo', 'Eventos corporativos'], ['vendaDireta', 'Venda direta'],
    ['precificador', 'Precificador'], ['recall', 'Recall'], ['duplicidadeMotor', 'Duplicidade de motor'], ['comunicacaoVenda', 'Comunicação de venda']
  ];
  const moduleCards = modules.map(([key, label]) => { const item = asRecord(response[key]); const detail = text(item, 'mensagem', 'Sem retorno'); const ready = detail !== 'Sistema Indisponível' && detail !== 'Sem retorno'; return `<div class="module ${ready ? 'ready' : 'waiting'}"><span class="module-dot"></span><div><b>${esc(label)}</b><small>${esc(detail)}</small></div><strong>${ready ? 'Disponível' : 'Em processamento'}</strong></div>`; }).join('');
  const alertKeys = new Set(['sinistro', 'indicioSinistro', 'historicoRouboFurto', 'leilao', 'gravame']);
  const alertWords = /sinistro|impedimento|restri|roubo|furto|leil[aã]o|gravame/i;
  const summaryBlocks = modules.map(([key, label]) => {
    const item = asRecord(response[key]);
    const detail = text(item, 'mensagem', 'Sem retorno');
    const ready = detail !== 'Sistema Indisponível' && detail !== 'Sem retorno';
    const hasAlert = alertKeys.has(key) ? ready : (ready && alertWords.test(JSON.stringify(item)));
    return `<div class="summary-block ${hasAlert ? 'alert' : 'ok'}"><span class="summary-dot"></span><div><b>${esc(label)}</b><small>${esc(hasAlert ? 'Atenção: ocorrência identificada' : (ready ? 'Sem ocorrências' : 'Em processamento'))}</small></div><strong>${hasAlert ? 'ALERTA' : (ready ? 'OK' : '—')}</strong></div>`;
  }).join('');
  const restrictions = ['restricao1', 'restricao2', 'restricao3', 'restricao4'].map(key => text(raw, key, '')).filter(Boolean);
  const restrictionHtml = restrictions.length ? restrictions.map(value => `<li><span>✓</span>${esc(value)}</li>`).join('') : '<li><span>—</span>Nenhuma restrição informada</li>';
  const technicalFields = [['Chassi', 'chassi'], ['RENAVAM', 'renavam'], ['Motor', 'motor'], ['Tipo de chassi', 'tipoChassi'], ['Procedência', 'procedencia'], ['Última atualização', 'ultimaAtualizacao']];
  const vehicleFields = [['Marca', 'marca'], ['Modelo', 'modelo'], ['Ano de fabricação', 'anoFabricacao'], ['Ano modelo', 'anoModelo'], ['Cor', 'cor'], ['Combustível', 'combustivel'], ['Tipo de veículo', 'tipoVeiculo'], ['Espécie', 'especie'], ['Carroceria', 'tipoCarroceria'], ['Potência', 'potencia'], ['Lotação', 'lotacao'], ['Segmento', 'segmento']];
  const action = String(request.acao || '');
  const reportStatus = status === 'COMPLETED' || action === '1' ? 'Consulta concluída' : 'Consulta em processamento';

  // Build detailed sections per module
  let detailSections = '';

  // agregados (full)
  const aggScalars = scalarFields(raw, ['mensagem']);
  if (aggScalars.length) detailSections += section('Dados agregados', 'INFORMAÇÕES COMPLEMENTARES DO VEÍCULO', `<div class="data-grid">${aggScalars.join('')}</div>`);

  // bin
  const bin = asRecord(response.bin);
  const binScalars = scalarFields(bin, ['mensagem']);
  if (binScalars.length) detailSections += section('Base BIN', 'DADOS DO BIN', `<div class="data-grid">${binScalars.join('')}</div>`);

  // estadual
  const est = asRecord(response.estadual);
  const estScalars = scalarFields(est, ['mensagem']);
  if (estScalars.length) detailSections += section('Restrições estaduais', 'DADOS ESTADUAIS', `<div class="data-grid">${estScalars.join('')}</div>`);

  // decodificador
  const dec = asRecord(response.decodificador);
  const decScalars = scalarFields(dec, ['mensagem']);
  if (decScalars.length) detailSections += section('Decodificador', 'DECODIFICAÇÃO DO CHASSI', `<div class="data-grid">${decScalars.join('')}</div>`);

  // gravame
  const grav = response.gravame;
  if (Array.isArray(grav)) {
    detailSections += section('Gravame', 'GRAVAMES', renderArrayTable(grav));
  } else {
    const g = asRecord(grav);
    const gScalars = scalarFields(g, ['mensagem']);
    if (gScalars.length) detailSections += section('Gravame', 'GRAVAMES', `<div class="data-grid">${gScalars.join('')}</div>`);
    if (Array.isArray(g.gravame)) detailSections += section('Gravame', 'LISTA DE GRAVAMES', renderArrayTable(g.gravame));
  }

  // sinistro
  const sin = asRecord(response.sinistro);
  const sinScalars = scalarFields(sin, ['mensagem']);
  if (sinScalars.length) detailSections += section('Sinistro', 'SINISTROS', `<div class="data-grid">${sinScalars.join('')}</div>`);
  const sinMsg = text(sin, 'mensagem', '');
  if (sinMsg) detailSections += section('Sinistro', 'MENSAGEM', `<p class="summary">${esc(sinMsg)}</p>`);

  // indicioSinistro
  const ind = asRecord(response.indicioSinistro);
  const indScalars = scalarFields(ind, ['mensagem']);
  if (indScalars.length) detailSections += section('Indícios de sinistro', 'INDÍCIOS', `<div class="data-grid">${indScalars.join('')}</div>`);

  // parecerTecnico
  const pt = asRecord(response.parecerTecnico);
  const ptScalars = scalarFields(pt, ['mensagem']);
  if (ptScalars.length) detailSections += section('Parecer técnico', 'PARECER TÉCNICO', `<div class="data-grid">${ptScalars.join('')}</div>`);

  // leilao
  const leil = response.leilao;
  if (Array.isArray(leil)) {
    detailSections += section('Leilão', 'LEILÕES', renderArrayTable(leil));
  } else {
    const l = asRecord(leil);
    const leiloes = asRecord(l.leiloes);
    if (Array.isArray(leiloes.leilao)) detailSections += section('Leilão', 'LEILÕES', renderArrayTable(leiloes.leilao as unknown[]));
    else if (Array.isArray(l.leilao)) detailSections += section('Leilão', 'LEILÕES', renderArrayTable(l.leilao as unknown[]));
  }

  // historicoRouboFurto
  const hrf = response.historicoRouboFurto;
  const hrfObj = asRecord(hrf);
  const hist = asRecord(hrfObj.historico);
  if (Array.isArray(hist.rouboFurto)) {
    detailSections += section('Roubo e furto', 'HISTÓRICO DE ROUBO/FURTO', renderArrayTable(hist.rouboFurto as unknown[]));
  } else if (Array.isArray(hrf)) {
    detailSections += section('Roubo e furto', 'HISTÓRICO', renderArrayTable(hrf as unknown[]));
  }

  // eventoCorporativo
  const ec = asRecord(response.eventoCorporativo);
  const ecScalars = scalarFields(ec, ['mensagem', 'fotos', 'leilao', 'checklist']);
  if (ecScalars.length) detailSections += section('Eventos corporativos', 'EVENTOS CORPORATIVOS', `<div class="data-grid">${ecScalars.join('')}</div>`);

  // vendaDireta
  const vd = asRecord(response.vendaDireta);
  const vdScalars = scalarFields(vd, ['mensagem', 'fotos', 'leilao', 'checklist']);
  if (vdScalars.length) detailSections += section('Venda direta', 'VENDA DIRETA', `<div class="data-grid">${vdScalars.join('')}</div>`);

  // precificador
  const prec = response.precificador;
  if (Array.isArray(prec)) {
    const p0 = asRecord(prec[0]);
    const pScalars = scalarFields(p0, ['historico', 'resumo']);
    if (pScalars.length) detailSections += section('Precificador', 'PREÇO FIPE', `<div class="data-grid">${pScalars.join('')}</div>`);
    const resumo = asRecord(p0.resumo);
    const rScalars = scalarFields(resumo);
    if (rScalars.length) detailSections += section('Precificador', 'RESUMO', `<div class="data-grid">${rScalars.join('')}</div>`);
    if (Array.isArray(p0.historico)) detailSections += section('Precificador', 'HISTÓRICO DE VALORES', renderArrayTable(p0.historico as unknown[]));
  } else {
    const p = asRecord(prec);
    if (Array.isArray(p.precificador)) {
      const p0 = asRecord((p.precificador as unknown[])[0]);
      const pScalars = scalarFields(p0, ['historico', 'resumo']);
      if (pScalars.length) detailSections += section('Precificador', 'PREÇO FIPE', `<div class="data-grid">${pScalars.join('')}</div>`);
      const resumo = asRecord(p0.resumo);
      const rScalars = scalarFields(resumo);
      if (rScalars.length) detailSections += section('Precificador', 'RESUMO', `<div class="data-grid">${rScalars.join('')}</div>`);
      if (Array.isArray(p0.historico)) detailSections += section('Precificador', 'HISTÓRICO DE VALORES', renderArrayTable(p0.historico as unknown[]));
    }
  }

  // recall
  const rec = asRecord(response.recall);
  const recScalars = scalarFields(rec, ['mensagem', 'Mensagem', 'Mensagem2']);
  if (recScalars.length) detailSections += section('Recall', 'RECALL', `<div class="data-grid">${recScalars.join('')}</div>`);
  const recallMsg = text(rec, 'Mensagem', '') || text(rec, 'mensagem', '');
  if (recallMsg) detailSections += section('Recall', 'MENSAGEM', `<p class="summary">${esc(recallMsg)} ${esc(text(rec, 'Mensagem2', ''))}</p>`);

  // duplicidadeMotor
  const dm = asRecord(response.duplicidadeMotor);
  const dmScalars = scalarFields(dm, ['mensagem']);
  if (dmScalars.length) detailSections += section('Duplicidade de motor', 'DUPLICIDADE DE MOTOR', `<div class="data-grid">${dmScalars.join('')}</div>`);
  const dmMsg = text(dm, 'mensagem', '');
  if (dmMsg) detailSections += section('Duplicidade de motor', 'MENSAGEM', `<p class="summary">${esc(dmMsg)}</p>`);

  // comunicacaoVenda
  const cv = asRecord(response.comunicacaoVenda);
  const cvScalars = scalarFields(cv, ['mensagem']);
  if (cvScalars.length) detailSections += section('Comunicação de venda', 'COMUNICAÇÃO DE VENDA', `<div class="data-grid">${cvScalars.join('')}</div>`);
  const cvMsg = text(cv, 'mensagem', '');
  if (cvMsg) detailSections += section('Comunicação de venda', 'MENSAGEM', `<p class="summary">${esc(cvMsg)}</p>`);

  // csv
  const csv = asRecord(response.csv);
  const csvScalars = scalarFields(csv, ['mensagem']);
  if (csvScalars.length) detailSections += section('Base CSV', 'BASE CSV', `<div class="data-grid">${csvScalars.join('')}</div>`);
  const csvMsg = text(csv, 'mensagem', '');
  if (csvMsg && csvMsg !== 'Não informado') detailSections += section('Base CSV', 'MENSAGEM', `<p class="summary">${esc(csvMsg)}</p>`);

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;background:#edf1f5;color:#1c2b3a;font-family:Arial,Helvetica,sans-serif;font-size:10px}.page{width:190mm;min-height:270mm;margin:0 auto;background:#fff;padding:13mm 12mm 11mm}.topline{height:5px;margin:-13mm -12mm 25px;background:linear-gradient(90deg,#0c3556,#138c71,#d19b35)}.brand{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #dce4ea;padding-bottom:18px}.kicker{color:#138c71;font-size:8px;font-weight:bold;letter-spacing:1.5px}.brand h1{margin:5px 0 4px;color:#123a5a;font-size:27px;letter-spacing:-1px}.brand h1 span{color:#c08b29}.brand p{margin:0;color:#71818e;font-size:10px}.meta{min-width:145px;padding:11px 13px;background:#f5f8fa;border-left:3px solid #c79638}.meta small,.meta strong{display:block}.meta small{margin-bottom:3px;color:#7b8993;font-size:8px;text-transform:uppercase;letter-spacing:.5px}.meta strong{color:#183b58;font-size:10px}.meta strong+small{margin-top:10px}.hero{display:grid;grid-template-columns:1fr 1.25fr .9fr;gap:18px;align-items:center;margin-top:19px;padding:20px 21px;border-radius:12px;background:linear-gradient(125deg,#123654,#176b6c);color:#fff}.hero small{display:block;color:#b7d9d6;font-size:8px;font-weight:bold;letter-spacing:1.5px}.plate{margin:5px 0 4px;font-size:28px;font-weight:bold;letter-spacing:2px}.hero h2{margin:0 0 8px;font-size:18px}.hero p{margin:4px 0 0;color:#d7ebea;line-height:1.45}.hero-status{padding-left:15px;border-left:1px solid rgba(255,255,255,.25)}.status-pill{display:inline-block;padding:6px 9px;border-radius:20px;background:#d4a64a;color:#fff;font-size:8px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px}.section{margin-top:19px}.section-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:9px;border-bottom:1px solid #dce4ea;padding-bottom:7px}.section-title h2{margin:0;color:#173c5a;font-size:13px}.section-title small{color:#87949d;font-size:8px}.data-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#dce4ea;border:1px solid #dce4ea}.data-cell{min-height:40px;padding:8px 9px;background:#fbfcfd}.data-cell small{display:block;margin-bottom:5px;color:#7d8b95;font-size:7.5px;text-transform:uppercase;letter-spacing:.35px}.data-cell strong{display:block;color:#253e52;font-size:9.5px;line-height:1.25;word-break:break-word}.data-grid.technical{grid-template-columns:repeat(3,1fr)}.columns{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.box{border:1px solid #dce4ea;border-radius:8px;overflow:hidden}.box-header{padding:10px 12px;background:#f4f7f9;color:#173c5a;font-size:11px;font-weight:bold}.box-body{padding:11px 12px}.restrictions{margin:0;padding:0;list-style:none}.restrictions li{display:flex;gap:7px;padding:6px 0;border-bottom:1px solid #edf1f3;color:#344b5c}.restrictions li span{color:#17815f;font-weight:bold}.tbl{width:100%;border-collapse:collapse;font-size:8.5px}.tbl th,.tbl td{border:1px solid #dce4ea;padding:5px 6px;text-align:left}.tbl th{background:#f4f7f9;color:#173c.summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.summary-block{display:flex;align-items:center;gap:7px;min-height:38px;padding:7px 8px;border:1px solid #e0e7eb;border-radius:6px;background:#fbfcfd}.summary-dot{width:7px;height:7px;flex:none;border-radius:50%;background:#d0a04a}.summary-block.ok .summary-dot{background:#1a9a70}.summary-block.alert .summary-dot{background:#c0392b}.summary-block div{min-width:0;flex:1}.summary-block b,.summary-block small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.summary-block b{color:#173c5a;font-size:9px}.summary-block small{color:#5d6b77;font-size:7.5px}.summary-block strong{flex:none;font-size:8px;color:#173c5a}.summary-block.alert strong{color:#c0392b}.modules{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.module{display:flex;align-items:center;gap:7px;min-height:38px;padding:7px 8px;border:1px solid #e0e7eb;border-radius:6px;background:#fbfcfd}.module-dot{width:7px;height:7px;flex:none;border-radius:50%;background:#d0a04a}.module.ready .module-dot{background:#1a9a70}.module div{min-width:0;flex:1}.module b,.module small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.module b{color:#304a5c;font-size:8.5px}.module small{margin-top:3px;color:#87949d;font-size:7.5px}.module strong{color:#b17c21;font-size:7px;text-transform:uppercase;white-space:nowrap}.module.ready strong{color:#17815f}.notice{display:flex;gap:11px;margin-top:19px;padding:13px 15px;border:1px solid #c6dced;border-radius:8px;background:#eef7fd;color:#315873}.notice-mark{display:grid;place-items:center;width:25px;height:25px;flex:none;border-radius:50%;background:#2c78a5;color:#fff;font-weight:bold}.notice b{display:block;margin-bottom:4px;font-size:10px}.notice span{font-size:8.5px;line-height:1.45}footer{display:flex;justify-content:space-between;margin-top:22px;padding-top:9px;border-top:1px solid #dce4ea;color:#8b979f;font-size:7.5px}@media print{body{background:#fff}.page{margin:0}}@media(max-width:700px){.hero{grid-template-columns:1fr}.hero-status{padding:10px 0 0;border-left:0;border-top:1px solid rgba(255,255,255,.25)}.data-grid,.data-grid.technical,.modules{grid-template-columns:repeat(2,1fr)}.columns{grid-template-columns:1fr}}
  </style></head><body><main class="page"><div class="topline"></div><header class="brand"><div><span class="kicker">RELATÓRIO DE PERÍCIA VEICULAR</span><h1>Perícia <span>Gold</span></h1><p>Consulta veicular com verificações e fontes integradas</p></div><div class="meta"><small>Código da consulta</small><strong>${esc(String(request.codigoConsulta || '—'))}</strong><small>Data da solicitação</small><strong>${esc(String(request.dataHora || '—'))}</strong></div></header><section class="hero"><div><small>VEÍCULO CONSULTADO</small><div class="plate">${esc(plate)}</div><div>${esc(text(raw, 'Uf', 'UF não informada'))} · ${esc(text(raw, 'municipio', 'Município não informado'))}</div></div><div><h2>${esc(text(raw, 'marca'))} ${esc(text(raw, 'modelo', ''))}</h2><p>${esc(text(raw, 'procedencia', 'Procedência não informada'))} · ${esc(text(raw, 'segmento', 'Categoria não informada'))}</p><p>${esc(text(raw, 'cor', 'Cor não informada'))} · ${esc(text(raw, 'combustivel', 'Combustível não informado'))}</p></div><div class="hero-status"><span class="status-pill">${esc(reportStatus)}</span><p>${esc(message)}</p></div></section><section class="section"><div class="section-title"><h2>Resumo do veículo</h2><small>DADOS CADASTRAIS E DE IDENTIFICAÇÃO</small></div><div class="data-grid">${vehicleFields.map(([label, key]) => field(label, text(raw, key))).join('')}</div></section><section class="section"><div class="section-title"><h2>Identificação técnica</h2><small>CONFERÊNCIA DOS IDENTIFICADORES</small></div><div class="data-grid technical">${technicalFields.map(([label, key]) => field(label, text(raw, key))).join('')}</div></section><section class="section columns"><div class="box"><div class="box-header">Restrições informadas</div><div class="box-body"><ul class="restrictions">${restrictionHtml}</ul></div></div><div class="box"><div class="box-header">Leitura da consulta</div><div class="box-body"><p class="summary"><b>Situação do retorno:</b> ${esc(String(request.status || status))}</p><p class="summary"><b>Mensagem da fonte:</b> ${esc(String(request.mensagem || message))}</p><p class="summary"><b>Hash de pesquisa:</b> ${esc(String(response.hashPesquisa || 'Não informado'))}</p></div></div></section><section class="section"><div class="section-title"><h2>Resumo de riscos</h2><small>STATUS RÁPIDO POR BLOCO</small></div><div class="summary-grid">${summaryBlocks}</div></section><section class="section"><div class="section-title"><h2>Módulos consultados</h2><small>STATUS DAS BASES INTEGRADAS</small></div><div class="modules">${moduleCards}</div></section>${detailSections}${status !== 'COMPLETED' ? `<div class="notice"><div class="notice-mark">i</div><div><b>Esta consulta ainda está em processamento</b><span>O retorno inicial foi recebido, mas algumas bases informaram indisponibilidade temporária. O relatório poderá ser atualizado quando a Company concluir o processamento.</span></div></div>` : ''}<footer><span>Documento informativo · Perícia Gold</span><span>Código: ${esc(String(request.codigoConsulta || '—'))}</span><span>Gerado em ${esc(new Date().toLocaleString('pt-BR'))}</span></footer></main></body></html>`;
}

export async function renderGoldPdf(response: CompanyResponse, plate: string, status: string, message: string) {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await puppeteer.executablePath();
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try { const page = await browser.newPage(); await page.setContent(goldReportHtml(response, plate, status, message), { waitUntil: 'load' }); const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' } }); return Buffer.from(pdf); } finally { await browser.close(); }
}

export const reportHash = (pdf: Buffer) => crypto.createHash('sha256').digest('hex');
