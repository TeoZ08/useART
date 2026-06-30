import 'server-only';

import { getServerEnv } from '@/lib/env';
import { hashOpaqueValue } from '@/lib/security/opaque-token';
import { createAdminClient } from '@/lib/supabase/admin';

type HeaderReader = { get(name: string): string | null };

export async function consumeRateLimit(
  headers: HeaderReader,
  scope: string,
  maxRequests: number,
  windowSeconds: number,
) {
  const env = getServerEnv();
  if (!env.CUSTOMER_HASH_PEPPER) throw new Error('Rate limit pepper não configurado.');
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const source = forwarded || headers.get('x-real-ip') || 'unknown';
  const keyHash = hashOpaqueValue(`${scope}\u0000${source}`, env.CUSTOMER_HASH_PEPPER);
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('consume_rate_limit_v1', {
    p_scope: scope,
    p_key_hash: keyHash,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(`Falha no rate limit: ${error.message}`);
  return data;
}
