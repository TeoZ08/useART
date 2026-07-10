import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { hasTrustedOrigin } from '@/lib/security/origin';
import { consumeRateLimit } from '@/lib/security/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { createCustomerPaymentPreference } from '@/services/payments/create-preference';

const inputSchema = z.object({ orderId: z.uuid() }).strict();
const idempotencySchema = z.string().trim().min(16).max(128);

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }

  if (!(await consumeRateLimit(request.headers, 'account:create-preference', 10, 600))) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos.' },
      { status: 429 },
    );
  }

  try {
    const { data: authData, error: authError } = await (await createClient()).auth.getUser();
    if (authError || !authData.user?.email || !authData.user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Entre na sua conta para pagar este pedido.' },
        { status: 401 },
      );
    }
    const idempotencyKey = idempotencySchema.parse(request.headers.get('idempotency-key'));
    const { orderId } = inputSchema.parse(await request.json());
    const preference = await createCustomerPaymentPreference(
      orderId,
      authData.user.email,
      idempotencyKey,
    );
    return NextResponse.json({ checkoutUrl: preference.checkout_url, sandbox: preference.sandbox });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 422 });
    }
    console.error('account.create_preference_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Pagamento indisponível.' }, { status: 409 });
  }
}
