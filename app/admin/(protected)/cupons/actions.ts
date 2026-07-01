'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { writeAdminAudit } from '@/lib/observability/admin-audit';
import { createAdminClient } from '@/lib/supabase/admin';

const optionalInteger = z.preprocess(
  (value) => (value === '' ? null : Number(value)),
  z.number().int().min(0).nullable(),
);
const optionalDate = z.preprocess(
  (value) => (value === '' ? null : new Date(String(value)).toISOString()),
  z.string().datetime().nullable(),
);
const couponSchema = z.object({
  id: z.preprocess((value) => (value === '' ? undefined : value), z.uuid().optional()),
  code: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .transform((value) => value.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().int().positive(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  minimumSubtotalCents: optionalInteger,
  maximumDiscountCents: optionalInteger,
  maxRedemptions: optionalInteger,
  maxRedemptionsPerCustomer: optionalInteger,
});

export async function saveCoupon(formData: FormData) {
  const actor = await requireAdmin(['owner', 'admin']);
  const input = couponSchema.parse(Object.fromEntries(formData));
  const values = {
    code: input.code,
    discount_type: input.discountType,
    value: input.value,
    active: formData.get('active') === 'on',
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    minimum_subtotal_cents: input.minimumSubtotalCents,
    maximum_discount_cents: input.maximumDiscountCents,
    max_redemptions: input.maxRedemptions || null,
    max_redemptions_per_customer: input.maxRedemptionsPerCustomer || null,
    first_order_only: formData.get('firstOrderOnly') === 'on',
    review_required: formData.get('reviewRequired') === 'on',
  };
  const db = createAdminClient();
  const query = input.id
    ? db.from('coupons').update(values).eq('id', input.id).select('id').single()
    : db.from('coupons').insert(values).select('id').single();
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao salvar cupom: ${error.message}`);
  await writeAdminAudit({
    actorUserId: actor.userId,
    action: input.id ? 'coupon.update' : 'coupon.create',
    entityType: 'coupon',
    entityId: data.id,
    metadata: { code: input.code, active: values.active },
  });
  revalidatePath('/admin/cupons');
}
