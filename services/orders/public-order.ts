import 'server-only';

import { getServerEnv } from '@/lib/env';
import { hashOpaqueValue } from '@/lib/security/opaque-token';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getPublicOrder(publicToken: string) {
  const env = getServerEnv();
  if (!env.ORDER_TOKEN_PEPPER) throw new Error('ORDER_TOKEN_PEPPER não configurado.');
  const tokenHash = hashOpaqueValue(publicToken, env.ORDER_TOKEN_PEPPER);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select(
      'id, order_code, status, payment_status, shipping_method, subtotal_cents, discount_cents, shipping_cents, total_cents, expires_at, created_at, paid_at, order_items(product_name_snapshot, sku_snapshot, unit_price_cents, quantity, selection, image_snapshot)',
    )
    .eq('public_token_hash', tokenHash)
    .maybeSingle();

  if (error) throw new Error(`Falha ao consultar pedido: ${error.message}`);
  return data;
}
