import { prisma } from '@/lib/prisma';

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  promotionalPriceCents: number | null;
  featured: boolean;
  active: boolean;
  sales: number;
  provider: string | null;
  providerProduct: string | null;
  providerEndpointKey: string | null;
  providerInputType: string | null;
};

const activePrice = (product: { priceCents: number; promotionalPriceCents: number | null; promotionStart: Date | null; promotionEnd: Date | null }) => {
  const now = Date.now();
  const inWindow = (!product.promotionStart || product.promotionStart.getTime() <= now) && (!product.promotionEnd || product.promotionEnd.getTime() >= now);
  return inWindow && product.promotionalPriceCents != null ? product.promotionalPriceCents : product.priceCents;
};

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const products = await prisma.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }], include: { _count: { select: { orders: true } } } });
  return products.map((product) => ({ id: product.id, slug: product.slug, name: product.name, shortName: product.shortName, description: product.description, priceCents: activePrice(product), promotionalPriceCents: product.promotionalPriceCents, featured: product.featured === 'FEATURED', active: product.status === 'ACTIVE', sales: product._count.orders, provider: product.provider, providerProduct: product.providerProduct, providerEndpointKey: product.providerEndpointKey, providerInputType: product.providerInputType }));
}

export async function getAdminProduct(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug } });
  return product ? { ...product, effectivePriceCents: activePrice(product) } : null;
}

export async function updateAdminProduct(slug: string, data: Partial<{ name: string; shortName: string; description: string; priceCents: number; promotionalPriceCents: number | null; featured: boolean; active: boolean; ctaText: string | null; seoTitle: string | null; seoDescription: string | null; sortOrder: number; provider: string | null; providerProduct: string | null; providerEndpointKey: string | null; providerInputType: string | null }>) {
  const { featured, active, ...rest } = data;
  return prisma.product.update({ where: { slug }, data: { ...rest, ...(featured !== undefined ? { featured: featured ? 'FEATURED' : 'NONE' } : {}), ...(active !== undefined ? { status: active ? 'ACTIVE' : 'INACTIVE' } : {}) } });
}

export const formatBRL = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
