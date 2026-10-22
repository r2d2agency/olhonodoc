/**
 * Preço efetivo de um produto.
 *
 * O catálogo público, o painel e o checkout precisam cobrar exatamente o
 * mesmo valor. A promoção só vale dentro da janela `promotionStart`/
 * `promotionEnd`; fora dela, vale o preço de tabela.
 */
export function activePriceCents(product: { priceCents: number; promotionalPriceCents: number | null; promotionStart: Date | null; promotionEnd: Date | null }, now = new Date()) {
  const inWindow = (!product.promotionStart || product.promotionStart.getTime() <= now.getTime()) && (!product.promotionEnd || product.promotionEnd.getTime() >= now.getTime());
  return inWindow && product.promotionalPriceCents != null ? product.promotionalPriceCents : product.priceCents;
}

export const formatBRL = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
