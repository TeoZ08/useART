import { z } from 'zod';

const optionalValue = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const env = z
  .object({
    STORE_MODE: z.string().optional(),
    PAYMENTS_ENABLED: z.string().optional(),
    PAYMENT_PROVIDER: z.string().optional(),
    MERCADO_PAGO_ENVIRONMENT: z.string().optional(),
    MERCADO_PAGO_ACCESS_TOKEN: optionalValue,
    MERCADO_PAGO_WEBHOOK_SECRET: optionalValue,
  })
  .parse(process.env);
const failures: string[] = [];

if (env.STORE_MODE !== 'live') failures.push('STORE_MODE deve ser live.');
if (env.PAYMENTS_ENABLED !== 'true') failures.push('PAYMENTS_ENABLED deve estar habilitado.');
if (env.PAYMENT_PROVIDER !== 'mercadopago') failures.push('Provider deve ser mercadopago.');
if (env.MERCADO_PAGO_ENVIRONMENT !== 'live') failures.push('Mercado Pago deve estar em live.');
if (!env.MERCADO_PAGO_ACCESS_TOKEN) failures.push('Access token live ausente.');
if (!env.MERCADO_PAGO_WEBHOOK_SECRET) failures.push('Webhook secret live ausente.');

if (failures.length) {
  console.error('Produção bloqueada:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Gates de configuração live aprovados. Ainda requer checklist e aprovação humana.');
}
