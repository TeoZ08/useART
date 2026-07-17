import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from '@/lib/env';
import type { Database } from '@/types/database.generated';

export function createAdminClient() {
  const env = requireSupabaseEnv();
  return createClient<Database>(env.url, env.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
