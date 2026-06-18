import { catalogSeed } from '@/data/catalog.seed';
import type { CatalogProduct } from '@/types/commerce';

export function getProducts(): CatalogProduct[] {
  return [...catalogSeed];
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return catalogSeed.find((product) => product.slug === slug);
}

export function getProductSlugs(): string[] {
  return catalogSeed.map((product) => product.slug);
}
