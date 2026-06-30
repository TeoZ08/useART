import { describe, expect, it } from 'vitest';
import { checkoutInputSchema } from '@/services/checkout/schema';

const validSimpleCheckout = {
  customer: { name: 'Maria Silva', phone: '(67) 99999-9999', email: 'maria@example.com' },
  shipping: { method: 'pickup' as const },
  privacyTermsVersion: '2026-06-30',
  privacyAccepted: true as const,
  items: [
    {
      variantId: '11111111-1111-4111-8111-111111111111',
      quantity: 1,
      selection: { type: 'simple' as const, colorId: 'preto' as const, size: 'M' as const },
    },
  ],
};

describe('checkout input boundary', () => {
  it('accepts a valid pickup checkout', () => {
    expect(checkoutInputSchema.parse(validSimpleCheckout).shipping.method).toBe('pickup');
  });

  it('requires an address for local delivery', () => {
    const result = checkoutInputSchema.safeParse({
      ...validSimpleCheckout,
      shipping: { method: 'local_delivery' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects kits that repeat piece positions', () => {
    const piece = { pieceNumber: 1, applicationId: 'logo-central', colorId: 'preto', size: 'M' };
    const result = checkoutInputSchema.safeParse({
      ...validSimpleCheckout,
      items: [
        {
          ...validSimpleCheckout.items[0],
          selection: { type: 'kit', pieces: [piece, piece, piece] },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('requires explicit privacy consent', () => {
    const result = checkoutInputSchema.safeParse({
      ...validSimpleCheckout,
      privacyAccepted: false,
    });
    expect(result.success).toBe(false);
  });
});
