'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { getServerEnv } from '@/lib/env';
import { writeAdminAudit } from '@/lib/observability/admin-audit';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  storeMode: z.enum(['staging', 'live', 'paused']),
  localDeliveryCity: z.string().trim().min(2).max(120),
  localDeliveryState: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
  localDeliveryFeeCents: z.coerce.number().int().min(0).max(1_000_000),
  defaultLeadTimeDays: z.coerce.number().int().min(0).max(365),
  whatsappNumber: z.string().regex(/^\d{12,13}$/),
  supportEmail: z.union([z.email(), z.literal('')]),
  confirmation: z.string().optional(),
});

export async function saveStoreSettings(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const input = schema.parse(Object.fromEntries(formData));
  const env = getServerEnv();
  const paymentsEnabled = formData.get('paymentsEnabled') === 'on';
  if (
    paymentsEnabled &&
    (!env.PAYMENTS_ENABLED || !env.MERCADO_PAGO_ACCESS_TOKEN || !env.MERCADO_PAGO_WEBHOOK_SECRET)
  ) {
    throw new Error(
      'Pagamento não pode ser habilitado sem flags e credenciais válidas no ambiente.',
    );
  }
  if (input.storeMode === 'live' && env.STORE_MODE !== 'live') {
    throw new Error(
      'O banco não pode entrar em live enquanto o ambiente não estiver em STORE_MODE=live.',
    );
  }
  if ((paymentsEnabled || input.storeMode === 'live') && input.confirmation !== 'CONFIRMAR') {
    throw new Error('Mudança crítica exige digitar CONFIRMAR.');
  }
  const values = {
    store_mode: input.storeMode,
    payments_enabled: paymentsEnabled,
    pickup_enabled: formData.get('pickupEnabled') === 'on',
    local_delivery_enabled: formData.get('localDeliveryEnabled') === 'on',
    local_delivery_city: input.localDeliveryCity,
    local_delivery_state: input.localDeliveryState,
    local_delivery_fee_cents: input.localDeliveryFeeCents,
    national_quote_enabled: formData.get('nationalQuoteEnabled') === 'on',
    default_lead_time_days: input.defaultLeadTimeDays,
    whatsapp_number: input.whatsappNumber,
    support_email: input.supportEmail || null,
  };
  const db = createAdminClient();
  const { error } = await db.from('store_settings').update(values).eq('singleton', true);
  if (error) throw new Error(`Falha ao salvar configurações: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: 'settings.update',
    entityType: 'store_settings',
    entityId: 'singleton',
    metadata: {
      store_mode: input.storeMode,
      payments_enabled: paymentsEnabled,
      pickup_enabled: values.pickup_enabled,
      local_delivery_enabled: values.local_delivery_enabled,
      national_quote_enabled: values.national_quote_enabled,
    },
  });
  revalidatePath('/admin/configuracoes');
  revalidatePath('/');
}
