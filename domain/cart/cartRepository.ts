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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value) || !isRecord(value.image) || !isRecord(value.selection)) return false;

  const basicFields =
    typeof value.id === 'string' &&
    typeof value.productSlug === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.unitPriceCents === 'number' &&
    Number.isFinite(value.unitPriceCents) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    typeof value.image.status === 'string' &&
    typeof value.image.alt === 'string';

  if (!basicFields) return false;

  if (value.selection.type === 'simple') {
    return (
      typeof value.selection.colorId === 'string' &&
      typeof value.selection.colorName === 'string' &&
      typeof value.selection.size === 'string'
    );
  }

  return (
    value.selection.type === 'kit' &&
    Array.isArray(value.selection.pieces) &&
    value.selection.pieces.length === 3 &&
    value.selection.pieces.every(
      (piece) =>
        isRecord(piece) &&
        typeof piece.pieceNumber === 'number' &&
        typeof piece.applicationId === 'string' &&
        typeof piece.applicationName === 'string' &&
        typeof piece.colorId === 'string' &&
        typeof piece.colorName === 'string' &&
        typeof piece.size === 'string',
    )
  );
}

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
      return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
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
