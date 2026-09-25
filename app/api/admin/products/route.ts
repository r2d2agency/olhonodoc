import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { listAdminProducts, formatBRL } from '@/lib/admin/products';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try { const products = await listAdminProducts(); return NextResponse.json({ data: products.map((product) => ({ ...product, price: formatBRL(product.priceCents) })) }); } catch { return NextResponse.json({ error: 'Não foi possível carregar os produtos.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const priceCents = Number(body?.priceCents);
    if (!name || !/^[a-z0-9-]+$/.test(slug) || !Number.isInteger(priceCents) || priceCents < 0) return NextResponse.json({ error: 'Informe nome, slug e preço válidos.' }, { status: 400 });
    const providers = ['', 'company-conferi']; const providerProducts = ['', 'conferi-agregados', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame']; const inputTypes = ['', 'plate', 'chassi', 'renavam']; const provider = typeof body?.provider === 'string' && providers.includes(body.provider) ? body.provider || null : null; const providerProduct = typeof body?.providerProduct === 'string' && providerProducts.includes(body.providerProduct) ? body.providerProduct || null : null; const providerInputType = typeof body?.providerInputType === 'string' && inputTypes.includes(body.providerInputType) ? body.providerInputType || null : null; const product = await prisma.product.create({ data: { name, slug, shortName: name, description: '', priceCents, features: [], useCase: '', provider, providerProduct, providerEndpointKey: providerProduct, providerInputType } });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Não foi possível criar o produto.' }, { status: 500 }); }
}
