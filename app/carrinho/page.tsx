import type { Metadata } from 'next';
import { CartClient } from '@/components/cart/CartClient';

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Revise produtos, quantidades e cupom antes do checkout.',
};

export default function CartPage() {
  return <CartClient />;
}
