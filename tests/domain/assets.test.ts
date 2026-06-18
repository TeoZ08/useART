import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getProductBySlug, getProducts } from '@/domain/products/products';
import type { CatalogProduct } from '@/types/commerce';

function mediaSources(product: CatalogProduct): string[] {
  const sources = [
    product.media.src,
    ...product.gallery.map((media) => media.src),
    ...product.colors.map((color) => color.media?.src),
  ].filter((src): src is string => Boolean(src));

  return Array.from(new Set(sources));
}

describe('product assets', () => {
  it('references only existing public asset files', () => {
    const sources = getProducts().flatMap(mediaSources);

    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      expect(existsSync(join(process.cwd(), 'public', source))).toBe(true);
    }
  });

  it('maps each image-backed SKU to its own folder', () => {
    const expectedFolders = {
      'camiseta-hibrida-logo-lateral': '/assets/products/hybrid-logo-lateral/',
      'camiseta-hibrida-logo-central': '/assets/products/hybrid-logo-central/',
      'camiseta-hibrida-assinatura-lateral': '/assets/products/hybrid-assinatura/',
      'camiseta-solid-masculina-assinatura-lateral': '/assets/products/solid-assinatura/',
    } as const;

    for (const [slug, folder] of Object.entries(expectedFolders)) {
      const product = getProductBySlug(slug);
      expect(product).toBeDefined();
      expect(mediaSources(product!)).toHaveLength(3);
      expect(mediaSources(product!).every((source) => source.startsWith(folder))).toBe(true);
    }
  });

  it('keeps placeholders for products without confirmed images', () => {
    const pendingSlugs = [
      'moletom-art',
      'kit-selecao-3-camisetas',
      'camiseta-solid-masculina-logo-central',
    ];

    for (const slug of pendingSlugs) {
      const product = getProductBySlug(slug);
      expect(product).toBeDefined();
      expect(product!.media.status).toBe('pending');
      expect(product!.media.src).toBeUndefined();
      expect(mediaSources(product!)).toHaveLength(0);
    }
  });

  it('does not use plain Solid images as Solid logo central', () => {
    const product = getProductBySlug('camiseta-solid-masculina-logo-central');

    expect(product).toBeDefined();
    expect(mediaSources(product!).some((source) => source.includes('/solid-lisa/'))).toBe(false);
  });
});
