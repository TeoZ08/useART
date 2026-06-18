import type { Metadata } from 'next';
import { CartClient } from '@/components/cart/CartClient';

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Revise produtos, cupom e subtotal antes do checkout assistido.',
};

export default function CartPage() {
  return <CartClient />;
}
