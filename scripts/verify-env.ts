import { z } from 'zod';

const optionalValue = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const env = z
  .object({
    STORE_MODE: z.enum(['local', 'staging', 'live']).default('local'),
    PAYMENT_PROVIDER: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.enum(['fake', 'mercadopago']).default('mercadopago'),
    ),
    PAYMENTS_ENABLED: z.enum(['true', 'false']).default('false'),
    NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.url().optional(),
    ),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalValue,
    SUPABASE_SECRET_KEY: optionalValue,
    ADMIN_BOOTSTRAP_EMAIL: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.email().optional(),
    ),
    ORDER_TOKEN_PEPPER: optionalValue,
    CUSTOMER_HASH_PEPPER: optionalValue,
  })
  .parse(process.env);
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'ADMIN_BOOTSTRAP_EMAIL',
  'ORDER_TOKEN_PEPPER',
  'CUSTOMER_HASH_PEPPER',
] as const;

const missing = required.filter((key) => !env[key]);
if (missing.length) {
  console.error(`Variáveis ausentes: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Ambiente válido: mode=${env.STORE_MODE}, provider=${env.PAYMENT_PROVIDER}, payments=${env.PAYMENTS_ENABLED}.`,
  );
}
