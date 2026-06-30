import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import { hasTrustedOrigin } from '@/lib/security/origin';
import { consumeRateLimit } from '@/lib/security/rate-limit';
import { createOrder } from '@/services/checkout/create-order';
import { checkoutInputSchema } from '@/services/checkout/schema';

const idempotencyKeySchema = z.string().trim().min(16).max(128);

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }

  if (!(await consumeRateLimit(request.headers, 'checkout:create-order', 5, 600))) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
  }

  try {
    const idempotencyKey = idempotencyKeySchema.parse(request.headers.get('idempotency-key'));
    const input = checkoutInputSchema.parse(await request.json());
    const order = await createOrder(input, idempotencyKey);

    return NextResponse.json(
      {
        orderCode: order.orderCode,
        status: order.status,
        subtotalCents: order.subtotalCents,
        discountCents: order.discountCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        orderUrl: `/pedido/${order.publicToken}`,
        paymentUrl: order.totalCents === null ? null : `/pagar/${order.publicToken}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados de checkout inválidos.', fields: z.treeifyError(error) },
        { status: 422 },
      );
    }

    console.error('checkout.create_order_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Não foi possível criar o pedido.' }, { status: 409 });
  }
}
