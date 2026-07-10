import 'server-only';

import { getServerEnv, getSiteUrl } from '@/lib/env';
import { normalizeEmail } from '@/lib/security/contact';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicOrder } from '@/services/orders/public-order';
import { createPaymentProvider } from '@/services/payments/provider-factory';

type PayableOrder = {
  id: string;
  order_code: string;
  status: string;
  total_cents: number | null;
  expires_at: string | null;
  customer_email_normalized: string | null;
};

export function getMercadoPagoNotificationUrl(siteUrl: URL): string {
  return (
    getServerEnv().MERCADO_PAGO_WEBHOOK_URL ??
    new URL('/api/webhooks/mercadopago', siteUrl).toString()
  );
}

export async function createPaymentPreference(publicToken: string, idempotencyKey: string) {
  const publicOrder = await getPublicOrder(publicToken);
  if (!publicOrder) throw new Error('Pedido não encontrado.');
  return createPaymentPreferenceForOrder(publicOrder.id, idempotencyKey);
}

export async function createCustomerPaymentPreference(
  orderId: string,
  customerEmail: string,
  idempotencyKey: string,
) {
  const normalizedEmail = normalizeEmail(customerEmail);
  if (!normalizedEmail) throw new Error('Sessão de cliente inválida.');

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('customer_email_normalized', normalizedEmail)
    .maybeSingle();
  if (error || !order) throw new Error('Pedido não encontrado.');
  return createPaymentPreferenceForOrder(order.id, idempotencyKey);
}

async function createPaymentPreferenceForOrder(orderId: string, idempotencyKey: string) {
  const env = getServerEnv();
  if (!env.PAYMENTS_ENABLED) throw new Error('Pagamentos estão desabilitados.');

  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, order_code, status, total_cents, expires_at, customer_email_normalized')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError || !order) throw new Error('Pedido não encontrado.');
  const payableOrder = order as PayableOrder;
  if (payableOrder.total_cents === null)
    throw new Error('O frete precisa ser definido antes do pagamento.');
  if (!['awaiting_payment', 'payment_pending'].includes(payableOrder.status)) {
    throw new Error('Pedido não está disponível para pagamento.');
  }
  if (payableOrder.expires_at && new Date(payableOrder.expires_at).getTime() <= Date.now()) {
    throw new Error('Pedido expirado.');
  }

  const { data: settings, error: settingsError } = await admin
    .from('store_settings')
    .select('payments_enabled, store_mode')
    .eq('singleton', true)
    .single();
  if (settingsError || !settings.payments_enabled || settings.store_mode === 'paused') {
    throw new Error('Pagamentos indisponíveis na loja.');
  }

  const { data: reusable, error: reusableError } = await admin
    .from('payment_attempts')
    .select('preference_id, checkout_url, sandbox, amount_cents')
    .eq('order_id', payableOrder.id)
    .eq('status', 'preference_created')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (reusableError) throw new Error('Não foi possível verificar tentativas de pagamento.');
  if (
    reusable?.preference_id &&
    reusable.checkout_url &&
    reusable.amount_cents === payableOrder.total_cents &&
    reusable.sandbox === (env.MERCADO_PAGO_ENVIRONMENT === 'test')
  ) {
    return reusable;
  }

  const { data: existing } = await admin
    .from('payment_attempts')
    .select('preference_id, checkout_url, sandbox')
    .eq('idempotency_key', idempotencyKey)
    .eq('order_id', payableOrder.id)
    .maybeSingle();
  if (existing?.preference_id && existing.checkout_url) return existing;

  const { error: insertError } = await admin.from('payment_attempts').insert({
    order_id: payableOrder.id,
    idempotency_key: idempotencyKey,
    status: 'creating',
    amount_cents: payableOrder.total_cents,
    sandbox: env.MERCADO_PAGO_ENVIRONMENT === 'test',
  });
  if (insertError && insertError.code !== '23505') {
    throw new Error(`Falha ao iniciar pagamento: ${insertError.message}`);
  }

  const siteUrl = getSiteUrl();
  try {
    const preference = await createPaymentProvider().createPreference({
      orderId: payableOrder.id,
      orderCode: payableOrder.order_code,
      amountCents: payableOrder.total_cents,
      customerEmail: payableOrder.customer_email_normalized ?? undefined,
      expiresAt: payableOrder.expires_at ?? undefined,
      idempotencyKey,
      successUrl: new URL('/pagamento/sucesso', siteUrl).toString(),
      pendingUrl: new URL('/pagamento/pendente', siteUrl).toString(),
      failureUrl: new URL('/pagamento/falha', siteUrl).toString(),
      notificationUrl: getMercadoPagoNotificationUrl(siteUrl),
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
      .eq('order_id', payableOrder.id);
    if (updateError) throw new Error(`Falha ao persistir preferência: ${updateError.message}`);

    return {
      preference_id: preference.preferenceId,
      checkout_url: preference.checkoutUrl,
      sandbox: preference.sandbox,
    };
  } catch {
    await admin
      .from('payment_attempts')
      .update({
        status: 'failed',
        raw_status: 'preference_creation_failed',
      })
      .eq('idempotency_key', idempotencyKey);
    throw new Error('Não foi possível criar a preferência de pagamento.');
  }
}
