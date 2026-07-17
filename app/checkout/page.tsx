import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Escolha a forma de entrega e finalize seu pedido ART.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
