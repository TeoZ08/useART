import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from 'mercadopago';
import { FakePaymentProvider } from '@/services/payments/fake-provider';

describe('fake payment provider', () => {
  it('creates deterministic non-live preferences', async () => {
    const provider = new FakePaymentProvider();
    const result = await provider.createPreference({
      orderId: 'order-id',
      orderCode: 'ART-1',
      amountCents: 4500,
      idempotencyKey: 'attempt-id',
      successUrl: 'http://localhost/success',
      pendingUrl: 'http://localhost/pending',
      failureUrl: 'http://localhost/failure',
      notificationUrl: 'http://localhost/webhook',
    });

    expect(result.sandbox).toBe(true);
    expect(result.preferenceId).toBe('fake-attempt-id');
    expect(result.checkoutUrl).toContain('/pagamento/pendente');
  });
});

describe('Mercado Pago webhook signature', () => {
  it('accepts an authentic HMAC and rejects a forged signature', () => {
    const secret = 'test-only-webhook-secret';
    const dataId = 'PAYMENT-123';
    const requestId = 'request-456';
    const timestamp = Date.now().toString();
    const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
    const signature = createHmac('sha256', secret).update(manifest).digest('hex');
    const options = {
      xRequestId: requestId,
      dataId,
      secret,
      toleranceSeconds: 300,
      now: () => Number(timestamp),
    };

    expect(() =>
      WebhookSignatureValidator.validate({
        ...options,
        xSignature: `ts=${timestamp},v1=${signature}`,
      }),
    ).not.toThrow();
    expect(() =>
      WebhookSignatureValidator.validate({
        ...options,
        xSignature: `ts=${timestamp},v1=${'0'.repeat(64)}`,
      }),
    ).toThrow(InvalidWebhookSignatureError);
  });
});
