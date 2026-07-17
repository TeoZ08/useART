import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseEnv } from '@/lib/env.public';
import type { Database } from '@/types/database.generated';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let env: ReturnType<typeof getPublicSupabaseEnv>;

  try {
    env = getPublicSupabaseEnv();
  } catch {
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
