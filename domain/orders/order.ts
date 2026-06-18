import { describeSelection } from '@/domain/cart/selection';
import type { ShippingQuote } from '@/domain/shipping/shipping';
import type { CartItem } from '@/types/commerce';

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
}

export interface AddressData {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface AssistedOrder {
  id: string;
  createdAt: string;
  customer: CustomerData;
  address: AddressData;
  shipping: ShippingQuote;
  paymentNote: string;
  items: CartItem[];
  couponCode: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number | null;
  totalCents: number | null;
}

export function buildOrderId(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `ART-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function formatItemForOrder(item: CartItem): string[] {
  return [
    `${item.quantity}x ${item.productName}`,
    ...describeSelection(item.selection).map((line) => `  - ${line}`),
  ];
}
