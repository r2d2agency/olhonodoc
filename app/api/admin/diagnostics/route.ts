import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPaymentConfiguration } from '@/lib/payment-provider';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Diagnóstico do ambiente de pagamento. Existe porque o 502 do proxy não deixa
 * rastro na aplicação: aqui conferimos, em um só lugar, se o schema do banco já
 * foi aplicado, se as credenciais do provedor estão presentes e decifráveis e se
 * a API do Mercado Pago responde a partir do container.
 */
export async function GET() {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });

  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  // 1. Banco de dados e schema aplicado.
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: 'Banco de dados', ok: true, detail: 'Conexão e consulta básica OK.' });
  } catch (error) {
    checks.push({ name: 'Banco de dados', ok: false, detail: `Falha na conexão: ${error instanceof Error ? error.message : 'erro'}` });
  }
  try {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Payment' AND column_name IN ('providerOrderId', 'method', 'installments', 'attempts', 'lastSyncedAt', 'refundedAt')`;
    const found = new Set(columns.map(column => column.column_name));
    const missing = ['providerOrderId', 'method', 'installments', 'attempts', 'lastSyncedAt', 'refundedAt'].filter(name => !found.has(name));
    checks.push(missing.length
      ? { name: 'Schema do pagamento', ok: false, detail: `Faltam colunas em Payment: ${missing.join(', ')}. Rode "npm run db:push".` }
      : { name: 'Schema do pagamento', ok: true, detail: 'Colunas novas de Payment presentes.' });
  } catch (error) {
    checks.push({ name: 'Schema do pagamento', ok: false, detail: `Não foi possível inspecionar: ${error instanceof Error ? error.message : 'erro'}` });
  }

  // 2. Configuração e credenciais do provedor.
  try {
    const config = await getPaymentConfiguration();
    checks.push({
      name: 'Provedor ativo',
      ok: config.activeProvider !== 'none',
      detail: `${config.activeProvider} (${config.environment})`,
    });
    if (config.activeProvider === 'mercadopago') {
      checks.push({
        name: 'Credencial Mercado Pago',
        ok: Boolean(config.mercadopago.accessToken),
        detail: config.mercadopago.accessToken ? 'Access token presente e decifrado.' : 'Access token ausente ou não decifrável (SMTP_ENCRYPTION_KEY mudou?).',
      });
      checks.push({
        name: 'Segredo do webhook',
        ok: Boolean(config.mercadopago.webhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET),
        detail: config.mercadopago.webhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET ? 'Configurado.' : 'Sem segredo: o webhook do Mercado Pago será rejeitado.',
      });
    }
    if (config.activeProvider === 'asaas') {
      checks.push({
        name: 'Credencial Asaas',
        ok: Boolean(config.asaas.apiKey),
        detail: config.asaas.apiKey ? 'API key presente e decifrada.' : 'API key ausente ou não decifrável (SMTP_ENCRYPTION_KEY mudou?).',
      });
    }
  } catch (error) {
    checks.push({ name: 'Configuração do provedor', ok: false, detail: `Falha ao ler a configuração: ${error instanceof Error ? error.message : 'erro'}` });
  }

  // 3. Alcance da API do Mercado Pago a partir do container.
  if (process.env.MERCADO_PAGO_DIAGNOSTIC !== 'off') {
    try {
      const started = Date.now();
      const response = await fetch('https://api.mercadopago.com/users/me', { signal: AbortSignal.timeout(10000) });
      checks.push({
        name: 'Rede até o Mercado Pago',
        ok: response.status < 500,
        detail: `HTTP ${response.status} em ${Date.now() - started}ms (sem token o provedor responde 401, o que já prova alcance).`,
      });
    } catch (error) {
      checks.push({ name: 'Rede até o Mercado Pago', ok: false, detail: `Falha de rede: ${error instanceof Error ? error.message : 'erro'}` });
    }
  }

  void logger.info('admin.diagnostics.checked', { userId: user.id, failed: checks.filter(check => !check.ok).length });
  return NextResponse.json({ data: { checks, failed: checks.filter(check => !check.ok).length } });
}
