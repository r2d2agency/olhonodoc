import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import type { CompanyResponse } from '@/lib/company-conferi';
import { MODEL_HTML_TEMPLATE } from '@/lib/gold-report-template';
import { getActiveTemplateHtml } from '@/lib/admin/report-templates';
import { isNegative, isPositive, compareKey, stripBrand, plateWithDash, money, numberBR, dateBR, situacaoLabel } from '@/lib/gold-report-layout';

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
  if (!u) return true;
  if (['NADA CONSTA', 'NAO CONSTA', 'NÃO CONSTA', 'NÃO HÁ', 'NAO HA', 'SEM REGISTRO', '0', '0,00', '0.00', 'FALSE'].includes(u)) return true;
  // "NAO CONSTA DEBITO", "NÃO POSSUI...", "NENHUM REGISTRO"... também são negativos
  if (/^(NAO|NÃO|NENHUM|SEM)\b/.test(u)) return true;
  if (u === 'INEXISTENTE' || u === 'NAO APLICAVEL' || u === 'NÃO APLICÁVEL') return true;
  return false;
};
const isIndisponivelMsg = (v: unknown) => /indispon/i.test(norm(v));
const isNadaConstaMsg = (v: unknown) => /nada consta|nao consta|não consta/i.test(norm(v));
const isPositiveMsg = (v: unknown) => {
  const s = norm(v);
  if (!s) return false;
  if (isNadaConstaMsg(s) || isIndisponivelMsg(s)) return false;
  const u = s.toUpperCase();
  if (['NÃO', 'NAO', 'N', 'NEGATIVO', 'OK', '0', '0,00', '0.00', 'FALSE', 'N/D'].includes(u)) return false;
  if (/^0([.,]0+)?$/.test(u)) return false;
  if (/^(não|nao|sem|nenhum)\b/.test(s.toLowerCase())) return false;
  return true;
};

function fixSpacing(s: string): string {
  if (!s) return s;
  s = s.replace(/\r\n?/g, '\n').replace(/\t+/g, ' ');
  // ensure space after sentence punctuation when glued (but NOT inside timestamps like 00:00:00 or dates)
  // Só insere espaço após pontuação de sentença, nunca dentro de números/códigos
  s = s.replace(/([.!?])([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1 $2');
  // Corrige palavras coladas comuns em textos da Company, sem tocar em códigos alfanuméricos
  s = s.replace(/\b(NAO|NÃO)(\w+)/g, '$1 $2').replace(/\b(VEICULO|CIDADE|ESTADO)(\w+)/g, '$1 $2');
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

const LABEL_FRIENDLY: Record<string, string> = {
  cpfcnpjarrendatar: 'CPF/CNPJ do arrendatário',
  estadualintencaogravamerestricaofinanceira: 'Restrição financeira (intenção de gravame)',
  estadualintencaogravameagente: 'Agente (intenção de gravame)',
  estadualintencaogravamenomefinanciado: 'Nome do financiado (intenção)',
  estadualintencaogravamedocumentofinanciado: 'Documento do financiado (intenção)',
  estadualgravamenomeagente: 'Nome do agente financeiro',
  estadualgravamenumerocontrato: 'Número do contrato (gravame)',
  estadualgravamedocumentofinanciado: 'Documento do financiado (gravame)',
  estadualgravamedatagravame: 'Data do gravame',
  estadualgravamevigenciacontrato: 'Vigência do contrato',
  estadualgravamecodigoagente: 'Código do agente financeiro',
  lichexelic: 'Licenciamento exercício anterior',
  debcetesb: 'Débito CETESB',
  debitoder: 'Débito DER',
  debitodersa: 'Débito DER/SA',
  dado: 'Dado consultado',
  infracaorenainf: 'Infração RENAINF',
};
function formatLabel(key: string): string {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (LABEL_FRIENDLY[normalizedKey]) return LABEL_FRIENDLY[normalizedKey];
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

function maskDocument(value: string): string {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  if (digits.length === 14) return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/****-**`;
  return value ? '***' : value;
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

// Fallback: localiza array de ocorrências de roubo/furto em qualquer nível
// (ex.: historicoRouboFurto.historico.rouboFurto[])
function rfHistoricoFallback(root: unknown): unknown {
  const found = findDeepKeyMatch(root, [/roubo.*furto|furtos?/i]);
  if (!found) return undefined;
  const v = found.value;
  if (Array.isArray(v)) return v;
  const inner = asRecord(v);
  for (const k of ['rouboFurto', 'roubos', 'registros', 'ocorrencias', 'itens', 'historico']) {
    const cand = inner[k];
    if (Array.isArray(cand)) return cand;
    if (cand && typeof cand === 'object') {
      const deep = asRecord(cand);
      for (const k2 of ['rouboFurto', 'roubos', 'registros', 'ocorrencias', 'itens']) {
        if (Array.isArray(deep[k2])) return deep[k2];
      }
    }
  }
  return undefined;
}

function collectSectionRecords(value: unknown): Record<string, string>[] {
  if (Array.isArray(value)) return registrosFromArray(value);
  if (value && typeof value === 'object') {
    const rec = asRecord(value);
    // common wrappers
    for (const k of ['detalhes', 'detalhe', 'registros', 'itens', 'historico', 'ocorrencias', 'dados', 'lista', 'processos']) {
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
    const semDebito = sitNorm.includes('NAO CONSTA') || sitNorm.includes('NÃO CONSTA') || sitNorm.includes('SEM DEBITO') || /^0([.,]0+)?$/.test(sitNorm);
    const consta = !semDebito && (sitNorm.includes('CONSTA DEBITO') || sitNorm === 'CONSTA');
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
      const valorZero = valorBlank || /^0([.,]0+)?$/.test(norm(valorRaw).replace(/^R\$\s*/, ''));
      pendente = valorZero ? false : /DEBITO|PEND|MULTA/.test(sitNorm);
    } else {
      situacao = 'Não informado';
      valor = valorBlank ? 'Não informado' : formatMoneyBRL(valorRaw);
    }

    itens.push({ descricao: def.descricao, situacao, valor, pendente });
  }
  return itens;
}
function deriveParecer(r: Record<string, unknown>, parecer: Record<string, unknown>, alertas: { tipo: string }[]) {
  // A cor enviada pela Company é soberana — nunca recalcular quando presente.
  const corRaw = upper(parecer.cor || parecer.nivel || parecer.classificacao);
  const nivelFromJson = corRaw.includes('VERM') ? 'vermelho' : corRaw.includes('AMAR') || corRaw.includes('ATEN') || corRaw.includes('LARAN') ? 'amarelo' : corRaw.includes('VERD') ? 'verde' : '';
  if (nivelFromJson) {
    const detalheJson = norm(parecer.texto || parecer.observacao || parecer.descricao || parecer.mensagem);
    const resumoPadrao = nivelFromJson === 'verde'
      ? 'Nenhum apontamento crítico identificado nos indicadores consultados. Veículo sem alertas relevantes no momento da consulta.'
      : nivelFromJson === 'amarelo'
        ? 'Foram identificados pontos que exigem atenção. Recomenda-se análise cuidadosa antes da negociação.'
        : 'Foram identificados apontamentos críticos. Recomenda-se cautela e verificação detalhada antes de qualquer negociação.';
    return { nivel: nivelFromJson, resumo: formatTextBlock(detalheJson ? resumoPadrao + ' ' + detalheJson : resumoPadrao) };
  }
  let nivel = '';
  const sin = asRecord(r.sinistro);
  const ind = asRecord(r.indicioSinistro2 || r.indicioSinistro);
  const rf = asRecord(r.historicoRouboFurto || r.rouboFurto);
  const grav = asRecord(r.gravame);
  const leilao = asRecord(r.leilao);
  const com = asRecord(r.comercializacao);
  const est = asRecord(r.estadual);
  const cv = asRecord(r.comunicacaoVenda);
  const rfCodigo = norm(rf.alertaCodigo);
  const rfNegativo = ['0', 'NAO', 'NÃO', 'NEGATIVO'].includes(upper(rfCodigo)) || /^(NAO|NÃO)\b/.test(upper(rf.alertaMensagem));
  const hasSinistro = ['SIM', '1', 'S', 'TRUE'].includes(upper(sin.resposta)) || (/CONSTA/i.test(norm(sin.mensagem)) && !/NAO|NÃO/i.test(norm(sin.mensagem)));
  const hasRoubo = !rfNegativo && ((Array.isArray(rf.registros) && rf.registros.length > 0) || isPositiveMsg(rf.alertaMensagem) || upper(rf.alertaCodigo) === 'SIM' || /SIM|CONSTA|POSITIV/i.test(upper(rf.resposta)));
  const hasRestrJud = !nadaConsta(est.restricaoJudicial) && !nadaConsta(est.restricaoRenajud) && !nadaConsta(est.restricaoJudicialRenajud);
  const gravames = Array.isArray(grav.gravame) ? grav.gravame : Array.isArray(grav.registros) ? grav.registros : [];
  const hasGravAtivo = gravames.length > 0 && gravames.some((g: unknown) => {
    const gg = asRecord(g);
    const sit = upper(gg.situacao || gg.statusVeiculo);
    return /ATIV|CONSTA|GRAVAD/.test(sit) && !/CANCELAD|BAIXAD/.test(sit);
  });
  const hasLeilao = Array.isArray(asRecord(leilao.leiloes).leilao) ? (asRecord(leilao.leiloes).leilao as unknown[]).length > 0 : Array.isArray(leilao.leiloes) ? (leilao.leiloes as unknown[]).length > 0 : Array.isArray(leilao.registros) ? (leilao.registros as unknown[]).length > 0 : isPositiveMsg(leilao.resposta);
  const hasComunicVenda = isPositiveMsg(cv.mensagem) && !nadaConsta(cv.mensagem);
  const hasComercial = ['1', 'SIM', 'S', 'TRUE'].includes(upper(com.resposta)) || (isPositiveMsg(com.mensagem) && !nadaConsta(com.mensagem));
  const hasIndicio = ['1', 'SIM', 'S', 'TRUE'].includes(upper(ind.resposta)) || (isPositiveMsg(ind.mensagem) && !nadaConsta(ind.mensagem));
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

export function buildData(response: CompanyResponse, plate: string, status: string, message: string) {
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
  const sinistroTxt = formatTextBlock(sinistro.mensagem || sinistro.resposta || '');
  if (sinistroPos) alertas.push({ icone: 'sinistro', texto: sinistroTxt || 'Consta sinistro de indenização integral', tipo: 'alerta' });

  // Leilão
  const leiloesRaw = asRecord(leilao.leiloes).leilao ?? leilao.leiloes ?? leilao.registros;
  const leiloesArr: unknown[] = Array.isArray(leiloesRaw) ? leiloesRaw : leiloesRaw && typeof leiloesRaw === 'object' ? [leiloesRaw] : [];
  if (leiloesArr.length || isPositiveMsg(leilao.resposta)) alertas.push({ icone: 'leilao', texto: 'Consta oferta em leilão', tipo: 'alerta' });

  // Comercialização - prioriza a mensagem descritiva; resposta "1"/"0" é só flag
  const comercialFlagSim = ['1', 'SIM', 'S', 'TRUE'].includes(upper(comercial.resposta));
  const comercialTxt = comercialFlagSim
    ? 'Consta comercialização por seguradora'
    : (isNadaConstaMsg(comercial.mensagem) || isNadaConstaMsg(comercial.resposta) ? '' : norm(comercial.mensagem || comercial.resposta));
  if (comercialTxt && isPositiveMsg(comercialTxt)) {
    alertas.push({ icone: 'info', texto: comercialTxt, tipo: 'alerta' });
  }

  // Roubo/Furto - ONLY on positive record/alert, never on negative
  // (cobre historico.rouboFurto[] aninhado e ocorrencias[])
  const rfHist = asRecord(rf.historico);
  const rfRaw = rf.registros ?? rfHist.rouboFurto ?? rfHist.roubos ?? rfHistoricoFallback(r) ?? rf.ocorrencias;
  const rfReg = Array.isArray(rfRaw) ? rfRaw : rfRaw ? [rfRaw] : [];
  const rfCodigo = upper(rf.alertaCodigo);
  const rfMsg = norm(rf.alertaMensagem || rf.mensagem || rf.resposta);
  const rfCodigoNegativo = ['0', 'NAO', 'NÃO', 'NEGATIVO'].includes(rfCodigo) || /^(NAO|NÃO)\b/.test(rfMsg);
  const rfPositive = !rfCodigoNegativo && (rfReg.length > 0 || rfCodigo === 'SIM' || /POSITIV|CONST|ROUB|FURT/i.test(rfCodigo) || (isPositiveMsg(rfMsg) && /roub|furt|consta/i.test(rfMsg)));
  if (rfPositive) {
    const texto = /roub|furt/i.test(rfMsg) && isPositiveMsg(rfMsg) ? rfMsg : 'Consta histórico de roubo/furto';
    alertas.push({ icone: 'roubo', texto, tipo: 'alerta' });
  }

  // Restrições judiciais — só considera campos com conteúdo efetivamente positivo
  const restKeys = Object.keys(est).filter(k => /restric|renajud|renainf|judicial/i.test(k));
  const hasRestricao = restKeys.some(k => {
    const v = est[k];
    if (isBlank(v) || nadaConsta(v)) return false;
    const u = upper(v);
    // "0,00", "0", "N/D" e valores numéricos zero não são restrição
    if (/^0([.,]0+)?$/.test(u) || u === 'N/D' || u === 'NA') return false;
    return true;
  });
  if (hasRestricao) alertas.push({ icone: 'judicial', texto: 'Restrição judicial', tipo: 'alerta' });

  // Indício de sinistro - only when Company returns positive
  const indicioMsg = norm(indicio.mensagem || indicio.resposta);
  const indicioPos = isPositiveMsg(indicioMsg) && /ind[íi]cio|consta|sinistr/i.test(indicioMsg);
  // (shown in section/parecer; top alert not mandated but keep logic consistent via section)

  // BIN: if object has meaningful data, show it. If only unavailable markers, surface as indisponível note but don't hide real data.
  const BIN_DROP = new Set(['docproprietario', 'nomeproprietario', 'ultimaatualizacao', 'restricoes', 'restricao1', 'restricao2', 'restricao3', 'restricao4', 'ocorrencias', 'restricaorenainf', 'restricaorenajud', 'situacaorestricoes', 'comparativo']);
  const binPairsAll = pairsFromObject(bin, { formatKeys: true, dropKeys: BIN_DROP });
  const binHasData = hasMeaningful(bin) && binPairsAll.length > 0;
  const binUnavailableMsg = !binHasData ? (findDeep(bin, ['mensagem', 'status', 'descricao', 'resposta']) as string | undefined) : undefined;

  // Base Estadual - include all fields, formatted labels, preserve values
  // (exceto as chaves de débito, que têm seção própria "Débitos e multas")
  const DEBITO_KEYS = new Set(['debitomulta', 'existedebitomulta', 'debitoipva', 'existedebitoipva', 'debitolicenciamento', 'existedebitolicenciamento', 'debitodpvat', 'existedebitodpvat', 'dadosatualis', 'dadosatuals', 'dadosatual', 'dadosatuais', 'ultimaatualizacao', 'ultimaatualizacaoveiculo', 'odometro', 'historicoOdometro', 'detran']);
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
  const gravameDrop = ['cpfcnpjagente', 'cpfcnpj', 'cpf_cnpj', 'cnpjcpf', 'telefone', 'email', 'endereco', 'endereço', 'logradouro', 'numero', 'bairro', 'cidade', 'municipio', 'ufagente', 'cep', 'contrato', 'documento'];
  // Gravame - objeto gravame.gravame[] com os registros; fallback para formatos alternativos
  const gravamesArr: unknown[] = Array.isArray(grav.gravame) ? grav.gravame : Array.isArray(grav.gravames) ? grav.gravames : Array.isArray(grav.registros) ? grav.registros : grav.resposta && hasMeaningful(grav) ? [grav] : [];
  const gravameRegs = registrosFromArray(gravamesArr, { dropKeys: gravameDrop }).map((reg) => {
    // Mascara documento do financiado (CPF/CNPJ) — dado sensível
    for (const k of Object.keys(reg)) {
      if (/documento|cpf|cpfcnpj/i.test(k) && /^\d{11,14}$/.test(String(reg[k]).replace(/\D/g, ''))) {
        reg[k] = maskDocument(reg[k]);
      }
    }
    return reg;
  });

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

  // Recall (cobre chaves capitalizadas Mensagem/Mensagem2 da Company)
  const recallMsg1 = norm(recall.resposta || recall.Resposta || recall.mensagem || recall.Mensagem);
  const recallMsg2 = norm(recall.Mensagem2 || recall.mensagem2);
  const recallTxt = recallMsg1 && recallMsg2 && recallMsg2 !== recallMsg1 ? recallMsg1 + ' ' + recallMsg2 : recallMsg1 || recallMsg2;
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

  // Comparativo automático: agregados (fábrica) × bin (estadual), quando a Company não envia comparativo pronto
  if (!comparativo?.length && hasMeaningful(agg) && hasMeaningful(bin)) {
    const componentes = [
      ['Marca', 'marca', 'marca'], ['Modelo', 'modelo', 'modelo'], ['Cor', 'cor', 'cor'],
      ['Chassi', 'chassi', 'chassi'], ['Renavam', 'renavam', 'renavam'], ['Motor', 'motor', 'motor'],
      ['Ano fabricação', 'anoFabricacao', 'anoFabricacao'], ['Ano modelo', 'anoModelo', 'anoModelo'],
      ['Combustível', 'combustivel', 'combustivel'], ['Cilindradas', 'cilindradas', 'cilindradas'],
      ['Potência', 'potencia', 'potencia'], ['Capacidade de carga', 'capacidadeCarga', 'capacidadeCarga'],
      ['Tipo de carroceria', 'tipoCarroceria', 'tipoCarroceria'], ['Quantidade de eixos', 'eixos', 'numeroEixos'],
      ['Tipo de chassi', 'tipoChassi', 'tipoChassi'], ['Caixa de câmbio', 'caixaCambio', 'caixaCambio'],
      ['Espécie', 'especie', 'especie'], ['Procedência', 'procedencia', 'procedencia'],
      ['Lotação', 'lotacao', 'lotacao'], ['Município', 'municipio', 'municipio'],
    ] as const;
    // Normaliza para comparação: maiúsculas, sem acentos, sem espaços/pontuação e sem prefixo de marca
    const compKey = (v: unknown, marcaRaw?: unknown) => {
      let s = norm(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (marcaRaw) {
        const m = norm(marcaRaw).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (m && s.startsWith(m)) s = s.slice(m.length);
      }
      return s;
    };
    const marcaComp = compKey(agg.marca);
    comparativo = componentes.map(([rotulo, aggKey, binKey]) => {
      const fabrica = norm(agg[aggKey]);
      const estadual = norm(bin[binKey]);
      const fKey = compKey(fabrica, rotulo === 'Modelo' ? marcaComp : undefined);
      const eKey = compKey(estadual, rotulo === 'Modelo' ? marcaComp : undefined);
      const st: 'ok' | 'diferente' | 'na' = !fabrica || !estadual ? 'na' : (fKey === eKey || (!fKey || !eKey)) ? 'ok' : 'diferente';
      return {
        componente: rotulo,
        fabrica: fabrica || '-',
        estadual: estadual || '-',
        comparativo: st === 'ok' ? 'Confere' : st === 'diferente' ? 'Divergente' : '-',
        status: st,
      };
    }).filter(x => x.status !== 'na' || x.fabrica !== '-' || x.estadual !== '-');
    if (!comparativo.length) comparativo = undefined;
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
  let renajud = r.renajudDetalhado ?? r.detalhamentoRenajud ?? r.detalhamento_renajud ?? r.renajudDetalhamento ?? est.detalhamentoRenajud ?? est.renajud ?? r.renajud;
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

  // Detran (dados complementares de CRLV, multas, autuações e informações do veículo)
  const detran = asRecord(r.detran);
  const detranUrl = norm(detran.url || r.detranUrl || '');
  const detranCrLv = asRecord(detran.crlv);
  const detranMultas = asRecord(detran.multas);
  const detranAutuacoes = asRecord(detran.autuacoes);
  const detranInfo = asRecord(detran.informacoesVeiculo);
  const detranDebitos = asRecord(detran.debitos);
  const detranOdometro = asRecord(detran.odometro);

  // Decodificador de chassi (dados do fabricante)
  const decodificador = asRecord(r.decodificador);

  const proprietarioTxt = norm(bin.nomeProprietario || bin.proprietario || est.proprietario || est.nomeProprietario);

  // ===== ESTRUTURA SEGUNDO ESPECIFICAÇÃO (27 itens) =====
  const placaFmt = plateWithDash(plate);
  const specBin = plateWithDash(bin.placa) || placaFmt;
  const specEst = plateWithDash(est.placa) || placaFmt;

  // 4. Informações do veículo — Base Nacional (campos exatos)
  const chassiFmt = norm(bin.chassi || '');
  const tipoChassiFmt = upper(bin.tipoChassi) === 'N' ? 'NORMAL' : upper(bin.tipoChassi);
  const veiculoNacional: string[][] = [
    ['Placa', specBin],
    ['Situação', situacaoLabel(bin.situacao)],
    ['Marca/Modelo', norm(bin.marca) + ' / ' + stripBrand(bin.modelo, bin.marca)],
    ['Tipo de veículo', norm(bin.tipoVeiculo)],
    ['Ano fabricação/Ano modelo', norm(bin.anoFabricacao) + ' / ' + norm(bin.anoModelo)],
    ['Procedência', norm(bin.procedencia)],
    ['Município/UF', norm(bin.municipio) + ' / ' + upper(bin.Uf || bin.uf)],
    ['Chassi', chassiFmt + (tipoChassiFmt ? ' ' + tipoChassiFmt : '')],
    ['Motor', norm(bin.motor)],
    ['Renavam', norm(bin.renavam)],
    ['Combustível', norm(bin.combustivel)],
    ['Cor', norm(bin.cor)],
    ['Capacidade de passageiros', norm(bin.lotacao)],
    ['Espécie', norm(bin.especie)],
    ['Cilindradas', numberBR(bin.cilindradas)],
    ['Peso bruto (PBT)', numberBR(bin.pbt)],
    ['Peso bruto (CMT)', numberBR(bin.cmt)],
    ['Potência', norm(bin.potencia)],
    ['Capacidade de carga', norm(bin.capacidadeCarga)],
    ['Eixo', numberBR(bin.numeroEixos)],
    ['Eixo Traseiro Dif', norm(bin.numeroEixoTraseiro)],
    ['Eixo auxiliar', norm(bin.numeroEixoAuxiliar)],
  ];

  // 5. Restrições e outras informações (texto corrido)
  const restricoesBin = norm(bin.restricoes);
  const restricoesIndividuais = ['restricao1', 'restricao2', 'restricao3', 'restricao4', 'restricaoRenainf', 'restricaoRenajud', 'ocorrencias']
    .map(k => norm(bin[k])).filter(v => v && !isNegative(v));
  const todasRestricoes = Array.from(new Set([restricoesBin, ...restricoesIndividuais].filter(v => v && !isNegative(v))));
  const restricoesTextoSpec = todasRestricoes.length ? todasRestricoes.join(',') : 'NADA CONSTA';

  // 5b. Queixa e histórico de roubo/furto
  const queixaAtiva = !isNegative(bin.ocorrencias) && !/NAO POSSUI OCORRENCIA/i.test(norm(bin.ocorrencias));
  const historicoRfAtivo = isPositive(rf.alertaCodigo) || !isNegative(est.restricaoFurto);

  // 6. Histórico de ocorrências
  const ocorrenciasRaw = asRecord(rf.historico).rouboFurto;
  const ocorrenciasArr = Array.isArray(ocorrenciasRaw) ? ocorrenciasRaw : [];
  const ocorrencias = ocorrenciasArr.map((item: unknown) => {
    const o = asRecord(item);
    const ano = (norm(o.anoBo).match(/\d{4}/) || [])[0] || '';
    return {
      ocorrencia: norm(o.ocorrencia),
      ano,
      orgaoSeguranca: norm(o.orgaoSeguranca),
      numeroBo: /NAO INFORMADO/i.test(norm(o.numeroBo)) ? '' : norm(o.numeroBo),
      municipioUf: norm(o.municipioOcorrencia) + ' / ' + norm(o.Ufocorrencia),
      dataOcorrencia: dateBR(o.dataOcorrencia),
    };
  });

  // 7. Comparativo de componentes (4 linhas)
  const compLinha = (rotulo: string, va: unknown, ve: unknown) => {
    const a = norm(va), e = norm(ve);
    const status = !a || !e ? 'na' : compareKey(a) === compareKey(e) ? 'ok' : 'diferente';
    return { componente: rotulo, fabrica: a || '-', estadual: e || '-', status };
  };
  const comparativoSpec = [
    compLinha('Chassi', agg.chassi, est.chassi),
    compLinha('Motor', agg.motor, est.motor),
    compLinha('Cor', upper(agg.cor), upper(est.cor)),
    compLinha('Combustível', upper(agg.combustivel), upper(est.combustivel)),
  ];

  // 8. E-Decodificador de chassi
  const decSpec: string[][] = [
    ['Chassi', norm(decodificador.Chassi)],
    ['Origem', norm(agg.procedencia)],
    ['Região', norm(decodificador.Regiao)],
    ['País', norm(decodificador.Pais)],
    ['Montadora', norm(decodificador.Fabricante)],
    ['Categoria', norm(decodificador.TipoVeiculo)],
    ['Marca', norm(decodificador.Marca)],
    ['Modelo', norm(decodificador.Modelo)],
    ['Versão', norm(decodificador.Versao)],
    ['Carroceria', norm(decodificador.Carroceria)],
    ['Ano Fabricação', norm(decodificador.AnoFab)],
    ['Ano Modelo', norm(decodificador.AnoMod)],
    ['Cilindradas', numberBR(agg.cilindradas)],
    ['Combustível', norm(decodificador.Combustivel)],
  ];

  // 9. Base estadual (Cortesia) — campos exatos
  const chassiEstFmt = norm(est.chassi) + (norm(est.tipoChassi) ? ' ' + norm(est.tipoChassi) : '');
  const baseEstadualSpec: string[][] = [
    ['Placa', specEst],
    ['Situação', situacaoLabel(est.situacao)],
    ['Marca/Modelo', norm(est.marca) + ' / ' + stripBrand(est.modelo, est.marca)],
    ['Tipo de veículo', norm(est.tipoVeiculo)],
    ['Categoria', norm(est.categoria)],
    ['Ano fabricação/Ano modelo', norm(est.anoFabricacao) + ' / ' + norm(est.anoModelo)],
    ['Procedência', norm(est.procedencia)],
    ['Município/UF', norm(est.municipio) + ' / ' + upper(est.uf)],
    ['Chassi', chassiEstFmt],
    ['Motor', norm(est.motor)],
    ['Renavam', norm(est.renavam)],
    ['Combustível', norm(est.combustivel)],
    ['Cor', norm(est.cor)],
    ['Capacidade de passageiros', norm(est.qtdPassageiros)],
    ['Potência', norm(est.potencia)],
    ['Cilindradas', norm(est.cilindradas)],
    ['Espécie', norm(est.especie)],
    ['Capacidade de carga', norm(est.capacidadeCarga)],
  ];

  // 11. Débitos do veículo — 3 linhas
  const debitoSpec = (situacao: unknown, valor: unknown, alwaysShow = false) => {
    const v = norm(valor).replace(/^R\$\s*/, '');
    if (!alwaysShow && /^0([.,]0+)?$/.test(v)) return { situacao: 'Consultar Detran / Sefaz', valor: 'R$ *' };
    return { situacao: norm(situacao), valor: money(valor) };
  };
  const debitosSpec = [
    { descricao: 'Multas', ...debitoSpec(est.existeDebitoMulta, est.debitoMulta) },
    { descricao: 'IPVA', ...debitoSpec(est.existeDebitoIPVA, est.debitoIpva) },
    { descricao: 'Licenciamento', ...debitoSpec(est.existeDebitoLicenciamento, est.debitoLicenciamento, true) },
  ];

  // 12. Licenciamento (condicional)
  const licenciamentoAno = norm(est.licexelic);

  // 13. Restrições — 7 linhas, texto simples
  const restricoesSpec: { rotulo: string; valor: string; positivo: boolean }[] = [
    { rotulo: 'Roubo e Furto', valor: norm(est.restricaoFurto), positivo: isPositive(est.restricaoFurto) },
    { rotulo: 'Restrição Administrativa', valor: norm(est.restricaoAdm), positivo: isPositive(est.restricaoAdm) },
    { rotulo: 'Restrição Tributária', valor: norm(est.restrTributaria), positivo: isPositive(est.restrTributaria) },
    { rotulo: 'Restrição Judiciária', valor: norm(est.restricaoJudicial), positivo: isPositive(est.restricaoJudicial) },
    { rotulo: 'Restrição Financeira', valor: norm(est.restricaoFinanceira), positivo: isPositive(est.restricaoFinanceira) },
    { rotulo: 'Comunicação de Venda', valor: norm(est.comunicacaoVendaAtiva), positivo: isPositive(est.comunicacaoVendaAtiva) },
    { rotulo: 'Restrição Jurídica', valor: norm(est.restricoesRenajud), positivo: isPositive(est.restricoesRenajud) },
  ];

  // 14. Outras restrições (condicional)
  const outrasRestricoes = Array.from(new Set([
    ...['restricoes_01', 'restricoes_02', 'restricoes_03', 'restricoes_04', 'restricoes_05'].map(k => norm(est[k])),
    norm(est.outrasRestricoes),
  ].filter(v => v && isPositive(v)).map(v => v.toUpperCase())));

  // 15. Histórico de Odômetro
  const odometroHistorico = asRecord(est.HistoricoOdometro);
  const odometroItens = Array.isArray(odometroHistorico.Odometro) ? odometroHistorico.Odometro : [];
  const odometroSpec = odometroItens.map((item: unknown) => {
    const o = asRecord(item);
    const km = norm(o.Quilometragem || o.km || o.valorOdometro);
    return `${dateBR(o.DataVistoria || o.data)} - ${numberBR(km)} km`;
  }).filter(Boolean);

  // 16. Duplicidade de Motor
  const dupRaw = asRecord(asRecord(dupMotor).duplicidades).duplicidade;
  const dupArr = Array.isArray(dupRaw) ? dupRaw : [];
  const chassiConsulta = norm(bin.chassi || est.chassi);
  const duplicidades = dupArr.map((item: unknown) => asRecord(item))
    .filter(d => compareKey(d.chassi) !== compareKey(chassiConsulta))
    .map(d => ({
      placa: plateWithDash(d.placa),
      chassi: norm(d.chassi),
      marcaModelo: norm(d.marca) + ' / ' + norm(d.modelo),
      cor: norm(d.cor),
      uf: norm(d.Uf || d.uf),
      ano: norm(d.anoFabricacao) + ' / ' + norm(d.anoModelo),
    }));

  // ===== ITENS RESTANTES DO RELATÓRIO =====
  // 3. Dados de Fabricação do Veículo (agregados) — 33 campos
  const fabricacao: string[][] = [
    ['Placa', plateWithDash(agg.placa)],
    ['Marca/Modelo', norm(agg.marca) + ' / ' + stripBrand(agg.modelo, agg.marca)],
    ['Chassi', norm(agg.chassi)],
    ['Motor', norm(agg.motor)],
    ['Combustível', norm(agg.combustivel)],
    ['Cor', norm(agg.cor)],
    ['Tipo de veículo', norm(agg.tipoVeiculo)],
    ['Município/UF', norm(agg.municipio) + ' / ' + upper(agg.Uf || agg.uf)],
    ['Ano fabricação', norm(agg.anoFabricacao)],
    ['Ano modelo', norm(agg.anoModelo)],
    ['UF de Origem', norm(agg.UfDeOrigem)],
    ['UF Faturado', norm(agg.uf_faturado)],
    ['Caixa de câmbio', norm(agg.caixaCambio)],
    ['Situação', norm(agg.situacao)],
    ['Espécie', norm(agg.especie)],
    ['Lotação', norm(agg.lotacao)],
    ['Potência', norm(agg.potencia)],
    ['Carroceria', norm(agg.tipoCarroceria)],
    ['Cilindradas', norm(agg.cilindradas)],
    ['Procedência', norm(agg.procedencia)],
    ['Situação Chassi', upper(agg.tipoChassi) === 'N' ? 'Normal' : norm(agg.tipoChassi)],
    ['Capacidade carga', norm(agg.capacidadeCarga)],
    ['Eixo traseiro', norm(agg.eixoTraseiro)],
    ['Terceiro eixo', norm(agg.terceiroEixo)],
    ['Documento importadora', norm(agg.tipoDocImportadora)],
    ['Identidade importadora', norm(agg.identImportadora) === '0' ? '' : norm(agg.identImportadora)],
    ['Número DI', norm(agg.numeroDI) === '0' ? '' : norm(agg.numeroDI)],
    ['Fabricante', norm(agg.fabricante)],
    ['Segmento', norm(agg.segmento)],
    ['Grupo modelo veículo', norm(agg.grupoModeloVeiculo)],
    ['Capacidade máxima tração', norm(agg.capMaximaTracao)],
    ['Peso bruto', norm(agg.pesoBrutoTotal)],
    ['Última atualização', dateBR(agg.ultimaAtualizacao)],
  ];

  // 19. Gravame (layout A)
  const gravameFormatado = gravameRegs.map((g) => {
    const situacao = upper(g['Situacao'] || g['situacao'] || '');
    return {
      placa: norm(g['Placa']),
      chassi: norm(g['Chassi']),
      renavam: norm(g['Renavam']),
      uf: norm(g['Uf']),
      ufPlaca: '-',
      nomeFinanciado: norm(g['Nome Financiado']),
      nomeAgente: norm(g['Nome Financeira']),
      dataContrato: norm(g['Data Gravame']),
      dataGravame: '-',
      numeroGravame: '-',
      statusVeiculo: situacao === 'ATUAL' ? 'ATUAL' : situacao === 'HISTÓRICO' ? 'HISTÓRICO' : situacao || '-',
      descricaoStatus: '-',
    };
  });

  // 20. Sinistro — mensagem exata
  const sinistroSpec = sinistroPos ? 'EXISTE SINISTRO DE INDENIZAÇÃO INTEGRAL' : 'NÃO ENCONTRADO SINISTRO DE INDENIZAÇÃO INTEGRAL NAS BASES CONSULTADAS';

  // 24. Indício de sinistro (cortesia)
  const indicioPosSpec = ['1', 'SIM', 'S', 'TRUE'].includes(upper(indicio.resposta));
  const indicioSpec = indicioPosSpec ? 'ENCONTRADO INDÍCIO DE SINISTRO NAS BASES CONSULTADAS' : 'NÃO ENCONTRADO INDÍCIO DE SINISTRO NAS BASES CONSULTADAS';

  // 17. Detran completo (6 sub-blocos)
  const detranInfoFmt = [
    ['Placa', norm(detranInfo.placa)], ['Situação do Veículo', norm(detranInfo.situacaoVeiculo)],
    ['Renavam', norm(detranInfo.renavam)], ['Chassi', norm(detranInfo.chassi)],
    ['Marca/Modelo', norm(detranInfo.marcaModelo)], ['Município', norm(detranInfo.municipio)],
    ['Ano de Fabricação/Modelo', norm(detranInfo.anoFabricacaoModelo)], ['Combustível', norm(detranInfo.combustivel)],
    ['Cor', norm(detranInfo.cor)], ['Categoria', norm(detranInfo.categoria)],
    ['Espécie/Tipo', norm(detranInfo.especieTipo)], ['Restrição à Venda', norm(detranInfo.restricaoVenda)],
  ] as string[][];
  const detranCrLvFmt = [
    ['Licenciamento', norm(detranCrLv.licenciamento)], ['Exercício', norm(detranCrLv.exercicio)],
    ['Data Pagamento', norm(detranCrLv.dataPagamento)], ['Valor Pago', norm(detranCrLv.valorPago)],
    ['Emissão Documento', norm(detranCrLv.emissaoDocumento)], ['Número Correios', norm(detranCrLv.numeroCorreios)],
  ] as string[][];
  const detranDebitosFmt = [
    ['IPVA', 'Discriminação do valor: ' + norm(asRecord(detranDebitos.ipva).mensagem)],
    ['Seguro Obrigatório DPVAT', norm(detranDebitos.dpvat)],
  ] as string[][];
  const detranMultasFmt = (Array.isArray(detranMultas.itens) ? detranMultas.itens : []).map((item: unknown) => {
    const it = asRecord(item);
    return [norm(it.discriminacao), norm(it.quantidade), norm(it.valor)] as string[];
  });
  const detranAutuacoesFmt = (Array.isArray(detranAutuacoes.itens) ? detranAutuacoes.itens : []).map((item: unknown) => {
    const it = asRecord(item);
    return [norm(it.discriminacao), norm(it.quantidade), norm(it.valor)] as string[];
  });

  // CSV, comunicação de venda, recall — textos exatos
  const csvSpec = /nenhum registro/i.test(norm(asRecord(r.csv).mensagem)) ? 'NÃO ENCONTRADO CSV TIPO: SINISTRADO' : norm(asRecord(r.csv).mensagem);
  const comVendaSpec = !isPositive(cv.mensagem || cv.resposta) ? 'Não Consta Comunicação de Venda' : formatTextBlock(cv.mensagem || cv.resposta);
  const recallSpec = /não encontrado|nao encontrado/i.test(recallTxt) ? 'Não encontrado recall' : recallTxt;

  // 22. Leilões formatados
  const leiloesSpec = leiloesArr.map((item: unknown) => {
    const l = asRecord(item);
    return {
      placa: plateWithDash(l.placa),
      dataLeilao: dateBR(l.dataLeilao),
      condicao: norm(l.condicaoGeralDoVeiculo),
      lote: norm(l.lote),
      leiloeiro: norm(l.patio),
      comitente: norm(l.comitente),
      marcaModelo: norm(l.marca) + ' / ' + norm(l.modelo),
      ano: norm(l.anoFabricacao) + ' / ' + norm(l.anoModelo),
      tipoVeiculo: norm(l.categoriaDoVeiculo),
      cor: norm(l.cor),
      chassi: norm(l.chassi),
    };
  });

  const data = {
    consulta: {
      numero: norm(sol.codigoConsulta) || undefined,
      produto: 'Auto Perícia Gold',
      realizadaEm: norm(sol.dataHora) || undefined,
      placa: plate,
      marcaModelo,
      clienteNome: norm(r.clienteNome || r.customerName || asRecord(r.customer).name || ''),
      uf: upper(bin.Uf || bin.uf),
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
    vendaDireta: { tituloDaFaixa: 'Venda direta', status: (r.vendaDireta && (asRecord(r.vendaDireta).constaVendaDireta || isPositiveMsg(asRecord(r.vendaDireta).resposta))) ? 'alerta' : 'ok', titulo: (r.vendaDireta && isPositiveMsg(asRecord(r.vendaDireta).resposta)) ? norm(asRecord(r.vendaDireta).resposta) : (r.vendaDireta && asRecord(r.vendaDireta).constaVendaDireta ? 'Consta venda direta' : 'Nada consta') },
    eventoCorporativo: { tituloDaFaixa: 'Evento corporativo', status: (r.eventoCorporativo && (asRecord(r.eventoCorporativo).constaEventoCorporativo || isPositiveMsg(asRecord(r.eventoCorporativo).resposta))) ? 'alerta' : 'ok', titulo: (r.eventoCorporativo && isPositiveMsg(asRecord(r.eventoCorporativo).resposta)) ? norm(asRecord(r.eventoCorporativo).resposta) : (r.eventoCorporativo && asRecord(r.eventoCorporativo).constaEventoCorporativo ? 'Consta evento corporativo' : 'Nada consta') },
    parecer,
    sinistroCortesia: { status: sinistroPos ? 'alerta' : 'ok', titulo: sinistroPos ? (sinistroTxt || 'Consta sinistro de indenização integral') : 'Nada consta' },
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
    detran: {
      url: detranUrl,
      crlv: pairsFromObject(detranCrLv, { formatKeys: true }),
      multas: {
        itens: registrosFromArray(Array.isArray(detranMultas.itens) ? detranMultas.itens : [], { dropKeys: [] }),
        total: norm(detranMultas.total),
      },
      autuacoes: {
        itens: registrosFromArray(Array.isArray(detranAutuacoes.itens) ? detranAutuacoes.itens : [], { dropKeys: [] }),
        total: norm(detranAutuacoes.total),
      },
      informacoesVeiculo: pairsFromObject(detranInfo, { formatKeys: true }),
      debitos: pairsFromObject(detranDebitos, { formatKeys: true }),
      odometro: {
        mensagem: formatTextBlock(detranOdometro.mensagem),
        ultimoRegistro: pairsFromObject(asRecord(detranOdometro.ultimoRegistro), { formatKeys: true }),
      },
    },
    decodificador: pairsFromObject(decodificador, { formatKeys: true }),
    historicoFipe,
    odometro: Array.isArray(r.odometro) ? r.odometro : (Array.isArray(detranOdometro.historico) ? detranOdometro.historico : []),
    spec: {
      placa: placaFmt,
      // Selos com textos exatos
      selos: [
        sinistroPos && 'SINISTRO ENCONTRADO!',
        leiloesArr.length > 0 && 'CONSTA OFERTA EM LEILÃO',
        comercializacaoPos && 'CONSTA COMERCIALIZAÇÃO',
        rfPositive && 'HISTÓRICO DE ROUBO E/OU FURTO!',
        hasRestricao && 'RESTRIÇÃO JUDICIAL!',
      ].filter(Boolean),
      fabricacao,
      gravameFormatado,
      detranCompleto: {
        informacoes: detranInfoFmt,
        crlv: detranCrLvFmt,
        debitos: detranDebitosFmt,
        multas: { itens: detranMultasFmt, total: norm(detranMultas.total) },
        autuacoes: { itens: detranAutuacoesFmt, total: norm(detranAutuacoes.total) },
        odometro: detranOdometro.mensagem ? norm(detranOdometro.mensagem) : odometroSpec,
      },
      csv: csvSpec,
      comunicacaoVenda: comVendaSpec,
      recall: recallSpec,
      indicioSinistro: indicioSpec,
      veiculoNacional,
      restricoesTexto: restricoesTextoSpec,
      queixaAtiva,
      historicoRfAtivo,
      ocorrencias,
      comparativo: comparativoSpec,
      decodificador: decSpec,
      baseEstadual: baseEstadualSpec,
      proprietario: proprietarioTxt,
      debitos: debitosSpec,
      licenciamentoAno,
      restricoes: restricoesSpec,
      outrasRestricoes,
      odometro: odometroSpec,
      duplicidades,
      detranSituacao: norm(detran.situacao),
      detranUrl: detranUrl,
      sinistroTexto: sinistroSpec,
      sinistroPositivo: sinistroPos,
      leiloes: leiloesSpec,
      parecer: { nivel: parecer.nivel, resumo: parecer.resumo },
      vendaDireta: { consta: Boolean(asRecord(r.vendaDireta).constaVendaDireta) },
      eventoCorporativo: { consta: Boolean(asRecord(r.eventoCorporativo).constaEventoCorporativo) },
      comercializacao: { consta: comercializacaoPos },
    },
  };
  return data;
}

/** Carrega a logo configurada como data URL (necessário para renderização no PDF). */
async function resolveLogoDataUrl(): Promise<string> {
  try {
    const { getBrandConfig } = await import('@/lib/brand');
    const brand = await getBrandConfig();
    const logo = norm(brand.logoDark || brand.logoLight);
    if (!logo) return '';
    if (/^data:image\//i.test(logo)) return logo;
    if (/^https?:\/\//i.test(logo)) return logo;
    if (logo.startsWith('/')) {
      const file = path.join(process.cwd(), 'public', logo.replace(/^\/+/, ''));
      const buf = await fs.readFile(file);
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : 'image/png';
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch { /* sem logo — segue sem imagem */ }
  return '';
}

export async function goldReportHtml(input: CompanyResponse, plate: string, status: string, message: string) {
  const data = buildData(input, plate, status, message);
  const logo = await resolveLogoDataUrl();
  if (logo && data.consulta) data.consulta.logoUrl = logo;
  const template = await getActiveTemplateHtml();
  return template.replace('__DATA__', JSON.stringify(data));
}

export async function renderGoldPdf(response: CompanyResponse, plate: string, status: string, message: string) {
  const html = await goldReportHtml(response, plate, status, message);
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: typeof executablePath === 'string' ? executablePath : await executablePath });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaType('print');
    await page.setContent(html, { waitUntil: 'load' });
    // aguarda render JS do template (conteúdo injetado em #relatorio)
    await page.waitForFunction(() => {
      const el = document.getElementById('relatorio');
      return !!el && el.children.length > 0;
    }, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  }
  finally { await browser.close(); }
}

export const reportHash = (pdf: Buffer) => crypto.createHash('sha256').update(pdf).digest('hex');
