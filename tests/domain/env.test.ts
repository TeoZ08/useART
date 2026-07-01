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
});
