import { describe, expect, it } from 'vitest';
import { createCartItem } from '@/domain/cart/cart';
import {
  createKitPieceSelection,
  createKitSelection,
  createSimpleSelection,
} from '@/domain/cart/selection';
import { buildOrderId } from '@/domain/orders/order';
import { getProductBySlug } from '@/domain/products/products';
import { shippingQuoteProvider } from '@/domain/shipping/shipping';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

describe('whatsapp message', () => {
  it('formats a common product order with the correct WhatsApp number', () => {
    const product = getProductBySlug('camiseta-hibrida-logo-lateral');
    expect(product).toBeDefined();

    const order = {
      id: buildOrderId(new Date('2026-06-18T12:00:00-04:00')),
      createdAt: '2026-06-18T16:00:00.000Z',
      customer: { name: 'Cliente Teste', phone: '+55 67 99999-0000', email: '' },
      address: {},
      shipping: shippingQuoteProvider.quote({ methodId: 'retirada-art' }),
      paymentNote: 'Pagamento a combinar no atendimento.',
      items: [createCartItem(product!, createSimpleSelection('preto', 'M'), 1)],
      couponCode: 'PRIMEIRACOMPRA',
      subtotalCents: 4500,
      discountCents: 450,
      shippingCents: 0,
      totalCents: 4050,
    };

    const message = buildWhatsAppMessage(order);
    const url = buildWhatsAppUrl(order);

    expect(message).toContain('Quero preparar um pedido na ART');
    expect(message).toContain('Camiseta Híbrida - logo lateral');
    expect(message).toContain('Retirada ART');
    expect(message).toContain('conferido no atendimento');
    expect(url).toContain('https://wa.me/5567991691441');
  });

  it('formats kit pieces separately', () => {
    const product = getProductBySlug('kit-selecao-3-camisetas');
    expect(product).toBeDefined();

    const kit = createKitSelection([
      createKitPieceSelection(1, 'logo-lateral', 'preto', 'P'),
      createKitPieceSelection(2, 'logo-central', 'branco-off-white', 'M'),
      createKitPieceSelection(3, 'assinatura-lateral', 'marrom', 'G'),
    ]);

    const message = buildWhatsAppMessage({
      id: 'ART-TESTE',
      createdAt: '2026-06-18T16:00:00.000Z',
      customer: { name: 'Cliente Teste', phone: '+55 67 99999-0000' },
      address: { city: 'Dourados', state: 'MS' },
      shipping: shippingQuoteProvider.quote({ methodId: 'outra-localidade' }),
      paymentNote: 'Pagamento a combinar no atendimento.',
      items: [createCartItem(product!, kit, 1)],
      couponCode: '',
      subtotalCents: 11490,
      discountCents: 0,
      shippingCents: null,
      totalCents: null,
    });

    expect(message).toContain('Peça 1: Logo lateral, Preto, tamanho P');
    expect(message).toContain('Peça 2: Logo central, Branco/off-white, tamanho M');
    expect(message).toContain('Peça 3: Assinatura lateral, Marrom, tamanho G');
    expect(message).toContain('Frete: A confirmar no atendimento');
  });
});
