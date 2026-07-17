import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEnvCacheForTests } from '@/lib/env';

const doubles = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createPaymentProvider: vi.fn(),
  getPublicOrder: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: doubles.createAdminClient }));
vi.mock('@/services/orders/public-order', () => ({ getPublicOrder: doubles.getPublicOrder }));
vi.mock('@/services/payments/provider-factory', () => ({
  createPaymentProvider: doubles.createPaymentProvider,
}));

import { createPaymentPreference } from '@/services/payments/create-preference';

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  resetEnvCacheForTests();
});

afterEach(() => {
  process.env = { ...originalEnv };
  resetEnvCacheForTests();
});

describe('payment preference webhook URL', () => {
  it('passes the exact configured URL and never propagates it through provider errors', async () => {
    const webhookUrl =
      'https://preview.example.vercel.app/api/webhooks/mercadopago?x-vercel-protection-bypass=test-only-sensitive-bypass';
    process.env.STORE_MODE = 'staging';
    process.env.PAYMENTS_ENABLED = 'true';
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    process.env.MERCADO_PAGO_ENVIRONMENT = 'test';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-only-access-token';
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'test-only-webhook-secret';
    process.env.MERCADO_PAGO_WEBHOOK_URL = webhookUrl;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.vercel.app';
    resetEnvCacheForTests();

    doubles.getPublicOrder.mockResolvedValue({
      id: '018f3bb8-e73d-7b10-a0d9-4c06ac4ef001',
      order_code: 'ART-TEST-001',
      total_cents: 5_500,
      expires_at: null,
      status: 'awaiting_payment',
    });
    const payableOrder = {
      id: '018f3bb8-e73d-7b10-a0d9-4c06ac4ef001',
      order_code: 'ART-TEST-001',
      total_cents: 5_500,
      expires_at: null,
      status: 'awaiting_payment',
      customer_email_normalized: 'customer@example.com',
    };

    const failedAttemptUpdates: unknown[] = [];
    let selectCall = 0;
    const paymentAttempts = {
      select: vi.fn(() => {
        selectCall += 1;
        if (selectCall === 1) {
          return {
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  })),
                })),
              })),
            })),
          };
        }
        return {
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) })),
          })),
        };
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn((payload: unknown) => {
        failedAttemptUpdates.push(payload);
        return {
          eq: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
        };
      }),
    };
    const admin = {
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: payableOrder }) })),
            })),
          };
        }
        if (table === 'store_settings') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { payments_enabled: true, store_mode: 'open' },
                  error: null,
                }),
              })),
            })),
          };
        }
        return paymentAttempts;
      }),
    };
    doubles.createAdminClient.mockReturnValue(admin);

    const createPreference = vi.fn(async () => {
      throw new Error(`Provider rejected notification_url=${webhookUrl}`);
    });
    doubles.createPaymentProvider.mockReturnValue({ createPreference });

    let publicError = '';
    try {
      await createPaymentPreference('public-token', 'idempotency-key-001');
    } catch (error) {
      publicError = error instanceof Error ? error.message : String(error);
    }

    expect(createPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'idempotency-key-001',
        notificationUrl: webhookUrl,
      }),
    );
    expect(failedAttemptUpdates).toContainEqual({
      status: 'failed',
      raw_status: 'preference_creation_failed',
    });
    expect(publicError).toBe('Não foi possível criar a preferência de pagamento.');
    expect(publicError).not.toContain(webhookUrl);
    expect(JSON.stringify(failedAttemptUpdates)).not.toContain(webhookUrl);
  });

  it('reuses an active preference for the order even with a new browser key', async () => {
    process.env.STORE_MODE = 'staging';
    process.env.PAYMENTS_ENABLED = 'true';
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    process.env.MERCADO_PAGO_ENVIRONMENT = 'test';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-only-access-token';
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'test-only-webhook-secret';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.vercel.app';
    resetEnvCacheForTests();

    const order = {
      id: '018f3bb8-e73d-7b10-a0d9-4c06ac4ef001',
      order_code: 'ART-TEST-001',
      total_cents: 5_500,
      expires_at: null,
      status: 'awaiting_payment',
    };
    doubles.getPublicOrder.mockResolvedValue(order);
    const payableOrder = { ...order, customer_email_normalized: 'customer@example.com' };
    const reusable = {
      preference_id: 'test-preference',
      checkout_url: 'https://sandbox.mercadopago.com.br/checkout/test',
      sandbox: true,
      amount_cents: order.total_cents,
    };
    const paymentAttempts = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: reusable, error: null }),
              })),
            })),
          })),
        })),
      })),
      insert: vi.fn(),
    };
    doubles.createAdminClient.mockReturnValue({
      from: vi.fn((table: string) =>
        table === 'orders'
          ? {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: payableOrder }),
                })),
              })),
            }
          : table === 'store_settings'
            ? {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { payments_enabled: true, store_mode: 'open' },
                      error: null,
                    }),
                  })),
                })),
              }
            : paymentAttempts,
      ),
    });
    const createPreference = vi.fn();
    doubles.createPaymentProvider.mockReturnValue({ createPreference });

    const result = await createPaymentPreference('public-token', 'new-browser-key-001');

    expect(result).toEqual(reusable);
    expect(paymentAttempts.insert).not.toHaveBeenCalled();
    expect(createPreference).not.toHaveBeenCalled();
  });
});
