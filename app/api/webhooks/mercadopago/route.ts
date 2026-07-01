import { InvalidWebhookSignatureError } from 'mercadopago';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processMercadoPagoWebhook } from '@/services/payments/process-webhook';

const eventSchema = z
  .object({ type: z.string().max(100).optional(), action: z.string().max(100).optional() })
  .passthrough();

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 65_536) return new NextResponse(null, { status: 413 });

  try {
    const event = eventSchema.parse(await request.json());
    const url = new URL(request.url);
    await processMercadoPagoWebhook(
      {
        signature: request.headers.get('x-signature'),
        requestId: request.headers.get('x-request-id'),
        dataId: url.searchParams.get('data.id') ?? url.searchParams.get('id'),
      },
      event.type ?? event.action ?? 'unknown',
    );
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn('mercadopago.webhook_invalid_signature', { reason: error.reason });
      return new NextResponse(null, { status: 401 });
    }
    console.error('mercadopago.webhook_processing_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return new NextResponse(null, { status: 500 });
  }
}
