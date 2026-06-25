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
  it('keeps the hero poster and forward/reverse transparent videos available', () => {
    const heroAssets = [
      'images/useart-hero-poster.webp',
      'videos/useart-hero-transparente.webm',
      'videos/useart-hero-transparente-reverse.webm',
    ];

    for (const source of heroAssets) {
      expect(existsSync(join(process.cwd(), 'public', source))).toBe(true);
    }
  });

  it('references only existing public asset files', () => {
    const sources = getProducts().flatMap(mediaSources);

    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      expect(existsSync(join(process.cwd(), 'public', source))).toBe(true);
    }
  });

  it('maps each image-backed SKU to its own originals and approved cutouts', () => {
    const expectedFolders = {
      'camiseta-hibrida-logo-lateral': 'hybrid-logo-lateral',
      'camiseta-hibrida-logo-central': 'hybrid-logo-central',
      'camiseta-hibrida-assinatura-lateral': 'hybrid-assinatura',
      'camiseta-solid-masculina-assinatura-lateral': 'solid-assinatura',
    } as const;

    for (const [slug, folder] of Object.entries(expectedFolders)) {
      const product = getProductBySlug(slug);
      expect(product).toBeDefined();
      expect(mediaSources(product!)).toHaveLength(3);

      const white = product!.colors.find((color) => color.id === 'branco-off-white')?.media;
      expect(white?.src).toBe(`/assets/products/${folder}/branco.png`);
      expect(white?.cutoutStatus).toBe('needs-review');

      for (const colorId of ['preto', 'marrom'] as const) {
        const media = product!.colors.find((color) => color.id === colorId)?.media;
        expect(media?.src).toBe(`/assets/products/cutouts/${folder}-${colorId}.png`);
        expect(media?.cutoutStatus).toBe('available');
      }
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
