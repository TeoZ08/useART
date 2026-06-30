'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { writeAdminAudit } from '@/lib/observability/admin-audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAdminPaymentPreference } from '@/services/payments/create-admin-preference';

export async function quoteNationalShipping(formData: FormData) {
  const actor = await requireAdmin();
  const orderId = z.uuid().parse(formData.get('orderId'));
  const shippingCents = z.coerce
    .number()
    .int()
    .min(0)
    .max(1_000_000)
    .parse(formData.get('shippingCents'));
  const note = z
    .string()
    .trim()
    .max(1000)
    .parse(formData.get('note') ?? '');
  const db = createAdminClient();
  const { error } = await db.rpc('admin_quote_order_v1', {
    p_order_id: orderId,
    p_shipping_cents: shippingCents,
    p_actor_user_id: actor.userId,
    p_note: note || undefined,
  });
  if (error) throw new Error(`Falha ao registrar cotação: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'order.quote',
    entityType: 'order',
    entityId: orderId,
    metadata: { shipping_cents: shippingCents },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath('/admin/pedidos');
}

export async function transitionOrder(formData: FormData) {
  const actor = await requireAdmin();
  const orderId = z.uuid().parse(formData.get('orderId'));
  const targetStatus = z
    .enum(['in_production', 'ready_for_pickup', 'shipped', 'delivered'])
    .parse(formData.get('targetStatus'));
  const note = z
    .string()
    .trim()
    .max(1000)
    .parse(formData.get('note') ?? '');
  const trackingCode = z
    .string()
    .trim()
    .max(160)
    .parse(formData.get('trackingCode') ?? '');
  const trackingUrl = z.union([z.url(), z.literal('')]).parse(formData.get('trackingUrl') ?? '');
  const db = createAdminClient();
  const { error } = await db.rpc('admin_transition_order_v1', {
    p_order_id: orderId,
    p_target_status: targetStatus,
    p_actor_user_id: actor.userId,
    p_note: note || undefined,
    p_tracking_code: trackingCode || undefined,
    p_tracking_url: trackingUrl || undefined,
  });
  if (error) throw new Error(`Transição recusada: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'order.transition',
    entityType: 'order',
    entityId: orderId,
    metadata: { target_status: targetStatus },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin');
}

export async function cancelOrder(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const orderId = z.uuid().parse(formData.get('orderId'));
  const note = z.string().trim().min(3).max(1000).parse(formData.get('note'));
  const db = createAdminClient();
  const { data: order, error: readError } = await db
    .from('orders')
    .select('payment_status')
    .eq('id', orderId)
    .single();
  if (readError) throw new Error('Pedido não encontrado.');
  if (order.payment_status === 'approved')
    throw new Error('Pedido pago exige fluxo de reembolso; cancelamento simples bloqueado.');
  const { error } = await db.rpc('release_order_resources_v1', {
    p_order_id: orderId,
    p_target_status: 'cancelled',
    p_source: 'admin',
    p_note: note,
  });
  if (error) throw new Error(`Falha ao cancelar pedido: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'order.cancel',
    entityType: 'order',
    entityId: orderId,
    metadata: { reason: note.slice(0, 120) },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath('/admin/pedidos');
}

export async function updateOrderNotes(formData: FormData) {
  const actor = await requireAdmin();
  const orderId = z.uuid().parse(formData.get('orderId'));
  const notes = z
    .string()
    .trim()
    .max(2000)
    .parse(formData.get('notes') ?? '');
  const db = createAdminClient();
  const { error } = await db
    .from('orders')
    .update({ notes: notes || null })
    .eq('id', orderId);
  if (error) throw new Error(`Falha ao salvar observação: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'order.notes_update',
    entityType: 'order',
    entityId: orderId,
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function generatePaymentLink(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const orderId = z.uuid().parse(formData.get('orderId'));
  const preference = await createAdminPaymentPreference(orderId);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'payment.preference_create',
    entityType: 'order',
    entityId: orderId,
    metadata: { sandbox: preference.sandbox },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}
