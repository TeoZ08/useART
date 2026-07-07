import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { InvalidWebhookSignatureError } from 'mercadopago';
import { resetEnvCacheForTests } from '@/lib/env';
import { processMercadoPagoWebhook } from '@/services/payments/process-webhook';

const originalEnv = { ...process.env };
const webhookSecret = 'test-only-webhook-secret';

afterEach(() => {
  process.env = { ...originalEnv };
  resetEnvCacheForTests();
});

function signature(dataId: string | null, requestId: string | null, timestamp: string) {
  const manifest = [
    dataId ? `id:${dataId.toLowerCase()}` : null,
    requestId ? `request-id:${requestId}` : null,
    `ts:${timestamp}`,
  ]
    .filter(Boolean)
    .join(';');
  const hash = createHmac('sha256', webhookSecret).update(`${manifest};`).digest('hex');
  return `ts=${timestamp},v1=${hash}`;
}

describe('Mercado Pago webhook security contract', () => {
  it('continues requiring the configured webhook secret', async () => {
    delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    resetEnvCacheForTests();

    await expect(
      processMercadoPagoWebhook(
        { signature: null, requestId: 'request-1', dataId: 'payment-1' },
        'payment',
      ),
    ).rejects.toThrow('Webhook secret não configurado.');
  });

  it('continues requiring x-signature', async () => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = webhookSecret;
    resetEnvCacheForTests();

    await expect(
      processMercadoPagoWebhook(
        { signature: null, requestId: 'request-1', dataId: 'payment-1' },
        'payment',
      ),
    ).rejects.toBeInstanceOf(InvalidWebhookSignatureError);
  });

  it('requires x-request-id even when the signature without it is authentic', async () => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = webhookSecret;
    resetEnvCacheForTests();
    const timestamp = Date.now().toString();

    await expect(
      processMercadoPagoWebhook(
        {
          signature: signature('payment-1', null, timestamp),
          requestId: null,
          dataId: 'payment-1',
        },
        'payment',
      ),
    ).rejects.toThrow('Webhook sem x-request-id.');
  });

  it('requires data.id even when the signature without it is authentic', async () => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = webhookSecret;
    resetEnvCacheForTests();
    const timestamp = Date.now().toString();

    await expect(
      processMercadoPagoWebhook(
        {
          signature: signature(null, 'request-1', timestamp),
          requestId: 'request-1',
          dataId: null,
        },
        'payment',
      ),
    ).rejects.toThrow('Webhook sem data.id.');
  });
});
