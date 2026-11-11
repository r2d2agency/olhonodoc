import crypto from 'node:crypto';
import puppeteer from 'puppeteer';
import type { CompanyResponse } from '@/lib/company-conferi';
import { MODEL_HTML_TEMPLATE } from '@/lib/gold-report-template';
import { getActiveTemplateHtml } from '@/lib/admin/report-templates';

const asRecord = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (s: Record<string, unknown>, k: string, fb = 'Não informado') => { const v = s[k]; return v === undefined || v === null || v === '' || v === '0' ? fb : String(v); };
const isBlank = (v: unknown) => v === undefined || v === null || String(v).trim() === '' || String(v).trim() === '0';
const norm = (v: unknown) => String(v ?? '').trim();
const upper = (v: unknown) => norm(v).toUpperCase();
const hasMeaningful = (v: unknown): boolean => {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.some(hasMeaningful);
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>);
    if (!entries.length) return false;
    return entries.some(([k, val]) => k !== 'codigoConsulta' && k !== 'dataHora' && k !== 'acao' && hasMeaningful(val));
  }
  const s = norm(v);
  if (!s || s === '0') return false;
  const u = s.toUpperCase();
  if (['NÃO INFORMADO', 'NAO INFORMADO', 'INDISPONÍVEL', 'INDISPONIVEL', 'NADA CONSTA', 'SEM INFORMAÇÃO', 'SEM INFORMACAO'].includes(u)) return false;
  return true;
};
const nadaConsta = (v: unknown) => {
  const u = upper(v);
  return !u || u === 'NADA CONSTA' || u === 'NAO CONSTA' || u === 'NÃO CONSTA';
};
const isIndisponivelMsg = (v: unknown) => /indispon/i.test(norm(v));
const isNadaConstaMsg = (v: unknown) => /nada consta|nao consta|não consta/i.test(norm(v));
const isPositiveMsg = (v: unknown) => {
  const s = norm(v);
  if (!s) return false;
  if (isNadaConstaMsg(s) || isIndisponivelMsg(s)) return false;
  const u = s.toUpperCase();
  if (['NÃO', 'NAO', 'N', 'NEGATIVO', 'OK'].includes(u)) return false;
  return !/^(não|nao)\b/.test(s.toLowerCase());
};

function fixSpacing(s: string): string {
  if (!s) return s;
  s = s.replace(/\r\n?/g, '\n').replace(/\t+/g, ' ');
  // ensure space after sentence punctuation when glued (but NOT inside timestamps like 00:00:00 or dates)
  s = s.replace(/([.!?;,])([A-Za-zÀ-ÖØ-öø-ÿ0-9])/g, (m, p, c) => (/^\d$/.test(c) && /[:/.-]/.test(p) ? m : `${p} ${c}`));
  // ensure space before common uppercase-led word starts when glued to lowercase/number (ex.: "ALERTADE" -> "ALERTA DE")
  s = s.replace(/([a-zà-öø-ÿ0-9])([A-ZÀ-Ö])/g, '$1 $2');
  s = s.replace(/[ ]{2,}/g, ' ');
  return s;
}
function formatTextBlock(raw: unknown): string {
  let s = fixSpacing(norm(raw));
  if (!s) return '';
  s = s.split('\n').map(line => {
    let l = line.trim().replace(/[ ]{2,}/g, ' ');
    if (!l) return '';
    // capitalize first letter of sentence/line
    l = l.replace(/^([a-zà-öø-ÿ])/, (_, c) => c.toUpperCase());
    // capitalize after ". " if lowercase
    l = l.replace(/([.!?]\s+)([a-zà-öø-ÿ])/g, (_, p, c) => p + c.toUpperCase());
    return l;
  }).filter(Boolean).join('\n');
  return s.trim();
}

function formatLabel(key: string): string {
  const spaced = key
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-zà-öø-ÿ0-9])([A-ZÀ-Ö])/g, '$1 $2')
    .replace(/([A-ZÀ-Ö]+)([A-ZÀ-Ö][a-zà-öø-ÿ])/g, '$1 $2')
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function valueToText(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.map(valueToText).filter(Boolean).join('; ');
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).filter(([_, val]) => !isBlank(val));
    if (!entries.length) return '';
    return entries.map(([k, val]) => `${formatLabel(k)}: ${valueToText(val)}`).join(' | ');
  }
  return fixSpacing(norm(v));
}

function pairsFromObject(obj: Record<string, unknown>, opts?: { dropKeys?: Set<string>; formatKeys?: boolean }): string[][] {
  const drop = new Set([...(opts?.dropKeys || [])].map(k => k.toLowerCase()));
  return Object.entries(obj)
    .filter(([k, v]) => !drop.has(k.toLowerCase()) && !isBlank(v))
    .map(([k, v]) => [opts?.formatKeys ? formatLabel(k) : k, valueToText(v)] as string[]);
}

function registrosFromArray(arr: unknown[], opts?: { dropKeys?: string[] }): Record<string, string>[] {
  const drop = new Set((opts?.dropKeys || []).map(k => k.toLowerCase()));
  return arr.map(item => {
    const rec = asRecord(item);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(rec)) {
      if (drop.has(k.toLowerCase())) continue;
      if (isBlank(v)) continue;
      const val = valueToText(v);
      if (!val) continue;
      out[formatLabel(k)] = val;
    }
    return out;
  }).filter(r => Object.keys(r).length > 0);
}

function findDeep(obj: unknown, keys: string[], depth = 0): unknown {
  if (depth > 4 || obj === undefined || obj === null) return undefined;
  if (Array.isArray(obj)) {
    for (const item of obj) { const f = findDeep(item, keys, depth + 1); if (f !== undefined) return f; }
    return undefined;
  }
  if (typeof obj !== 'object') return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) { if (k in rec && !isBlank(rec[k])) return rec[k]; }
  for (const v of Object.values(rec)) { const f = findDeep(v, keys, depth + 1); if (f !== undefined) return f; }
  return undefined;
}

function findDeepKeyMatch(obj: unknown, patterns: RegExp[], depth = 0): { key: string; value: unknown } | undefined {
  if (depth > 4 || obj === undefined || obj === null || typeof obj !== 'object') return undefined;
  if (Array.isArray(obj)) {
    for (const item of obj) { const f = findDeepKeyMatch(item, patterns, depth + 1); if (f) return f; }
    return undefined;
  }
  const rec = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(rec)) {
    if (patterns.some(p => p.test(k)) && hasMeaningful(v)) return { key: k, value: v };
  }
  for (const v of Object.values(rec)) { const f = findDeepKeyMatch(v, patterns, depth + 1); if (f) return f; }
  return undefined;
}

function collectSectionRecords(value: unknown): Record<string, string>[] {
  if (Array.isArray(value)) return registrosFromArray(value);
  if (value && typeof value === 'object') {
    const rec = asRecord(value);
    // common wrappers
    for (const k of ['detalhes', 'detalhe', 'registros', 'itens', 'historico', 'ocorrencias', 'dados', 'lista']) {
      const inner = rec[k];
      if (Array.isArray(inner)) return registrosFromArray(inner);
    }
    const recs = registrosFromArray([rec]);
    return recs;
  }
  return [];
}

type DebitoItem = { descricao: string; situacao: string; valor: string; pendente: boolean };
function normalizeSituacao(raw: unknown) {
  return norm(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}
function formatMoneyBRL(raw: unknown): string {
  const s = norm(raw);
  if (!s) return '';
  if (/^R\$\s*/i.test(s)) return s.replace(/^R\$\s*/i, 'R$ ');
  if (/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(s) || /^-?\d+,\d{2}$/.test(s)) return `R$ ${s}`;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isNaN(n)) return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return `R$ ${s}`;
}
function buildDebitos(est: Record<string, unknown>): DebitoItem[] {
  const defs: { descricao: string; valorKey: string; situacaoKey: string }[] = [
    { descricao: 'Multas', valorKey: 'debitoMulta', situacaoKey: 'existeDebitoMulta' },
    { descricao: 'IPVA', valorKey: 'debitoIpva', situacaoKey: 'existeDebitoIPVA' },
    { descricao: 'Licenciamento', valorKey: 'debitoLicenciamento', situacaoKey: 'existeDebitoLicenciamento' },
    { descricao: 'DPVAT', valorKey: 'debitoDpvat', situacaoKey: 'existeDebitoDpvat' },
  ];
  const itens: DebitoItem[] = [];
  for (const def of defs) {
    const hasValor = Object.prototype.hasOwnProperty.call(est, def.valorKey);
    const hasSit = Object.prototype.hasOwnProperty.call(est, def.situacaoKey);
    if (!hasValor && !hasSit) continue;
    const valorRaw = est[def.valorKey];
    const sitRaw = est[def.situacaoKey];
    const sitNorm = normalizeSituacao(sitRaw);
    const consta = sitNorm.includes('CONSTA DEBITO') || sitNorm === 'CONSTA';
    const semDebito = sitNorm.includes('NAO CONSTA') || sitNorm.includes('SEM DEBITO');
    const valorBlank = valorRaw === undefined || valorRaw === null || String(valorRaw).trim() === '';
    const sitBlank = sitRaw === undefined || sitRaw === null || String(sitRaw).trim() === '';

    let situacao = 'Não informado';
    let valor = 'Não informado';
    let pendente = false;

    if (consta) {
      situacao = 'Consta débito';
      pendente = true;
      valor = valorBlank ? 'Não informado' : formatMoneyBRL(valorRaw);
    } else if (semDebito) {
      situacao = 'Sem débito';
      valor = valorBlank ? 'R$ 0,00' : formatMoneyBRL(valorRaw);
    } else if (!sitBlank) {
      situacao = norm(sitRaw);
      valor = valorBlank ? 'Não informado' : formatMoneyBRL(valorRaw);
      pendente = /DEBITO|PEND|MULTA/.test(sitNorm);
    } else {
      situacao = 'Não informado';
      valor = valorBlank ? 'Não informado' : formatMoneyBRL(valorRaw);
    }

    itens.push({ descricao: def.descricao, situacao, valor, pendente });
  }
  return itens;
}
function deriveParecer(r: Record<string, unknown>, parecer: Record<string, unknown>, alertas: { tipo: string }[]) {
  const corRaw = upper(parecer.cor || parecer.nivel || parecer.classificacao);
  let nivel = corRaw.includes('VERM') ? 'vermelho' : corRaw.includes('AMAR') || corRaw.includes('ATEN') || corRaw.includes('LARAN') ? 'amarelo' : corRaw.includes('VERD') ? 'verde' : '';
  const sin = asRecord(r.sinistro);
  const ind = asRecord(r.indicioSinistro2 || r.indicioSinistro);
  const rf = asRecord(r.historicoRouboFurto || r.rouboFurto);
  const grav = asRecord(r.gravame);
  const leilao = asRecord(r.leilao);
  const com = asRecord(r.comercializacao);
  const est = asRecord(r.estadual);
  const cv = asRecord(r.comunicacaoVenda);
  const hasSinistro = /SIM|CONSTA/i.test(norm(sin.resposta || sin.mensagem));
  const hasRoubo = (Array.isArray(rf.registros) && rf.registros.length > 0) || isPositiveMsg(rf.alertaMensagem) || upper(rf.alertaCodigo) === 'SIM' || /SIM|CONSTA|POSITIV/i.test(upper(rf.resposta));
  const hasRestrJud = !nadaConsta(est.restricaoJudicial) || !nadaConsta(est.restricaoRenajud) || !nadaConsta(est.restricaoJudicialRenajud);
  const hasGravAtivo = /ATIV|CONSTA|GRAVAD/i.test(upper(grav.situacao || grav.restricao || grav.resposta));
  const hasLeilao = Array.isArray(asRecord(leilao.leiloes).leilao) ? (asRecord(leilao.leiloes).leilao as unknown[]).length > 0 : Array.isArray(leilao.leiloes) ? (leilao.leiloes as unknown[]).length > 0 : Array.isArray(leilao.registros) ? (leilao.registros as unknown[]).length > 0 : isPositiveMsg(leilao.resposta);
  const hasComunicVenda = isPositiveMsg(cv.resposta || cv.mensagem);
  const hasComercial = isPositiveMsg(com.resposta || com.mensagem);
  const hasIndicio = isPositiveMsg(ind.mensagem || ind.resposta);
  const hasSevere = hasSinistro || hasRoubo || hasRestrJud || hasComunicVenda;
  const hasAttention = hasGravAtivo || hasLeilao || hasComercial || hasIndicio;
  if (hasSevere) nivel = 'vermelho';
  else if (hasAttention && nivel !== 'vermelho') nivel = 'amarelo';
  else if (!nivel) nivel = alertas.some(a => a.tipo === 'alerta') ? 'vermelho' : alertas.some(a => a.tipo === 'atencao') ? 'amarelo' : 'verde';
  const partes: string[] = [];
  if (hasSinistro) partes.push('sinistro apontado');
  if (hasRoubo) partes.push('histórico de roubo/furto');
  if (hasRestrJud) partes.push('restrição judicial');
  if (hasComunicVenda) partes.push('comunicação de venda');
  if (hasGravAtivo) partes.push('gravame/restrição financeira');
  if (hasLeilao) partes.push('oferta em leilão');
  if (hasComercial) partes.push(`comercialização${com.resposta ? ` (${norm(com.resposta)})` : ''}`);
  if (hasIndicio) partes.push('indício de sinistro');
  let resumo = '';
  if (nivel === 'verde') resumo = 'Nenhum apontamento crítico identificado nos indicadores consultados. Veículo sem alertas relevantes no momento da consulta.';
  else if (nivel === 'amarelo') resumo = `Foram identificados pontos que exigem atenção: ${partes.join(', ') || 'verificar indicadores retornados'}. Recomenda-se análise cuidadosa antes da negociação.`;
  else resumo = `Foram identificados apontamentos críticos: ${partes.join(', ') || 'indicadores de alerta presentes'}. Recomenda-se cautela e verificação detalhada antes de qualquer negociação.`;
  const detalhe = norm(parecer.texto || parecer.observacao || parecer.descricao || parecer.mensagem);
  if (detalhe && !isIndisponivelMsg(detalhe)) resumo += ` ${detalhe}`;
  return { nivel, resumo: formatTextBlock(resumo) };
}

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
  const rf = asRecord(r.historicoRouboFurto || r.rouboFurto);
  const parecerSrc = asRecord(r.parecerTecnico);
  const indicio = asRecord(r.indicioSinistro2 || r.indicioSinistro);

  const solicitacaoMsg = norm(sol.mensagem || message);
  const consultaIndisponivel = upper(sol.status) === 'FAILED' || isIndisponivelMsg(solicitacaoMsg) || /indispon/i.test(upper(status));
  const motivoIndisponivel = consultaIndisponivel ? (solicitacaoMsg || 'Consulta temporariamente indisponível na base consultada.') : '';

  const alertas: { icone: string; texto: string; tipo: 'alerta' | 'atencao' }[] = [];

  const sinistroPos = isPositiveMsg(sinistro.resposta || sinistro.mensagem);
  if (sinistroPos) alertas.push({ icone: 'sinistro', texto: /consta|ind[íi]cio/i.test(norm(sinistro.resposta)) ? norm(sinistro.resposta) : 'Consta sinistro', tipo: 'alerta' });

  // Leilão
  const leiloesRaw = asRecord(leilao.leiloes).leilao ?? leilao.leiloes ?? leilao.registros;
  const leiloesArr: unknown[] = Array.isArray(leiloesRaw) ? leiloesRaw : leiloesRaw && typeof leiloesRaw === 'object' ? [leiloesRaw] : [];
  if (leiloesArr.length || isPositiveMsg(leilao.resposta)) alertas.push({ icone: 'leilao', texto: 'Consta oferta em leilão', tipo: 'alerta' });

  // Comercialização - must reflect exact Company text/type
  const comercialTxt = norm(comercial.resposta || comercial.mensagem);
  if (comercialTxt && isPositiveMsg(comercialTxt)) {
    alertas.push({ icone: 'info', texto: comercialTxt, tipo: 'alerta' });
  }

  // Roubo/Furto - ONLY on positive record/alert, never on negative
  const rfReg = Array.isArray(rf.registros) ? rf.registros : rf.registros ? [rf.registros] : [];
  const rfCodigo = upper(rf.alertaCodigo);
  const rfMsg = norm(rf.alertaMensagem || rf.mensagem || rf.resposta);
  const rfPositive = rfReg.length > 0 || rfCodigo === 'SIM' || /POSITIV|CONST|ROUB|FURT/i.test(rfCodigo) || (isPositiveMsg(rfMsg) && /roub|furt|consta/i.test(rfMsg));
  if (rfPositive) {
    const texto = /roub|furt/i.test(rfMsg) && isPositiveMsg(rfMsg) ? rfMsg : 'Consta histórico de roubo/furto';
    alertas.push({ icone: 'roubo', texto, tipo: 'alerta' });
  }

  // Restrições judiciais
  const restKeys = Object.keys(est).filter(k => /restric|renajud|renainf|judicial/i.test(k));
  const hasRestricao = restKeys.some(k => !nadaConsta(est[k]) && !isBlank(est[k]));
  if (hasRestricao) alertas.push({ icone: 'judicial', texto: 'Restrição judicial', tipo: 'alerta' });

  // Indício de sinistro - only when Company returns positive
  const indicioMsg = norm(indicio.mensagem || indicio.resposta);
  const indicioPos = isPositiveMsg(indicioMsg) && /ind[íi]cio|consta|sinistr/i.test(indicioMsg);
  // (shown in section/parecer; top alert not mandated but keep logic consistent via section)

  // BIN: if object has meaningful data, show it. If only unavailable markers, surface as indisponível note but don't hide real data.
  const binPairsAll = pairsFromObject(bin, { formatKeys: true });
  const binHasData = hasMeaningful(bin) && binPairsAll.length > 0;
  const binUnavailableMsg = !binHasData ? (findDeep(bin, ['mensagem', 'status', 'descricao', 'resposta']) as string | undefined) : undefined;

  // Base Estadual - include all fields, formatted labels, preserve values
  // (exceto as chaves de débito, que têm seção própria "Débitos e multas")
  const DEBITO_KEYS = new Set(['debitomulta', 'existedebitomulta', 'debitoipva', 'existedebitoipva', 'debitolicenciamento', 'existedebitolicenciamento', 'debitodpvat', 'existedebitodpvat']);
  const baseEstadual = pairsFromObject(est, { formatKeys: true, dropKeys: DEBITO_KEYS });

  // Emplacamento / cabeçalho
  const marca = norm(bin.marca || est.marca || agg.marca || r.marca);
  const modelo = norm(bin.modelo || est.modelo || agg.modelo || r.modelo);
  const marcaModelo = [marca, modelo].filter(Boolean).join(' / ') || 'Não informado';

  // Débitos e multas (estadual) - mapeamento explícito e dinâmico, sem misturar com outras fontes
  const debitosItens = buildDebitos(est);
  // inclui outros débitos agregados fora do estadual (fonte distinta), sem somar com estadual
  const debitosOutros = asRecord(r.debitos);
  if (hasMeaningful(debitosOutros)) {
    for (const [k, v] of Object.entries(debitosOutros)) {
      if (isBlank(v)) continue;
      const label = formatLabel(k);
      if (debitosItens.some(d => d.descricao === label)) continue;
      debitosItens.push({ descricao: label, situacao: 'Informado', valor: valueToText(v), pendente: false });
    }
  }

  // Gravame - hide yellow-highlighted sensitive/internal fields in view (conservative: hide contact/cpf-cnpj of agents/financeira details not essential)
  const gravameDrop = ['cpfcnpjagente', 'cpfcnpj', 'cpf_cnpj', 'cnpjcpf', 'telefone', 'email', 'endereco', 'endereço', 'logradouro', 'numero', 'bairro', 'cidade', 'municipio', 'ufagente', 'cep'];
  const gravamesArr: unknown[] = Array.isArray(grav.gravames) ? grav.gravames : Array.isArray(grav.registros) ? grav.registros : grav.resposta && hasMeaningful(grav) ? [grav] : [];
  const gravameRegs = registrosFromArray(gravamesArr, { dropKeys: gravameDrop });

  // Restrições e Outras Informações - reproduce as Company return, formatted
  const restricoesTextoParts: string[] = [];
  // include specific textual restriction/other-info fields from estadual and root
  const restrTextKeys = ['restricoes', 'restricao', 'outrasInformacoes', 'outras_informacoes', 'observacoes', 'observacao', 'mensagemRestricao', 'informacoes', 'informacoesComplementaresRestricao'];
  for (const src of [est, r]) {
    for (const k of Object.keys(src)) {
      if (/outr.*inform|observ|restric.*texto|mensag.*restric/i.test(k)) {
        const v = src[k];
        if (typeof v === 'string' && norm(v)) restricoesTextoParts.push(v);
        else if (hasMeaningful(v) && typeof v !== 'object') restricoesTextoParts.push(String(v));
      }
    }
    for (const k of restrTextKeys) { if (typeof src[k] === 'string' && norm(src[k])) restricoesTextoParts.push(src[k] as string); }
  }
  // build status items from restriction flags (Renajud, Renainf, judicial etc.) exactly as returned
  const restricoesStatus = restKeys.map(k => {
    const val = est[k];
    const valText = valueToText(val) || norm(val);
    const ok = nadaConsta(valText) || upper(valText) === 'NÃO' || upper(valText) === 'NAO';
    return { rotulo: formatLabel(k), valor: valText, status: ok ? 'ok' : 'alerta', largura: /renajud|detalh/i.test(k) ? 'full' : '' };
  });
  // dedupe restricoes text
  const restricoesTexto = formatTextBlock(Array.from(new Set(restricoesTextoParts.map(s => norm(s)).filter(Boolean))).join('\n'));

  // Roubo/Furto - oculta campos destacados (dados pessoais/internos) e corrige espaçamento do texto
  const rfDrop = ['telefone', 'documento', 'numerodocumento', 'informante', 'consultaid', 'idconsulta', 'protocolo', 'codigoConsultaInterno', 'identificador', 'token'];
  const rfRegs = registrosFromArray(rfReg, { dropKeys: rfDrop });
  const rfMensagemFmt = formatTextBlock(rfMsg);

  // Leilão - oculta apenas campos destacados (internos)
  const leilaoDrop = ['idleilao', 'dataleilao', 'consultaid', 'idconsulta', 'protocolo', 'identificador', 'token', 'interno'];
  const leilaoRegs = registrosFromArray(leiloesArr, { dropKeys: leilaoDrop });
  // fallback if records became empty but there were items
  const leilaoHas = leiloesArr.length > 0 || isPositiveMsg(leilao.resposta);

  // Comercialização - positive highlight in red, keep text
  const comercializacaoTexto = formatTextBlock(comercialTxt);
  const comercializacaoPos = isPositiveMsg(comercialTxt);

  // Recall
  const recallTxt = norm(recall.resposta || recall.mensagem);
  const recallFmt = recallTxt ? formatTextBlock(recallTxt) : 'Nada consta';

  // Comparativo de componentes (missing) - from root/estadual/bin/common keys
  let comparativoRaw = r.comparativo ?? r.comparativoComponentes ?? r.comparativosDeComponentes ?? r.comparativosComponentes ?? est.comparativo ?? bin.comparativo;
  if (!comparativoRaw) {
    const found = findDeepKeyMatch(r, [/comparativ/i]);
    if (found) comparativoRaw = found.value;
  }
  let comparativo: any[] | undefined;
  if (Array.isArray(comparativoRaw)) {
    comparativo = comparativoRaw.map(item => {
      const it = asRecord(item);
      const componente = norm(it.componente || it.item || it.descricao || it.nome || Object.values(it)[0]);
      const fabrica = norm(it.fabrica || it.fábrica || it.original || it.montadora || it.baseFabrica);
      const estadual = norm(it.estadual || it.atual || it.baseEstadual || it.vistoria);
      const comp = norm(it.comparativo || it.status || it.resultado);
      let st: 'ok' | 'diferente' | 'na' = 'na';
      const cu = upper(comp);
      if (/igual|ok|confere|correspond/.test(cu)) st = 'ok';
      else if (/difer|diverg|nao confere|não confere|alerta/.test(cu)) st = 'diferente';
      else if (fabrica && estadual) st = upper(fabrica) === upper(estadual) ? 'ok' : 'diferente';
      return { componente: componente || '-', fabrica: fabrica || '-', estadual: estadual || '-', comparativo: comp || (st === 'ok' ? 'Confere' : st === 'diferente' ? 'Divergente' : '-'), status: st };
    }).filter(x => x.componente !== '-' || x.fabrica !== '-' || x.estadual !== '-');
  } else if (comparativoRaw && typeof comparativoRaw === 'object') {
    const recs = collectSectionRecords(comparativoRaw);
    if (recs.length) comparativo = recs.map(o => ({ componente: o['Componente'] || Object.values(o)[0] || '-', fabrica: o['Fabrica'] || o['Fábrica'] || '-', estadual: o['Estadual'] || '-', comparativo: o['Comparativo'] || o['Status'] || '-', status: 'na' as const }));
  }

  // Informações complementares
  let infoCompl = r.informacoesComplementares ?? r.informacoes_complementares ?? r.infoComplementares ?? est.informacoesComplementares ?? est.informacoes_complementares;
  if (!infoCompl) { const f = findDeepKeyMatch(r, [/informac.*complement/i]); if (f) infoCompl = f.value; }
  const informacoesComplementares = typeof infoCompl === 'string' ? formatTextBlock(infoCompl) : hasMeaningful(infoCompl) ? collectSectionRecords(infoCompl) : null;

  // Duplicidade de motor — extrai mensagem explicitamente; formato dedicado { status, texto }
  let dupMotor = r.duplicidadeMotor ?? r.duplicidadeDeMotor ?? r.duplicidade_motor ?? est.duplicidadeMotor ?? est.duplicidade;
  if (!dupMotor) { const f = findDeepKeyMatch(r, [/duplicid.*motor/i]); if (f) dupMotor = f.value; }
  const dupMsgRaw = typeof dupMotor === 'string' ? dupMotor : hasMeaningful(dupMotor) ? (norm(asRecord(dupMotor).mensagem || asRecord(dupMotor).resposta || asRecord(dupMotor).descricao || valueToText(dupMotor))) : '';
  const dupMsg = formatTextBlock(dupMsgRaw);
  const dupAusente = !dupMsg;
  const dupOk = !dupAusente && (isNadaConstaMsg(dupMsg) || /nenhum registro|sem registro|nao encontrado|não encontrado|negativ/i.test(dupMsg));
  const duplicidadeMotor = {
    status: dupAusente ? '' : dupOk ? 'ok' : 'alerta',
    texto: dupAusente ? 'Informação não disponível.' : dupMsg,
  };

  // CSV
  let csv = r.csv ?? r.CSV ?? est.csv ?? r.dadosCsv ?? r.informacoesCsv;
  if (!csv) { const f = findDeepKeyMatch(r, [/^csv$|csv/i]); if (f) csv = f.value; }
  const csvInfo = typeof csv === 'string' ? formatTextBlock(csv) : hasMeaningful(csv) ? collectSectionRecords(csv) : null;

  // Detalhamento Renajud
  let renajud = r.detalhamentoRenajud ?? r.detalhamento_renajud ?? r.renajudDetalhamento ?? est.detalhamentoRenajud ?? est.renajud ?? r.renajud;
  if (!renajud) { const f = findDeepKeyMatch(r, [/detalh.*renajud|renajud.*detalh/i]); if (f) renajud = f.value; }
  // if not found separately, maybe inside estadual as complex value
  if (!renajud && est.detalhamentoNoRenajud) renajud = est.detalhamentoNoRenajud;
  const detalhamentoRenajud = typeof renajud === 'string' ? formatTextBlock(renajud) : hasMeaningful(renajud) ? collectSectionRecords(renajud) : null;

  // Histórico FIPE — objeto precificador.precificador[0] com resumo + historico
  type FipeHistItem = { referencia: string; valor: number; variacao_pct: number | null; variacao_nom: number | null };
  type HistoricoFipe = {
    marca: string; modelo: string; codigo: string; anoModelo: string; referencia: string;
    inicial: number | null; final: number | null; variacao_pct: number | null; variacao_nom: number | null;
    historico: FipeHistItem[];
  } | null;
  const parseNumBR = (v: unknown): number | null => {
    const s = norm(v).replace(/R\$\s*/gi, '').trim();
    if (!s) return null;
    let n: number;
    if (s.includes(',')) n = Number(s.replace(/\./g, '').replace(',', '.'));
    else n = Number(s.replace(/(?<=\d)\s(?=\d)/g, ''));
    return Number.isFinite(n) ? n : null;
  };
  const pickPrecificador = (): Record<string, unknown> | null => {
    const prec = asRecord(r.precificador);
    const arrRaw = prec.precificador ?? r.precificador;
    const arr = Array.isArray(arrRaw) ? arrRaw : Array.isArray(prec) ? prec : null;
    if (arr && arr.length) {
      const first = asRecord(arr[0]);
      if (Object.keys(first).length) return first;
    }
    return null;
  };
  let historicoFipe: HistoricoFipe | string | Record<string, string>[] | null = null;
  const prec0 = pickPrecificador();
  if (prec0) {
    const resumo = asRecord(prec0.resumo);
    const histArr: unknown[] = Array.isArray(prec0.historico) ? prec0.historico : [];
    const historico: FipeHistItem[] = histArr.map((h) => {
      const hh = asRecord(h);
      return {
        referencia: norm(hh.referencia || hh.mes || hh.periodo || hh.data),
        valor: parseNumBR(hh.valor) ?? 0,
        variacao_pct: parseNumBR(hh.variacao_percentual ?? hh.variacaoPercentual ?? hh.variacao_pct),
        variacao_nom: parseNumBR(hh.variacao_nominal ?? hh.variacaoNominal ?? hh.variacao_nom),
      };
    }).filter((h) => h.referencia || h.valor);
    historicoFipe = {
      marca: norm(prec0.Marca || prec0.marca),
      modelo: norm(prec0.Modelo || prec0.modelo),
      codigo: norm(prec0.CodigoFipe || prec0.codigoFipe || prec0.codigo_fipe || prec0.codigo),
      anoModelo: norm(prec0.AnoModelo || prec0.anoModelo || prec0.ano_modelo),
      referencia: norm(prec0.mesReferencia || prec0.MesReferencia || prec0.referencia || prec0.Referencia),
      inicial: parseNumBR(resumo.valor_inicial ?? prec0.valor_inicial),
      final: parseNumBR(resumo.valor_final ?? prec0.Valor ?? prec0.valor),
      variacao_pct: parseNumBR(resumo.variacao_acumulada_percentual ?? prec0.variacao_acumulada_percentual),
      variacao_nom: parseNumBR(resumo.variacao_acumulada_nominal ?? prec0.variacao_acumulada_nominal),
      historico,
    };
  } else {
    const fipe = r.historicoFipe ?? r.historicoFIPE ?? r.fipe ?? r.historico_fipe ?? est.historicoFipe ?? r.tabelaFipe ?? r.tabelaFIPE;
    const fipeFound = fipe || (() => { const f = findDeepKeyMatch(r, [/histor.*fipe|fipe/i]); return f ? f.value : null; })();
    historicoFipe = typeof fipeFound === 'string' ? formatTextBlock(fipeFound) : hasMeaningful(fipeFound) ? collectSectionRecords(fipeFound) : null;
  }

  const parecer = deriveParecer(r, parecerSrc, alertas);

  const proprietarioTxt = norm(bin.nomeProprietario || bin.proprietario || est.proprietario || est.nomeProprietario);

  const data = {
    consulta: {
      numero: norm(sol.codigoConsulta) || undefined,
      produto: 'Auto Perícia Gold',
      realizadaEm: norm(sol.dataHora) || undefined,
      placa: plate,
      marcaModelo,
      logoUrl: '',
      indisponivel: consultaIndisponivel ? motivoIndisponivel : '',
    },
    alertas,
    emplacamento: [
      ['Marca', marca || 'Não informado'],
      ['Modelo', modelo || 'Não informado'],
      ['Ano fabricação', text(bin, 'anoFabricacao', text(est, 'anoFabricacao', 'Não informado'))],
      ['Ano modelo', text(bin, 'anoModelo', text(est, 'anoModelo', 'Não informado'))],
      ['Cor', text(bin, 'cor', text(est, 'cor', 'Não informado'))],
      ['Combustível', text(bin, 'combustivel', text(est, 'combustivel', 'Não informado'))],
      ['Chassi', text(bin, 'chassi', text(est, 'chassi', 'Não informado'))],
      ['Motor', text(bin, 'motor', text(est, 'motor', 'Não informado'))],
      ['Renavam', text(bin, 'renavam', text(est, 'renavam', 'Não informado'))],
      ['Município', text(bin, 'municipio', text(est, 'municipio', 'Não informado'))],
      ['UF', text(bin, 'uf', text(est, 'uf', 'Não informado'))],
      ['Situação', text(est, 'situacaoVeiculo', text(est, 'situacao', 'Não informado'))],
    ],
    baseBin: binHasData ? binPairsAll : [],
    baseBinStatus: binHasData ? '' : (binUnavailableMsg ? (isIndisponivelMsg(binUnavailableMsg) ? `BIN indisponível: ${formatTextBlock(binUnavailableMsg)}` : formatTextBlock(binUnavailableMsg)) : (hasMeaningful(bin) ? '' : 'BIN indisponível no momento da consulta.')),
    baseEstadual,
    proprietario: { atual: proprietarioTxt ? proprietarioTxt : 'Consulte a base estadual para informação do proprietário.' },
    debitos: { itens: debitosItens, texto: '' },
    gravame: gravameRegs,
    recall: recallFmt,
    restricoes: restricoesStatus,
    restricoesTexto,
    comparativo,
    vendaDireta: { status: (r.vendaDireta && (asRecord(r.vendaDireta).constaVendaDireta || isPositiveMsg(asRecord(r.vendaDireta).resposta))) ? 'alerta' : 'ok', titulo: (r.vendaDireta && isPositiveMsg(asRecord(r.vendaDireta).resposta)) ? norm(asRecord(r.vendaDireta).resposta) : (r.vendaDireta && asRecord(r.vendaDireta).constaVendaDireta ? 'Consta venda direta' : 'Nada consta') },
    eventoCorporativo: { status: (r.eventoCorporativo && (asRecord(r.eventoCorporativo).constaEventoCorporativo || isPositiveMsg(asRecord(r.eventoCorporativo).resposta))) ? 'alerta' : 'ok', titulo: (r.eventoCorporativo && isPositiveMsg(asRecord(r.eventoCorporativo).resposta)) ? norm(asRecord(r.eventoCorporativo).resposta) : (r.eventoCorporativo && asRecord(r.eventoCorporativo).constaEventoCorporativo ? 'Consta evento corporativo' : 'Nada consta') },
    parecer,
    sinistroCortesia: { status: sinistroPos ? 'alerta' : 'ok', titulo: sinistroPos ? (norm(sinistro.resposta) || 'Consta sinistro') : 'Nada consta' },
    indicioSinistroCortesia: { status: indicioPos ? 'alerta' : 'ok', titulo: indicioPos ? (indicioMsg || 'Consta indício de sinistro') : 'Nada consta' },
    comercializacao: { texto: comercializacaoTexto, destaque: comercializacaoPos },
    comunicacaoVenda: formatTextBlock(cv.resposta || cv.mensagem || ''),
    leilao: leilaoRegs,
    leilaoStatus: leilaoHas && !leilaoRegs.length ? (formatTextBlock(leilao.resposta as string) || 'Consta oferta em leilão') : '',
    rouboFurto: rfPositive ? { possuiHistorico: true, mensagem: rfMensagemFmt || 'Consta histórico de roubo/furto', registros: rfRegs } : (rfMsg && (isNadaConstaMsg(rfMsg) || /negativ/i.test(rfMsg)) ? { possuiHistorico: false, mensagem: formatTextBlock(rfMsg), registros: [] } : null),
    informacoesComplementares,
    duplicidadeMotor,
    csv: csvInfo,
    detalhamentoRenajud,
    historicoFipe,
    odometro: Array.isArray(r.odometro) ? r.odometro : [],
  };
  return data;
}

export async function goldReportHtml(input: CompanyResponse, plate: string, status: string, message: string) {
  const data = buildData(input, plate, status, message);
  const template = await getActiveTemplateHtml();
  return template.replace('__DATA__', JSON.stringify(data));
}

export async function renderGoldPdf(response: CompanyResponse, plate: string, status: string, message: string) {
  const html = await goldReportHtml(response, plate, status, message);
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: typeof executablePath === 'string' ? executablePath : await executablePath });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.emulateMediaType('print');
    await page.setContent(html, { waitUntil: 'load' });
    return await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' } });
  }
  finally { await browser.close(); }
}

export const reportHash = (pdf: Buffer) => crypto.createHash('sha256').update(pdf).digest('hex');
