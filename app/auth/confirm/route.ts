import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAuthConfirmationDestination,
  safeInternalPath,
} from '@/lib/auth/confirmation-destination';
import { createClient } from '@/lib/supabase/server';

const otpQuerySchema = z.object({
  token_hash: z.string().min(16).max(512),
  type: z.enum(['email', 'invite', 'magiclink', 'recovery', 'email_change']),
  next: z.string().max(200).default('/admin'),
});
const codeQuerySchema = z.object({
  code: z.string().min(16).max(2048),
  next: z.string().max(200).default('/conta'),
});

function invalidDestination(requestUrl: URL, next: string) {
  const destination = next.startsWith('/conta')
    ? '/conta?error=invalid_link'
    : '/admin/login?error=invalid_link';
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const params = Object.fromEntries(requestUrl.searchParams);
  const code = codeQuerySchema.safeParse(params);
  const otp = otpQuerySchema.safeParse(params);
  if (!code.success && !otp.success) {
    return invalidDestination(requestUrl, typeof params.next === 'string' ? params.next : '/admin');
  }

  const supabase = await createClient();
  if (code.success) {
    const { error } = await supabase.auth.exchangeCodeForSession(code.data.code);
    if (error) return invalidDestination(requestUrl, code.data.next);
    return NextResponse.redirect(new URL(safeInternalPath(code.data.next), requestUrl.origin));
  }
  if (!otp.success) return invalidDestination(requestUrl, '/admin');
  const { error } = await supabase.auth.verifyOtp({
    token_hash: otp.data.token_hash,
    type: otp.data.type as EmailOtpType,
  });
  if (error) {
    const destination = otp.data.next.startsWith('/conta')
      ? '/conta?error=invalid_link'
      : '/admin/login?error=expired_link';
    return NextResponse.redirect(new URL(destination, requestUrl.origin));
  }

  return NextResponse.redirect(
    new URL(getAuthConfirmationDestination(otp.data.type, otp.data.next), requestUrl.origin),
  );
}
