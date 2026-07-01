import 'server-only';

import { getServerEnv, getSiteUrl } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicOrder } from '@/services/orders/public-order';
import { createPaymentProvider } from '@/services/payments/provider-factory';

export async function createPaymentPreference(publicToken: string, idempotencyKey: string) {
  const env = getServerEnv();
  if (!env.PAYMENTS_ENABLED) throw new Error('Pagamentos estão desabilitados.');

  const order = await getPublicOrder(publicToken);
  if (!order) throw new Error('Pedido não encontrado.');
  if (order.total_cents === null)
    throw new Error('O frete precisa ser definido antes do pagamento.');
  if (!['awaiting_payment', 'payment_pending'].includes(order.status)) {
    throw new Error('Pedido não está disponível para pagamento.');
  }
  if (order.expires_at && new Date(order.expires_at).getTime() <= Date.now()) {
    throw new Error('Pedido expirado.');
  }

  const admin = createAdminClient();
  const { data: settings, error: settingsError } = await admin
    .from('store_settings')
    .select('payments_enabled, store_mode')
    .eq('singleton', true)
    .single();
  if (settingsError || !settings.payments_enabled || settings.store_mode === 'paused') {
    throw new Error('Pagamentos indisponíveis na loja.');
  }

  const { data: existing } = await admin
    .from('payment_attempts')
    .select('preference_id, checkout_url, sandbox')
    .eq('idempotency_key', idempotencyKey)
    .eq('order_id', order.id)
    .maybeSingle();
  if (existing?.preference_id && existing.checkout_url) return existing;

  const { error: insertError } = await admin.from('payment_attempts').insert({
    order_id: order.id,
    idempotency_key: idempotencyKey,
    status: 'creating',
    amount_cents: order.total_cents,
    sandbox: env.MERCADO_PAGO_ENVIRONMENT === 'test',
  });
  if (insertError && insertError.code !== '23505') {
    throw new Error(`Falha ao iniciar pagamento: ${insertError.message}`);
  }

  const siteUrl = getSiteUrl();
  try {
    const preference = await createPaymentProvider().createPreference({
      orderId: order.id,
      orderCode: order.order_code,
      amountCents: order.total_cents,
      expiresAt: order.expires_at ?? undefined,
      idempotencyKey,
      successUrl: new URL('/pagamento/sucesso', siteUrl).toString(),
      pendingUrl: new URL('/pagamento/pendente', siteUrl).toString(),
      failureUrl: new URL('/pagamento/falha', siteUrl).toString(),
      notificationUrl: new URL('/api/webhooks/mercadopago', siteUrl).toString(),
    });

    const { error: updateError } = await admin
      .from('payment_attempts')
      .update({
        preference_id: preference.preferenceId,
        checkout_url: preference.checkoutUrl,
        sandbox: preference.sandbox,
        status: 'preference_created',
      })
      .eq('idempotency_key', idempotencyKey)
      .eq('order_id', order.id);
    if (updateError) throw new Error(`Falha ao persistir preferência: ${updateError.message}`);

    return {
      preference_id: preference.preferenceId,
      checkout_url: preference.checkoutUrl,
      sandbox: preference.sandbox,
    };
  } catch (error) {
    await admin
      .from('payment_attempts')
      .update({
        status: 'failed',
        raw_status: error instanceof Error ? error.message.slice(0, 500) : 'unknown',
      })
      .eq('idempotency_key', idempotencyKey);
    throw error;
  }
}
