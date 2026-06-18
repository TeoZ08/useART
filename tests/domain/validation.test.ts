import { describe, expect, it } from 'vitest';
import { validateAddress, validateCustomer } from '@/domain/orders/validation';
import { shippingQuoteProvider } from '@/domain/shipping/shipping';

describe('order validation', () => {
  it('requires basic contact data', () => {
    expect(validateCustomer({ name: '', phone: '' })).toEqual({
      name: 'Informe seu nome.',
      phone: 'Informe seu WhatsApp.',
    });
  });

  it('skips address validation for pickup', () => {
    const errors = validateAddress({}, shippingQuoteProvider.quote({ methodId: 'retirada-art' }));

    expect(errors).toEqual({});
  });

  it('requires address when delivery is selected', () => {
    const errors = validateAddress(
      {},
      shippingQuoteProvider.quote({ methodId: 'campo-grande-ms' }),
    );

    expect(errors).toMatchObject({
      cep: 'Informe o CEP.',
      street: 'Informe a rua.',
      number: 'Informe o número.',
      district: 'Informe o bairro.',
      city: 'Informe a cidade.',
      state: 'Informe o estado.',
    });
  });
});
