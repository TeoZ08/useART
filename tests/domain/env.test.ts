import { afterEach, describe, expect, it } from 'vitest';
import { getServerEnv, getSiteUrl, resetEnvCacheForTests } from '@/lib/env';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  resetEnvCacheForTests();
});

describe('server environment gates', () => {
  it('uses the deployment URL in staging instead of the production alias', () => {
    process.env.STORE_MODE = 'staging';
    process.env.VERCEL_URL = 'preview.example.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.example.com';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    resetEnvCacheForTests();
    expect(getSiteUrl().toString()).toBe('https://preview.example.vercel.app/');
  });

  it('uses the production URL in live mode', () => {
    process.env.STORE_MODE = 'live';
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    process.env.MERCADO_PAGO_ENVIRONMENT = 'live';
    process.env.VERCEL_URL = 'preview.example.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.example.com';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'public';
    process.env.SUPABASE_SECRET_KEY = 'secret';
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'owner@example.com';
    process.env.ORDER_TOKEN_PEPPER = 'pepper';
    process.env.CUSTOMER_HASH_PEPPER = 'pepper';
    resetEnvCacheForTests();
    expect(getSiteUrl().toString()).toBe('https://production.example.com/');
  });

  it('rejects fake payments in live mode', () => {
    process.env.STORE_MODE = 'live';
    process.env.PAYMENT_PROVIDER = 'fake';
    process.env.MERCADO_PAGO_ENVIRONMENT = 'live';
    resetEnvCacheForTests();
    expect(() => getServerEnv()).toThrow(/provider fake é proibido/i);
  });

  it('preserves an absolute HTTPS webhook URL including its query string', () => {
    const webhookUrl =
      'https://preview.example.vercel.app/api/webhooks/mercadopago?x-vercel-protection-bypass=test-only-bypass';
    process.env.MERCADO_PAGO_WEBHOOK_URL = webhookUrl;
    resetEnvCacheForTests();

    expect(getServerEnv().MERCADO_PAGO_WEBHOOK_URL).toBe(webhookUrl);
  });

  it('allows HTTP only for localhost webhook URLs', () => {
    process.env.MERCADO_PAGO_WEBHOOK_URL = 'http://localhost:3000/api/webhooks/mercadopago';
    resetEnvCacheForTests();
    expect(getServerEnv().MERCADO_PAGO_WEBHOOK_URL).toBe(
      'http://localhost:3000/api/webhooks/mercadopago',
    );

    process.env.MERCADO_PAGO_WEBHOOK_URL =
      'http://preview.example/api/webhooks/mercadopago?token=test-only-secret';
    resetEnvCacheForTests();
    expect(() => getServerEnv()).toThrow(/deve usar HTTPS fora de localhost/i);
  });

  it('rejects relative or invalid webhook URLs without exposing their input in the error', () => {
    process.env.MERCADO_PAGO_WEBHOOK_URL =
      '/api/webhooks/mercadopago?x-vercel-protection-bypass=test-only-sensitive-value';
    resetEnvCacheForTests();

    let message = '';
    try {
      getServerEnv();
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toMatch(/URL absoluta válida/i);
    expect(message).not.toContain('test-only-sensitive-value');
  });
});
