import { timingSafeEqual } from 'node:crypto';
import { decryptSmtpPassword } from '@/lib/smtp-settings';
import { prisma } from '@/lib/prisma';

export type CompanyEnvironment = 'homologation' | 'production';
export type CompanyProduct = 'conferi-agregados' | 'conferi-auto-pericia-gold' | 'conferi-bin' | 'conferi-estadual' | 'conferi-crlv' | 'conferi-gravame';
export type CompanyInput = { placa?: string; chassi?: string; motor?: string; cambio?: string; produto?: string; uf?: string; documento?: string; renavam?: string; codigo_consulta?: string };
export type CompanyResponse = { solicitacao?: { acao?: number | string; mensagem?: string; dataHora?: string; codigoConsulta?: string; status?: string }; hashPesquisa?: string; [key: string]: unknown };

const endpoints: Record<CompanyEnvironment, Record<CompanyProduct, string>> = {
  homologation: {
    'conferi-agregados': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-agregados?responseType=json',
    'conferi-auto-pericia-gold': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-veiculo?responseType=json',
    'conferi-bin': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-bin?responseType=json',
    'conferi-estadual': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-estadual?responseType=json',
    'conferi-crlv': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-crlv?responseType=json',
    'conferi-gravame': 'https://webservice.companyconferi.com.br/api-clientes-homologacao/conferi-gravame?responseType=json'
  },
  production: {
    'conferi-agregados': 'https://webservice.companyconferi.com.br/api-clientes/conferi-agregados/json',
    'conferi-auto-pericia-gold': 'https://webservice.companyconferi.com.br/api-clientes/conferi-veiculo/json',
    'conferi-bin': 'https://webservice.companyconferi.com.br/api-clientes/conferi-bin/json',
    'conferi-estadual': 'https://webservice.companyconferi.com.br/api-clientes/conferi-estadual/json',
    'conferi-crlv': 'https://webservice.companyconferi.com.br/api-clientes/conferi-crlv/json',
    'conferi-gravame': 'https://webservice.companyconferi.com.br/api-clientes/conferi-gravame/json'
  }
};

export const normalizePlate = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
export function validateCompanyInput(product: CompanyProduct, input: CompanyInput) {
  if (input.placa && !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(normalizePlate(input.placa)) && !/^[A-Z]{3}[0-9]{4}$/.test(normalizePlate(input.placa))) throw new Error('Placa inválida.');
  if (input.chassi && (input.chassi.length < 7 || input.chassi.length > 18)) throw new Error('Chassi inválido.');
  if (!input.placa && !input.chassi && !input.motor && !input.cambio) throw new Error('Informe uma placa, chassi, motor ou câmbio.');
  if (product === 'conferi-gravame' && !input.chassi) throw new Error('Gravame exige chassi.');
  if (product === 'conferi-auto-pericia-gold') input.produto = 'conferi-auto-pericia-gold';
  if (input.uf) input.uf = input.uf.toUpperCase();
  if (product === 'conferi-crlv' && input.uf && !['SP', 'MA', 'MT', 'MG', 'PA', 'PR', 'TO'].includes(input.uf.toUpperCase())) throw new Error('UF não suportada para CRLV.');
}

export async function requestCompany(product: CompanyProduct, environment: CompanyEnvironment, credentials: { usuario: string; senha: string }, input: CompanyInput) {
  validateCompanyInput(product, input);
  const response = await fetch(endpoints[environment][product], { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ usuario: credentials.usuario, senha: credentials.senha, parametros: input }), signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Company HTTP ${response.status}`);
  const data = await response.json() as CompanyResponse;
  return data;
}

export function companyAction(response: CompanyResponse) { const action = Number(response.solicitacao?.acao); return { action, status: action === 4 ? 'PROCESSING' : action === 0 ? 'NOT_FOUND' : action === 1 ? 'COMPLETED' : action === 2 ? 'AUTH_ERROR' : action === 3 ? 'INVALID_INPUT' : action === 6 ? 'NO_CREDITS' : action === 8 ? 'FORBIDDEN' : action === 9 ? 'EXPIRED' : 'FAILED' } as const; }
export function validWebhookToken(provided: string | null, expected: string) { if (!provided || !expected) return false; const left = Buffer.from(provided); const right = Buffer.from(expected); return left.length === right.length && timingSafeEqual(left, right); }

export async function getCompanySettings() {
  const row = await prisma.setting.findUnique({ where: { key: 'company.conferi' } });
  const value = row?.value as Record<string, unknown> | undefined;
  if (!value?.usuario || typeof value.passwordEncrypted !== 'string') throw new Error('Company Conferi não configurada.');
  return { environment: value.environment === 'production' ? 'production' as const : 'homologation' as const, usuario: String(value.usuario), senha: decryptSmtpPassword(value.passwordEncrypted), webhookToken: typeof value.webhookToken === 'string' ? value.webhookToken : '' };
}
