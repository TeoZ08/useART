import type { CartItem } from '@/types/commerce';

export interface CartRepository {
  read(): CartItem[];
  write(items: CartItem[]): void;
  clear(): void;
}

export const CART_STORAGE_KEY = 'art.cart.v1';
export const COUPON_STORAGE_KEY = 'art.coupon.v1';
export const CART_CHANGED_EVENT = 'art:cart-changed';
export const COUPON_CHANGED_EVENT = 'art:coupon-changed';

function emitCartChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
  }
}

export class LocalCartRepository implements CartRepository {
  read(): CartItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  write(items: CartItem[]): void {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    emitCartChanged();
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(CART_STORAGE_KEY);
    emitCartChanged();
  }
}

export const localCartRepository = new LocalCartRepository();

export function readStoredCoupon(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(COUPON_STORAGE_KEY) ?? '';
}

export function writeStoredCoupon(code: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COUPON_STORAGE_KEY, code);
  window.dispatchEvent(new CustomEvent(COUPON_CHANGED_EVENT));
}
