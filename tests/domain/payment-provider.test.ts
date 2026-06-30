import { describe, expect, it } from 'vitest';
import { FakePaymentProvider } from '@/services/payments/fake-provider';

describe('fake payment provider', () => {
  it('creates deterministic non-live preferences', async () => {
    const provider = new FakePaymentProvider();
    const result = await provider.createPreference({
      orderId: 'order-id',
      orderCode: 'ART-1',
      amountCents: 4500,
      idempotencyKey: 'attempt-id',
      successUrl: 'http://localhost/success',
      pendingUrl: 'http://localhost/pending',
      failureUrl: 'http://localhost/failure',
      notificationUrl: 'http://localhost/webhook',
    });

    expect(result.sandbox).toBe(true);
    expect(result.preferenceId).toBe('fake-attempt-id');
    expect(result.checkoutUrl).toContain('/pagamento/pendente');
  });
});
