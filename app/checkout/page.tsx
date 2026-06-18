import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout assistido',
  description: 'Prepare a mensagem de pedido para o WhatsApp da ART.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
