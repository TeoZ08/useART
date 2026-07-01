export type PaymentPreferenceInput = {
  orderId: string;
  orderCode: string;
  amountCents: number;
  customerEmail?: string;
  expiresAt?: string;
  idempotencyKey: string;
  successUrl: string;
  pendingUrl: string;
  failureUrl: string;
  notificationUrl: string;
};

export type PaymentPreference = {
  provider: 'mercadopago';
  preferenceId: string;
  checkoutUrl: string;
  sandbox: boolean;
};

export type ProviderPayment = {
  id: string;
  externalReference: string;
  status: string;
  statusDetail?: string;
  amountCents: number;
};

export interface PaymentProvider {
  createPreference(input: PaymentPreferenceInput): Promise<PaymentPreference>;
  getPayment(paymentId: string): Promise<ProviderPayment>;
}
