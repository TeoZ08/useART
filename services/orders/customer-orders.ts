import 'server-only';

import { normalizeEmail } from '@/lib/security/contact';
import { createAdminClient } from '@/lib/supabase/admin';

const customerOrderColumns =
  'id, order_code, status, payment_status, shipping_method, address, subtotal_cents, discount_cents, shipping_cents, total_cents, expires_at, created_at, paid_at, order_items(product_name_snapshot, sku_snapshot, unit_price_cents, quantity, selection, image_snapshot)' as const;

export type CustomerOrder = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  shipping_method: string;
  address: unknown | null;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number | null;
  total_cents: number | null;
  expires_at: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: Array<{
    product_name_snapshot: string;
    sku_snapshot: string | null;
    unit_price_cents: number;
    quantity: number;
    selection: unknown;
    image_snapshot: string | null;
  }>;
};

export async function getCustomerOrders(email: string): Promise<CustomerOrder[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select(customerOrderColumns)
    .eq('customer_email_normalized', normalizedEmail)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar os pedidos da conta.');
  return (data ?? []) as CustomerOrder[];
}

export async function getCustomerOrder(
  email: string,
  orderId: string,
): Promise<CustomerOrder | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select(customerOrderColumns)
    .eq('id', orderId)
    .eq('customer_email_normalized', normalizedEmail)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar o pedido da conta.');
  return data as CustomerOrder | null;
}
