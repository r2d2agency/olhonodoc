import { CouponDiscountType, CouponStatus } from '@prisma/client';

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
