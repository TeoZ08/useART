import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getServerEnv } from '@/lib/env';
import { normalizeEmail, normalizePhone } from '@/lib/security/contact';
import { deriveOpaqueToken, hashOpaqueValue } from '@/lib/security/opaque-token';
import type { CheckoutInput } from '@/services/checkout/schema';
import type { Json } from '@/types/database.generated';

type OrderRpcResult = {
  orderId: string;
  orderCode: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number | null;
  totalCents: number | null;
  idempotentReplay: boolean;
};

export async function createOrder(input: CheckoutInput, idempotencyKey: string) {
  const env = getServerEnv();
  if (!env.ORDER_TOKEN_PEPPER || !env.CUSTOMER_HASH_PEPPER) {
    throw new Error('Peppers de segurança do checkout não estão configurados.');
  }

  const phoneNormalized = normalizePhone(input.customer.phone);
  const emailNormalized = normalizeEmail(input.customer.email);
  const publicToken = deriveOpaqueToken(idempotencyKey, env.ORDER_TOKEN_PEPPER);
  const publicTokenHash = hashOpaqueValue(publicToken, env.ORDER_TOKEN_PEPPER);
  const customerKeyHash = hashOpaqueValue(
    `${phoneNormalized}\u0000${emailNormalized}`,
    env.CUSTOMER_HASH_PEPPER,
  );
  const address = 'address' in input.shipping ? input.shipping.address : null;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('create_order_v2', {
    p_checkout_idempotency_key: idempotencyKey,
    p_public_token_hash: publicTokenHash,
    p_customer_key_hash: customerKeyHash,
    p_customer_name: input.customer.name,
    p_customer_phone: input.customer.phone,
    p_customer_phone_normalized: phoneNormalized,
    p_customer_email: input.customer.email ?? '',
    p_customer_email_normalized: emailNormalized,
    p_privacy_terms_version: input.privacyTermsVersion,
    p_shipping_method: input.shipping.method,
    p_address: address as Json,
    p_coupon_code: input.couponCode ?? '',
    p_notes: input.notes ?? '',
    p_items: input.items as Json,
  });

  if (error) throw new Error(`Não foi possível criar o pedido: ${error.message}`);
  const order = data as OrderRpcResult;

  return { ...order, publicToken };
}
