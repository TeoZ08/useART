import 'server-only';

import type { PaymentProvider } from '@/domain/payments/provider';
import { getServerEnv } from '@/lib/env';
import { FakePaymentProvider } from '@/services/payments/fake-provider';
import { MercadoPagoProvider } from '@/services/payments/mercadopago-provider';

export function createPaymentProvider(): PaymentProvider {
  const env = getServerEnv();
  if (env.PAYMENT_PROVIDER === 'fake') {
    if (env.STORE_MODE === 'live') throw new Error('Provider fake proibido em live.');
    return new FakePaymentProvider();
  }

  if (!env.MERCADO_PAGO_ACCESS_TOKEN) throw new Error('Mercado Pago não está configurado.');
  return new MercadoPagoProvider(
    env.MERCADO_PAGO_ACCESS_TOKEN,
    env.MERCADO_PAGO_ENVIRONMENT === 'test',
  );
}
