import 'server-only';

import { WebhookSignatureValidator } from 'mercadopago';
import { getServerEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPaymentProvider } from '@/services/payments/provider-factory';

type WebhookHeaders = { signature: string | null; requestId: string | null; dataId: string | null };

export async function processMercadoPagoWebhook(headers: WebhookHeaders, eventType: string) {
  const env = getServerEnv();
  if (!env.MERCADO_PAGO_WEBHOOK_SECRET) throw new Error('Webhook secret não configurado.');
  WebhookSignatureValidator.validate({
    xSignature: headers.signature,
    xRequestId: headers.requestId,
    dataId: headers.dataId,
    secret: env.MERCADO_PAGO_WEBHOOK_SECRET,
    toleranceSeconds: 300,
  });
  if (!headers.dataId) throw new Error('Webhook sem data.id.');

  const admin = createAdminClient();
  const { data: webhookEvent, error: eventError } = await admin
    .from('payment_webhook_events')
    .insert({
      provider: 'mercadopago',
      provider_event_id: headers.requestId,
      request_id: headers.requestId,
      provider_payment_id: headers.dataId,
      event_type: eventType,
      signature_valid: true,
    })
    .select('id')
    .single();
  if (eventError?.code === '23505') return { duplicate: true };
  if (eventError) throw new Error(`Falha ao registrar webhook: ${eventError.message}`);

  try {
    const payment = await createPaymentProvider().getPayment(headers.dataId);
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, total_cents')
      .eq('id', payment.externalReference)
      .single();
    if (orderError || !order) throw new Error('Pagamento sem pedido correspondente.');
    if (order.total_cents === null || order.total_cents !== payment.amountCents) {
      throw new Error('Valor do pagamento diverge do pedido.');
    }

    await admin
      .from('payment_attempts')
      .update({
        provider_payment_id: payment.id,
        status: payment.status,
        raw_status: payment.statusDetail ?? payment.status,
      })
      .eq('order_id', order.id);

    if (payment.status === 'approved') {
      const { error } = await admin.rpc('mark_order_paid_v1', {
        p_order_id: order.id,
        p_provider_payment_id: payment.id,
        p_raw_status: payment.statusDetail ?? payment.status,
      });
      if (error) throw new Error(`Falha ao confirmar pedido: ${error.message}`);
    } else if (['rejected', 'cancelled'].includes(payment.status)) {
      await admin
        .from('orders')
        .update({ payment_status: payment.status === 'rejected' ? 'rejected' : 'cancelled' })
        .eq('id', order.id)
        .neq('payment_status', 'approved');
    }

    await admin
      .from('payment_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', webhookEvent.id);
    return { duplicate: false };
  } catch (error) {
    await admin
      .from('payment_webhook_events')
      .update({
        processing_error: error instanceof Error ? error.message.slice(0, 1000) : 'unknown',
        processed_at: new Date().toISOString(),
      })
      .eq('id', webhookEvent.id);
    throw error;
  }
}
