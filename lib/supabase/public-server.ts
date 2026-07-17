import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { requirePublicSupabaseEnv } from '@/lib/env';
import type { Database } from '@/types/database.generated';

export function createPublicServerClient() {
  const env = requirePublicSupabaseEnv();
  return createClient<Database>(env.url, env.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
