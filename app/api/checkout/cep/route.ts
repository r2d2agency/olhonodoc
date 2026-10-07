import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cep = new URL(request.url).searchParams.get('cep') || '';
  const digits = cep.replace(/\D/g, '');
  if (!/^\d{8}$/.test(digits)) return NextResponse.json({ error: 'CEP inválido.' }, { status: 400 });
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: AbortSignal.timeout(8000) });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.erro) return NextResponse.json({ error: 'CEP não encontrado.' }, { status: 404 });
    return NextResponse.json({ data: { street: data.logradouro || '', neighborhood: data.bairro || '', city: data.localidade || '', state: data.uf || '' } });
  } catch { return NextResponse.json({ error: 'Não foi possível consultar o CEP agora.' }, { status: 502 }); }
}
