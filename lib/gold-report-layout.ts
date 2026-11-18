/**
 * Regras de interpretação e formatação do laudo Gold.
 * Baseado na especificação "Especificação de ajustes — Laudo Auto Perícia Gold".
 */

export const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};

export const norm = (v: unknown): string => String(v ?? '').trim();

export const upper = (v: unknown): string => norm(v).toUpperCase();

/** Regra 1 da especificação: função única "é negativo?". */
export function isNegative(v: unknown): boolean {
  if (v === undefined || v === null || v === false) return true;
  const s = norm(v);
  if (!s) return true;
  const u = s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/^0([.,]0+)?$/.test(u)) return true;
  if (['0', 'NAO', 'N', 'FALSE', 'N/D', 'NA'].includes(u)) return true;
  if (/^(NADA CONSTA|NAO CONSTA|NAO EXISTE|NAO HA|SEM RESTRICAO|SEM REGISTRO|NENHUM REGISTRO|NAO POSSUI)/.test(u)) return true;
  return false;
}
export const isPositive = (v: unknown): boolean => !isNegative(v);

/** Remove acentos, espaços e pontuação para comparação de componentes. */
export function compareKey(v: unknown): string {
  return norm(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Remove marca repetida no início do modelo. */
export function stripBrand(model: unknown, brand: unknown): string {
  const m = norm(model);
  const b = compareKey(brand);
  if (!b) return m;
  const mk = compareKey(m);
  if (mk.startsWith(b)) return m.replace(new RegExp(`^\\s*${m.slice(0, mk.indexOf(b) + b.length).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '');
  return m;
}

/** Formata placa com hífen: ABC1234 -> ABC-1234; ABC1D23 -> ABC-1D23. */
export function plateWithDash(v: unknown): string {
  const p = norm(v).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p;
}

/** Formata valor em reais com separador de milhar. */
export function money(v: unknown): string {
  const digits = norm(v).replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(digits);
  if (!isFinite(n)) return norm(v);
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formata número com separador de milhar (sem R$). */
export function numberBR(v: unknown): string {
  const n = Number(norm(v).replace(/[^\d]/g, ''));
  return isFinite(n) ? n.toLocaleString('pt-BR') : norm(v);
}

/** Converte "2020-01-15T00:00:00" ou "15/01/2020" em "15/01/2020". */
export function dateBR(v: unknown): string {
  const s = norm(v);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return s;
}

/** Converte situação "EM CIRCULACAO" em "CIRCULAÇÃO". */
export function situacaoLabel(v: unknown): string {
  const u = norm(v).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (u === 'EM CIRCULACAO' || u === 'CIRCULACAO' || u === 'EM CIRCULAÇÃO') return 'CIRCULAÇÃO';
  return norm(v);
}
