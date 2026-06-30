import 'server-only';

import { randomUUID } from 'node:crypto';
import { getServerEnv, getSiteUrl } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPaymentProvider } from '@/services/payments/provider-factory';

export async function createAdminPaymentPreference(orderId: string) {
  const env = getServerEnv();
  if (!env.PAYMENTS_ENABLED) throw new Error('Pagamentos estão desabilitados no ambiente.');
  const db = createAdminClient();
  const [{ data: order, error }, { data: settings }] = await Promise.all([
    db
      .from('orders')
      .select('id, order_code, total_cents, customer_email, expires_at, status')
      .eq('id', orderId)
      .single(),
    db.from('store_settings').select('payments_enabled, store_mode').eq('singleton', true).single(),
  ]);
  if (error || !order) throw new Error('Pedido não encontrado.');
  if (!settings?.payments_enabled || settings.store_mode === 'paused') {
    throw new Error('Pagamentos desabilitados na loja.');
  }
  if (
    order.total_cents === null ||
    !['awaiting_payment', 'payment_pending'].includes(order.status)
  ) {
    throw new Error('Pedido não está apto para pagamento.');
  }
  const idempotencyKey = `admin:${order.id}:${randomUUID()}`;
  const { error: insertError } = await db.from('payment_attempts').insert({
    order_id: order.id,
    idempotency_key: idempotencyKey,
    status: 'creating',
    amount_cents: order.total_cents,
    sandbox: env.MERCADO_PAGO_ENVIRONMENT === 'test',
  });
  if (insertError) throw new Error(`Falha ao iniciar tentativa: ${insertError.message}`);
  const siteUrl = getSiteUrl();
  try {
    const preference = await createPaymentProvider().createPreference({
      orderId: order.id,
      orderCode: order.order_code,
      amountCents: order.total_cents,
      customerEmail: order.customer_email ?? undefined,
      expiresAt: order.expires_at ?? undefined,
      idempotencyKey,
      successUrl: new URL('/pagamento/sucesso', siteUrl).toString(),
      pendingUrl: new URL('/pagamento/pendente', siteUrl).toString(),
      failureUrl: new URL('/pagamento/falha', siteUrl).toString(),
      notificationUrl: new URL('/api/webhooks/mercadopago', siteUrl).toString(),
    });
    const { error: updateError } = await db
      .from('payment_attempts')
      .update({
        preference_id: preference.preferenceId,
        checkout_url: preference.checkoutUrl,
        sandbox: preference.sandbox,
        status: 'preference_created',
      })
      .eq('idempotency_key', idempotencyKey);
    if (updateError) throw updateError;
    return preference;
  } catch (cause) {
    await db
      .from('payment_attempts')
      .update({
        status: 'failed',
        raw_status: cause instanceof Error ? cause.message.slice(0, 500) : 'unknown',
      })
      .eq('idempotency_key', idempotencyKey);
    throw cause;
  }
}
