import type { CartItemSelection, CatalogProduct } from '@/types/commerce';

export function withTestVariant(
  product: CatalogProduct,
  selection: CartItemSelection,
): CatalogProduct {
  return {
    ...product,
    commerceAvailable: true,
    variants: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        sku: `TEST-${product.slug}`,
        colorId: selection.type === 'simple' ? selection.colorId : undefined,
        size: selection.type === 'simple' ? selection.size : undefined,
        priceCents: product.priceCents,
        availabilityMode: 'on_demand',
      },
    ],
  };
}
