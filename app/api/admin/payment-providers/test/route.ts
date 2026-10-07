import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { getPaymentConfiguration } from '@/lib/payment-provider';

export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const requested = typeof body?.provider === 'string' ? body.provider : '';
  const config = await getPaymentConfiguration();
  const provider = requested === 'mercadopago' || requested === 'asaas' ? requested : config.activeProvider;
  if (provider !== 'mercadopago' && provider !== 'asaas') return NextResponse.json({ error: 'Selecione um provedor ativo.' }, { status: 400 });
  try {
    const isMercadoPago = provider === 'mercadopago';
    const token = isMercadoPago ? config.mercadopago.accessToken : config.asaas.apiKey;
    if (!token) return NextResponse.json({ error: `Credencial do ${isMercadoPago ? 'Mercado Pago' : 'Asaas'} não configurada. Salve as credenciais antes de testar.` }, { status: 400 });
    const url = isMercadoPago ? 'https://api.mercadopago.com/users/me' : `${config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com'}/v3/myAccount`;
    const response = await fetch(url, { headers: isMercadoPago ? { Authorization: `Bearer ${token}` } : { access_token: token }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return NextResponse.json({ error: `O provedor respondeu HTTP ${response.status}.`, provider }, { status: 502 });
    return NextResponse.json({ data: { provider, environment: config.environment, connected: true } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Falha de conexão com o provedor.' }, { status: 502 }); }
}
