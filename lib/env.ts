import 'server-only';

import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.url().optional());
const optionalSecret = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);
const booleanFlag = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
    SUPABASE_SECRET_KEY: optionalSecret,
    SUPABASE_PROJECT_REF: optionalSecret,
    MERCADO_PAGO_ACCESS_TOKEN: optionalSecret,
    MERCADO_PAGO_WEBHOOK_SECRET: optionalSecret,
    MERCADO_PAGO_ENVIRONMENT: z.enum(['test', 'live']).default('test'),
    STORE_MODE: z.enum(['local', 'staging', 'live']).default('local'),
    PAYMENTS_ENABLED: booleanFlag,
    NATIONAL_CHECKOUT_ENABLED: booleanFlag,
    ADMIN_BOOTSTRAP_EMAIL: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.email().optional(),
    ),
    ORDER_TOKEN_PEPPER: optionalSecret,
    CUSTOMER_HASH_PEPPER: optionalSecret,
    VERCEL_URL: optionalSecret,
    VERCEL_PROJECT_PRODUCTION_URL: optionalSecret,
  })
  .superRefine((env, context) => {
    const supabaseValues = [
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      env.SUPABASE_SECRET_KEY,
    ];
    const configuredSupabaseValues = supabaseValues.filter(Boolean).length;

    if (configuredSupabaseValues > 0 && configuredSupabaseValues < supabaseValues.length) {
      context.addIssue({
        code: 'custom',
        message: 'Supabase deve ter URL, publishable key e secret key configuradas em conjunto.',
        path: ['NEXT_PUBLIC_SUPABASE_URL'],
      });
    }

    if (
      env.PAYMENTS_ENABLED &&
      (!env.MERCADO_PAGO_ACCESS_TOKEN || !env.MERCADO_PAGO_WEBHOOK_SECRET)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Pagamentos habilitados exigem token e webhook secret do Mercado Pago.',
        path: ['PAYMENTS_ENABLED'],
      });
    }

    if (env.STORE_MODE === 'live') {
      if (env.MERCADO_PAGO_ENVIRONMENT !== 'live') {
        context.addIssue({
          code: 'custom',
          message: 'STORE_MODE=live exige MERCADO_PAGO_ENVIRONMENT=live.',
          path: ['MERCADO_PAGO_ENVIRONMENT'],
        });
      }

      const requiredInLive = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        'SUPABASE_SECRET_KEY',
        'ADMIN_BOOTSTRAP_EMAIL',
        'ORDER_TOKEN_PEPPER',
        'CUSTOMER_HASH_PEPPER',
      ] as const;

      for (const key of requiredInLive) {
        if (!env[key]) {
          context.addIssue({
            code: 'custom',
            message: `${key} é obrigatória em live.`,
            path: [key],
          });
        }
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) cachedEnv = serverEnvSchema.parse(process.env);
  return cachedEnv;
}

export function getSiteUrl(): URL {
  const env = getServerEnv();
  const configuredUrl =
    env.NEXT_PUBLIC_SITE_URL ??
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : undefined);

  if (!configuredUrl) {
    if (env.STORE_MODE === 'local') return new URL('http://localhost:3000');
    throw new Error('NEXT_PUBLIC_SITE_URL não está configurada para este ambiente.');
  }

  return new URL(configuredUrl);
}

export function requireSupabaseEnv() {
  const env = getServerEnv();
  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !env.SUPABASE_SECRET_KEY
  ) {
    throw new Error('Supabase não está completamente configurado neste ambiente.');
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: env.SUPABASE_SECRET_KEY,
  } as const;
}

export function resetEnvCacheForTests() {
  cachedEnv = undefined;
}
