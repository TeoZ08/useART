import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const querySchema = z.object({
  token_hash: z.string().min(16).max(512),
  type: z.enum(['email', 'invite', 'magiclink', 'recovery', 'email_change']),
  next: z.string().max(200).default('/admin'),
});

function safeInternalPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/admin';
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(requestUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid_link', requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: parsed.data.token_hash,
    type: parsed.data.type as EmailOtpType,
  });
  if (error) {
    return NextResponse.redirect(new URL('/admin/login?error=expired_link', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(safeInternalPath(parsed.data.next), requestUrl.origin));
}
