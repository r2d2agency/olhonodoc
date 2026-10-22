import { CouponDiscountType, CouponStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type CouponInput = {
  code: string;
  discountType: CouponDiscountType;
  value: number;
  subtotalCents: number;
  productId?: string;
  customerId?: string;
  email?: string;
  cpf?: string;
  now?: Date;
};

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function calculateDiscount(type: CouponDiscountType, value: number, subtotalCents: number, maxDiscountCents?: number | null) {
  const raw = type === CouponDiscountType.PERCENTAGE ? Math.floor(subtotalCents * value / 100) : value;
  return Math.min(Math.max(raw, 0), subtotalCents, maxDiscountCents ?? Number.MAX_SAFE_INTEGER);
}

export function isCouponActive(coupon: { status: CouponStatus; startsAt: Date | null; endsAt: Date | null }, now = new Date()) {
  return coupon.status === CouponStatus.ACTIVE &&
    (!coupon.startsAt || coupon.startsAt <= now) &&
    (!coupon.endsAt || coupon.endsAt >= now);
}

export function validateCouponInput(input: CouponInput) {
  if (!normalizeCouponCode(input.code)) throw new Error('Código do cupom é obrigatório');
  if (!Number.isInteger(input.value) || input.value < 0) throw new Error('Valor do cupom inválido');
  if (!Number.isInteger(input.subtotalCents) || input.subtotalCents < 0) throw new Error('Subtotal inválido');
  if (input.discountType === CouponDiscountType.PERCENTAGE && input.value > 100) throw new Error('Percentual deve estar entre 0 e 100');
}

export type CouponResolution = {
  code: string;
  couponId: string;
  discountType: CouponDiscountType;
  value: number;
  discountCents: number;
  subtotalCents: number;
  totalCents: number;
};

export class CouponError extends Error {
  constructor(message: string, readonly status = 400) { super(message); this.name = 'CouponError'; }
}

/** Janela em que um pedido pendente ainda pode ser retomado (mesma do prepare). */
const PENDING_WINDOW_MS = 30 * 60 * 1000;

/**
 * Libera os resgates de pedidos pendentes que ninguém retomou.
 *
 * Sem isso, um carrinho abandonado consumiria o limite de um cupom e o
 * cliente pagante seria barrado por um pedido que ele não concluiu.
 */
export async function releaseStaleRedemptions(now = new Date()) {
  const cutoff = new Date(now.getTime() - PENDING_WINDOW_MS);
  const stale = await prisma.couponRedemption.findMany({ where: { reversedAt: null, order: { status: 'PENDING', createdAt: { lt: cutoff } } }, select: { id: true, couponId: true } });
  if (!stale.length) return 0;
  await prisma.$transaction(async (tx) => {
    for (const redemption of stale) {
      await tx.couponRedemption.update({ where: { id: redemption.id }, data: { reversedAt: now } });
    }
    for (const couponId of new Set(stale.map((redemption) => redemption.couponId))) {
      await syncRedemptionCount(tx, couponId);
    }
  });
  return stale.length;
}

/**
 * Recalcula o contador de resgates a partir dos resgates vivos.
 *
 * Incrementar e decrementar por evento deixa o contador fora de sincronia
 * quando um pedido é cancelado ou abandonedo; recalcular evita que o limite
 * de usos do cupom seja cortado por um erro de contagem.
 */
export async function syncRedemptionCount(tx: Prisma.TransactionClient, couponId: string) {
  const count = await tx.couponRedemption.count({ where: { couponId, reversedAt: null } });
  await tx.coupon.update({ where: { id: couponId }, data: { redemptionCount: count } });
  return count;
}

/**
 * Resolve o cupom contra o subtotal real do pedido.
 *
 * O navegador nunca define o valor final: o desconto é sempre recalculado
 * aqui a partir do subtotal que o servidor calculou com o preço do produto.
 */
export async function resolveCoupon(params: {
  code: string;
  subtotalCents: number;
  productId?: string;
  customerId?: string;
  email?: string;
  cpf?: string;
  now?: Date;
}): Promise<CouponResolution> {
  const code = normalizeCouponCode(params.code);
  const subtotalCents = params.subtotalCents;
  if (!code) throw new CouponError('Informe o código do cupom.');
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) throw new CouponError('Subtotal inválido.');
  const now = params.now ?? new Date();
  const coupon = await prisma.coupon.findUnique({ where: { code }, include: { assignments: true } });
  if (!coupon) throw new CouponError('Cupom não encontrado.', 404);
  if (!isCouponActive(coupon, now)) throw new CouponError('Cupom expirado ou inativo.');
  if (coupon.productId && coupon.productId !== params.productId) throw new CouponError('Cupom não válido para este produto.');
  if (coupon.minOrderCents != null && subtotalCents < coupon.minOrderCents) throw new CouponError('Pedido abaixo do valor mínimo para este cupom.');
  if (coupon.maxRedemptions != null) {
    // A contagem usa os resgates vivos (não estornados), e não o contador
    // acumulado: assim pedidos abandonedos ou cancelados não travam o cupom.
    const used = await prisma.couponRedemption.count({ where: { couponId: coupon.id, reversedAt: null } });
    if (used >= coupon.maxRedemptions) throw new CouponError('Limite total de utilizações atingido.');
  }
  const email = params.email ? normalizeEmail(params.email) : undefined;
  const cpf = params.cpf ? normalizeCpf(params.cpf) : undefined;
  if (coupon.assignments.length) {
    const allowed = coupon.assignments.some((assignment) =>
      (assignment.targetType === 'EMAIL' && email && assignment.targetValue === email) ||
      (assignment.targetType === 'CPF' && cpf && assignment.targetValue === cpf) ||
      (assignment.targetType === 'CUSTOMER' && params.customerId && assignment.targetValue === params.customerId));
    if (!allowed) throw new CouponError('Cupom não disponível para este cliente.', 403);
    if (coupon.perCustomerLimit != null && (params.customerId || email || cpf)) {
      const redemptions = await prisma.couponRedemption.count({ where: { couponId: coupon.id, customerId: params.customerId || undefined, reversedAt: null } });
      if (redemptions >= coupon.perCustomerLimit) throw new CouponError('Limite de utilizações por cliente atingido.');
    }
  }
  validateCouponInput({ code, discountType: coupon.discountType, value: coupon.value, subtotalCents });
  const discountCents = calculateDiscount(coupon.discountType, coupon.value, subtotalCents, coupon.maxDiscountCents);
  return { code: coupon.code, couponId: coupon.id, discountType: coupon.discountType, value: coupon.value, discountCents, subtotalCents, totalCents: subtotalCents - discountCents };
}
