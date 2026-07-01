import type {
  PaymentPreference,
  PaymentPreferenceInput,
  PaymentProvider,
  ProviderPayment,
} from '@/domain/payments/provider';

export class FakePaymentProvider implements PaymentProvider {
  async createPreference(input: PaymentPreferenceInput): Promise<PaymentPreference> {
    return {
      provider: 'mercadopago',
      preferenceId: `fake-${input.idempotencyKey}`,
      checkoutUrl: `http://localhost:3000/pagamento/pendente?order=${input.orderCode}`,
      sandbox: true,
    };
  }

  async getPayment(paymentId: string): Promise<ProviderPayment> {
    return {
      id: paymentId,
      externalReference: 'fake-order',
      status: 'pending',
      amountCents: 0,
    };
  }
}
