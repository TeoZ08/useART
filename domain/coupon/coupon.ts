export const COUPON_CONFIG = {
  firstPurchase: {
    code: 'PRIMEIRACOMPRA',
    discountPercent: 10,
    serverValidationRequired: true,
  },
} as const;

export interface CouponResult {
  status: 'empty' | 'applied' | 'invalid';
  normalizedCode: string;
  discountCents: number;
  message: string;
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function applyCoupon(subtotalCents: number, code: string): CouponResult {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    return {
      status: 'empty',
      normalizedCode,
      discountCents: 0,
      message: 'Nenhum cupom aplicado.',
    };
  }

  if (normalizedCode !== COUPON_CONFIG.firstPurchase.code) {
    return {
      status: 'invalid',
      normalizedCode,
      discountCents: 0,
      message: 'Cupom não reconhecido nesta fase.',
    };
  }

  const discountCents = Math.round(
    subtotalCents * (COUPON_CONFIG.firstPurchase.discountPercent / 100),
  );

  return {
    status: 'applied',
    normalizedCode,
    discountCents,
    message:
      'Cupom PRIMEIRACOMPRA aplicado. A validação definitiva de uso deve ocorrer no servidor.',
  };
}
