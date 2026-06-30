import 'server-only';

import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import type {
  PaymentPreference,
  PaymentPreferenceInput,
  PaymentProvider,
  ProviderPayment,
} from '@/domain/payments/provider';

export class MercadoPagoProvider implements PaymentProvider {
  private readonly payment: Payment;
  private readonly preference: Preference;

  constructor(
    accessToken: string,
    private readonly sandbox: boolean,
  ) {
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
    this.payment = new Payment(client);
    this.preference = new Preference(client);
  }

  async createPreference(input: PaymentPreferenceInput): Promise<PaymentPreference> {
    const response = await this.preference.create({
      body: {
        items: [
          {
            id: input.orderId,
            title: `Pedido ART ${input.orderCode}`,
            currency_id: 'BRL',
            quantity: 1,
            unit_price: input.amountCents / 100,
          },
        ],
        payer: input.customerEmail ? { email: input.customerEmail } : undefined,
        external_reference: input.orderId,
        notification_url: input.notificationUrl,
        back_urls: {
          success: input.successUrl,
          pending: input.pendingUrl,
          failure: input.failureUrl,
        },
        auto_return: 'approved',
        expires: Boolean(input.expiresAt),
        expiration_date_to: input.expiresAt,
        statement_descriptor: 'ART',
        metadata: { order_code: input.orderCode },
      },
      requestOptions: { idempotencyKey: input.idempotencyKey },
    });

    const checkoutUrl = this.sandbox ? response.sandbox_init_point : response.init_point;
    if (!response.id || !checkoutUrl)
      throw new Error('Mercado Pago retornou preferência incompleta.');

    return {
      provider: 'mercadopago',
      preferenceId: response.id,
      checkoutUrl,
      sandbox: this.sandbox,
    };
  }

  async getPayment(paymentId: string): Promise<ProviderPayment> {
    const payment = await this.payment.get({ id: paymentId });
    if (
      !payment.id ||
      !payment.external_reference ||
      !payment.status ||
      payment.transaction_amount == null
    ) {
      throw new Error('Mercado Pago retornou pagamento incompleto.');
    }

    return {
      id: String(payment.id),
      externalReference: payment.external_reference,
      status: payment.status,
      statusDetail: payment.status_detail,
      amountCents: Math.round(payment.transaction_amount * 100),
    };
  }
}
