import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { hasTrustedOrigin } from '@/lib/security/origin';
import { consumeRateLimit } from '@/lib/security/rate-limit';
import { reconcileMercadoPagoPayment } from '@/services/payments/process-webhook';

const inputSchema = z.object({ paymentId: z.string().trim().min(1).max(128) }).strict();

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }
  if (!(await consumeRateLimit(request.headers, 'payments:reconcile-return', 10, 600))) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos.' },
      { status: 429 },
    );
  }

  try {
    const { paymentId } = inputSchema.parse(await request.json());
    const result = await reconcileMercadoPagoPayment(paymentId);
    return NextResponse.json({ status: result.status });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 422 });
    console.error('payment.return_reconciliation_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      { error: 'Não foi possível confirmar o pagamento ainda.' },
      { status: 409 },
    );
  }
}
