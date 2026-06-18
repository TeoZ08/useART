import { describe, expect, it } from 'vitest';
import { shippingQuoteProvider } from '@/domain/shipping/shipping';

describe('shipping domain', () => {
  it('keeps ART pickup free', () => {
    const quote = shippingQuoteProvider.quote({ methodId: 'retirada-art' });

    expect(quote.priceCents).toBe(0);
    expect(quote.requiresAddress).toBe(false);
  });

  it('uses fixed Campo Grande/MS delivery price', () => {
    const quote = shippingQuoteProvider.quote({ methodId: 'campo-grande-ms' });

    expect(quote.priceCents).toBe(1000);
    expect(quote.requiresAddress).toBe(true);
  });

  it('does not invent freight for other locations', () => {
    const quote = shippingQuoteProvider.quote({ methodId: 'outra-localidade' });

    expect(quote.priceCents).toBeNull();
    expect(quote.requiresManualConfirmation).toBe(true);
  });
});
