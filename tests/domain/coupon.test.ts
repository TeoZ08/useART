import { describe, expect, it } from 'vitest';
import { applyCoupon, COUPON_CONFIG, normalizeCouponCode } from '@/domain/coupon/coupon';

describe('coupon domain', () => {
  it('normalizes and applies PRIMEIRACOMPRA as 10 percent', () => {
    expect(normalizeCouponCode(' primeiraCompra ')).toBe(COUPON_CONFIG.firstPurchase.code);

    const result = applyCoupon(11490, 'primeiracompra');

    expect(result.status).toBe('applied');
    expect(result.discountCents).toBe(1149);
    expect(result.message).toContain('servidor');
  });

  it('does not invent silent restrictions for invalid coupons', () => {
    const result = applyCoupon(4500, 'ART20');

    expect(result.status).toBe('invalid');
    expect(result.discountCents).toBe(0);
  });
});
