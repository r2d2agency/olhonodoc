import { NextResponse } from 'next/server';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { getAdminProduct, updateAdminProduct } from '@/lib/admin/products';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try { const product = await getAdminProduct(params.slug); if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 }); return NextResponse.json({ data: product }); }
  catch { return NextResponse.json({ error: 'Não foi possível carregar o produto.' }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const body = await request.json().catch(() => null);
    const data: Parameters<typeof updateAdminProduct>[1] = {};
    if (typeof body?.name === 'string') data.name = body.name.trim();
    if (typeof body?.shortName === 'string') data.shortName = body.shortName.trim();
    if (typeof body?.description === 'string') data.description = body.description.trim();
    if (Number.isInteger(body?.priceCents) && body.priceCents >= 0) data.priceCents = body.priceCents;
    if (body?.promotionalPriceCents === null || (Number.isInteger(body?.promotionalPriceCents) && body.promotionalPriceCents >= 0)) data.promotionalPriceCents = body.promotionalPriceCents;
    if (typeof body?.featured === 'boolean') data.featured = body.featured;
    if (typeof body?.active === 'boolean') data.active = body.active;
    if (typeof body?.ctaText === 'string') data.ctaText = body.ctaText.trim();
    if (typeof body?.seoTitle === 'string') data.seoTitle = body.seoTitle.trim();
    if (typeof body?.seoDescription === 'string') data.seoDescription = body.seoDescription.trim();
    const product = await updateAdminProduct(params.slug, data);
    return NextResponse.json({ data: product });
  } catch { return NextResponse.json({ error: 'Não foi possível atualizar o produto.' }, { status: 500 }); }
}
