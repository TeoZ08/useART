'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseEnv } from '@/lib/env.public';
import type { Database } from '@/types/database.generated';

export function createClient() {
  const env = getPublicSupabaseEnv();
  return createBrowserClient<Database>(env.url, env.publishableKey);
}
