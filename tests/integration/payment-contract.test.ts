import { describe, expect, it } from 'vitest';
import { FakePaymentProvider } from '@/services/payments/fake-provider';

describe('payment provider contract', () => {
  it('keeps order identity, amount and idempotency at the server boundary', async () => {
    const provider = new FakePaymentProvider();
    const preference = await provider.createPreference({
      orderId: '018f3bb8-e73d-7b10-a0d9-4c06ac4ef001',
      orderCode: 'ART-TEST-001',
      amountCents: 5_050,
      idempotencyKey: 'payment-attempt-001',
      successUrl: 'https://preview.example/pagamento/sucesso',
      pendingUrl: 'https://preview.example/pagamento/pendente',
      failureUrl: 'https://preview.example/pagamento/falha',
      notificationUrl: 'https://preview.example/api/webhooks/mercadopago',
    });

    expect(preference).toEqual(
      expect.objectContaining({
        provider: 'mercadopago',
        preferenceId: 'fake-payment-attempt-001',
        sandbox: true,
      }),
    );
  });
});
