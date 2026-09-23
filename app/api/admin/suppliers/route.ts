import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/admin/settings';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';

type Supplier = { id: string; name: string; type: string; endpoint: string; status: string; notes: string };
const FALLBACK: Supplier[] = [];

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try { return NextResponse.json({ data: await getSetting<Supplier[]>('suppliers', FALLBACK) }); }
  catch (error) { console.error('Admin supplier load failed', error); return NextResponse.json({ error: 'Não foi possível carregar fornecedores.' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const body = await request.json();
    if (!Array.isArray(body)) return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
    const suppliers = body.map((item): Supplier => ({ id: String(item.id || crypto.randomUUID()), name: String(item.name || '').slice(0, 80), type: String(item.type || 'Dados veiculares').slice(0, 80), endpoint: String(item.endpoint || '').slice(0, 300), status: item.status === 'INATIVO' ? 'INATIVO' : 'ATIVO', notes: String(item.notes || '').slice(0, 500) })).filter((item) => item.name && item.endpoint);
    await setSetting('suppliers', suppliers);
    return NextResponse.json({ data: suppliers });
  } catch (error) { console.error('Admin supplier save failed', error); return NextResponse.json({ error: 'Não foi possível salvar fornecedores.' }, { status: 500 }); }
}
