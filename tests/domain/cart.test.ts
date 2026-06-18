import { describe, expect, it } from 'vitest';
import {
  addCartItem,
  calculateCartTotals,
  calculateSubtotal,
  createCartItem,
} from '@/domain/cart/cart';
import { createSimpleSelection } from '@/domain/cart/selection';
import { getProductBySlug } from '@/domain/products/products';
import { shippingQuoteProvider } from '@/domain/shipping/shipping';

describe('cart domain', () => {
  it('calculates subtotal and merges equal selections', () => {
    const product = getProductBySlug('camiseta-hibrida-logo-lateral');
    expect(product).toBeDefined();

    const selection = createSimpleSelection('preto', 'M');
    const item = createCartItem(product!, selection, 1);
    const nextItem = createCartItem(product!, selection, 2);
    const cart = addCartItem(addCartItem([], item), nextItem);

    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
    expect(calculateSubtotal(cart)).toBe(13500);
  });

  it('applies coupon and Campo Grande shipping in totals', () => {
    const product = getProductBySlug('camiseta-solid-masculina-assinatura-lateral');
    expect(product).toBeDefined();

    const item = createCartItem(product!, createSimpleSelection('preto', 'G'), 2);
    const shipping = shippingQuoteProvider.quote({ methodId: 'campo-grande-ms' });
    const totals = calculateCartTotals([item], 'PRIMEIRACOMPRA', shipping);

    expect(totals.subtotalCents).toBe(10000);
    expect(totals.discountCents).toBe(1000);
    expect(totals.shippingCents).toBe(1000);
    expect(totals.totalCents).toBe(10000);
  });
});
