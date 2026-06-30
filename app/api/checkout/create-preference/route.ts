import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { hasTrustedOrigin } from '@/lib/security/origin';
import { createPaymentPreference } from '@/services/payments/create-preference';

const inputSchema = z.object({ publicToken: z.string().min(32).max(128) }).strict();
const idempotencySchema = z.string().trim().min(16).max(128);

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }

  try {
    const idempotencyKey = idempotencySchema.parse(request.headers.get('idempotency-key'));
    const { publicToken } = inputSchema.parse(await request.json());
    const preference = await createPaymentPreference(publicToken, idempotencyKey);
    return NextResponse.json({ checkoutUrl: preference.checkout_url, sandbox: preference.sandbox });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 422 });
    }
    console.error('checkout.create_preference_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Pagamento indisponível.' }, { status: 409 });
  }
}
