import { afterEach, describe, expect, it } from 'vitest';
import { resetEnvCacheForTests } from '@/lib/env';
import { getMercadoPagoNotificationUrl } from '@/services/payments/create-preference';
import { FakePaymentProvider } from '@/services/payments/fake-provider';
import { mercadoPagoPaymentMethods } from '@/services/payments/mercadopago-provider';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  resetEnvCacheForTests();
});

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

  it('uses the configured webhook URL without losing protection query parameters', () => {
    const webhookUrl =
      'https://preview.example.vercel.app/api/webhooks/mercadopago?x-vercel-protection-bypass=test-only-bypass&source=preference';
    process.env.MERCADO_PAGO_WEBHOOK_URL = webhookUrl;
    resetEnvCacheForTests();

    expect(getMercadoPagoNotificationUrl(new URL('https://preview.example.vercel.app'))).toBe(
      webhookUrl,
    );
  });

  it('falls back to the site webhook endpoint when no override is configured', () => {
    delete process.env.MERCADO_PAGO_WEBHOOK_URL;
    resetEnvCacheForTests();

    expect(getMercadoPagoNotificationUrl(new URL('https://preview.example.vercel.app'))).toBe(
      'https://preview.example.vercel.app/api/webhooks/mercadopago',
    );
  });

  it('does not exclude Pix or cards from Checkout Pro', () => {
    expect(mercadoPagoPaymentMethods.excluded_payment_types).not.toContain('pix');
    expect(mercadoPagoPaymentMethods.excluded_payment_types).not.toContain('credit_card');
  });
});
