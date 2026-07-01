import type { CatalogProduct, ProductColorId, ProductMedia } from '@/types/commerce';

export function productMediaKey(media: ProductMedia): string {
  return media.src ?? media.alt;
}

export function mediaForProductColor(
  product: CatalogProduct,
  colorId: ProductColorId,
): ProductMedia {
  const color = product.colors.find((item) => item.id === colorId);

  if (color?.media) return { ...color.media, colorId };

  return {
    ...product.media,
    colorId,
    alt: color ? `Apresentação de ${product.name} na cor ${color.name}` : product.media.alt,
    pendingReason: color
      ? `Imagem desta variação (${color.name}) ainda pendente.`
      : product.media.pendingReason,
  };
}

export function galleryForProduct(product: CatalogProduct): ProductMedia[] {
  const media = [
    ...product.colors.flatMap((color) => (color.media ? [color.media] : [])),
    ...product.gallery,
  ];

  return media.filter(
    (item, index, source) =>
      source.findIndex((candidate) => productMediaKey(candidate) === productMediaKey(item)) ===
      index,
  );
}
