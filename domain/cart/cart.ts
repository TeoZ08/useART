import { applyCoupon } from '@/domain/coupon/coupon';
import { mediaForProductColor } from '@/domain/products/media';
import type { ShippingQuote } from '@/domain/shipping/shipping';
import type {
  CartItem,
  CartItemSelection,
  CartTotals,
  CatalogVariant,
  CatalogProduct,
  ProductMedia,
} from '@/types/commerce';

export function buildCartItemId(productSlug: string, selection: CartItemSelection): string {
  const selectionKey =
    selection.type === 'simple'
      ? `${selection.colorId}-${selection.size}`
      : selection.pieces
          .map(
            (piece) => `${piece.pieceNumber}-${piece.applicationId}-${piece.colorId}-${piece.size}`,
          )
          .join('|');

  return `${productSlug}:${selectionKey}`;
}

export function createCartItem(
  product: CatalogProduct,
  selection: CartItemSelection,
  quantity = 1,
): CartItem {
  const variant = findVariantForSelection(product, selection);
  if (!variant) throw new Error('A seleção não corresponde a uma variante disponível.');
  return {
    id: buildCartItemId(product.slug, selection),
    variantId: variant.id,
    productSlug: product.slug,
    productName: product.name,
    unitPriceCents: variant.priceCents,
    quantity: Math.max(1, quantity),
    image: imageForSelection(product, selection),
    selection,
  };
}

export function findVariantForSelection(
  product: CatalogProduct,
  selection: CartItemSelection,
): CatalogVariant | undefined {
  if (selection.type === 'kit') {
    return product.variants.find(
      (variant) =>
        !variant.colorId &&
        !variant.size &&
        !variant.applicationId &&
        variant.availabilityMode !== 'unavailable',
    );
  }

  return product.variants.find(
    (variant) =>
      variant.colorId === selection.colorId &&
      variant.size === selection.size &&
      !variant.applicationId &&
      variant.availabilityMode !== 'unavailable' &&
      (variant.availabilityMode !== 'limited' || (variant.stockQuantity ?? 0) > 0),
  );
}

function imageForSelection(product: CatalogProduct, selection: CartItemSelection): ProductMedia {
  if (selection.type === 'kit') {
    return product.media;
  }

  return mediaForProductColor(product, selection.colorId);
}

export function addCartItem(items: CartItem[], nextItem: CartItem): CartItem[] {
  const current = items.find((item) => item.id === nextItem.id);

  if (!current) {
    return [...items, nextItem];
  }

  return items.map((item) =>
    item.id === nextItem.id ? { ...item, quantity: item.quantity + nextItem.quantity } : item,
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  itemId: string,
  quantity: number,
): CartItem[] {
  const normalizedQuantity = Math.max(1, Math.floor(quantity));

  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: normalizedQuantity } : item,
  );
}

export function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}

export function calculateCartTotals(
  items: CartItem[],
  couponCode: string,
  shippingQuote?: ShippingQuote,
): CartTotals {
  const subtotalCents = calculateSubtotal(items);
  const coupon = applyCoupon(subtotalCents, couponCode);
  const shippingCents = shippingQuote?.priceCents ?? 0;
  const knownShipping = shippingQuote?.priceCents !== null;

  return {
    subtotalCents,
    discountCents: coupon.discountCents,
    shippingCents: shippingQuote ? shippingQuote.priceCents : 0,
    totalCents: knownShipping
      ? Math.max(0, subtotalCents - coupon.discountCents + shippingCents)
      : null,
  };
}
