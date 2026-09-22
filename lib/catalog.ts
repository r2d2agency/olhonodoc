import { prisma } from '@/lib/prisma';

export type CatalogProduct = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  price: string;
  oldPrice?: string | null;
  accent: string;
  features: string[];
  useCase: string;
  ctaText?: string;
  featured?: boolean;
};

const formatBRL = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fallbackProducts: CatalogProduct[] = [
  { slug: 'consulta-premium', name: 'Consulta Premium', shortName: 'Premium', description: 'Uma visão mais completa do histórico do veículo antes da compra.', price: 'R$ 39,90', oldPrice: null, accent: 'Destaque', features: ['Dados cadastrais', 'Leilão e sinistro', 'Roubo e furto', 'Restrições disponíveis'], useCase: 'Para quem está prestes a fechar negócio e quer reunir mais contexto sobre o veículo.', ctaText: 'Ver consulta', featured: true },
  { slug: 'consulta-essencial', name: 'Consulta Essencial', shortName: 'Essencial', description: 'As principais informações para começar sua análise.', price: 'R$ 19,90', oldPrice: null, accent: '', features: ['Dados cadastrais', 'Roubo e furto', 'Identificação do veículo'], useCase: 'Para uma primeira triagem antes de avançar na negociação.', ctaText: 'Ver consulta', featured: false },
  { slug: 'roubo-furto', name: 'Dados Cadastrais + Roubo e Furto', shortName: 'Roubo e furto', description: 'Consulte dados cadastrais e informações disponíveis relacionadas a roubo ou furto.', price: 'R$ 14,90', oldPrice: null, accent: '', features: ['Dados cadastrais', 'Roubo e furto', 'Status demonstrativo'], useCase: 'Para checar rapidamente sinais de alerta associados ao veículo.', ctaText: 'Ver consulta', featured: false },
  { slug: 'dados-veiculo', name: 'Dados Atuais do Veículo', shortName: 'Dados do veículo', description: 'Confira informações atuais e dados disponíveis relacionados ao veículo.', price: 'R$ 12,90', oldPrice: null, accent: '', features: ['Marca e modelo', 'Ano e combustível', 'Localidade'], useCase: 'Para confirmar se os dados apresentados pelo vendedor fazem sentido.', ctaText: 'Ver consulta', featured: false },
  { slug: 'financiamento', name: 'Consulta de Financiamento', shortName: 'Financiamento', description: 'Consulte informações disponíveis relacionadas a financiamento do veículo.', price: 'R$ 16,90', oldPrice: null, accent: '', features: ['Indícios disponíveis', 'Consulta por placa', 'Resultado demonstrativo'], useCase: 'Para investigar informações financeiras disponíveis antes de negociar.', ctaText: 'Ver consulta', featured: false }
];

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({ where: { status: 'ACTIVE' }, orderBy: [{ sortOrder: 'asc' }, { priceCents: 'desc' }] });
    if (!products.length) return fallbackProducts;
    const now = Date.now();
    return products.map((product) => {
      const inWindow = (!product.promotionStart || product.promotionStart.getTime() <= now) && (!product.promotionEnd || product.promotionEnd.getTime() >= now);
      const promo = inWindow && product.promotionalPriceCents != null ? product.promotionalPriceCents : null;
      const features = Array.isArray(product.features) ? (product.features as string[]) : [];
      return { slug: product.slug, name: product.name, shortName: product.shortName, description: product.description, price: formatBRL(promo ?? product.priceCents), oldPrice: promo != null ? formatBRL(product.priceCents) : null, accent: product.accent ?? '', features, useCase: product.useCase, ctaText: product.ctaText || 'Ver consulta', featured: product.featured === 'FEATURED' };
    });
  } catch { return fallbackProducts; }
}

export async function getCatalogProduct(slug: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
