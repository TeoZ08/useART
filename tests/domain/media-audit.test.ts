import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { galleryForProduct, mediaForProductColor } from '@/domain/products/media';
import { getProducts } from '@/domain/products/products';

const projectRoot = process.cwd();

function assetPath(src: string, root = 'public'): string {
  return join(projectRoot, root, src.replace(/^\//, ''));
}

function assetHash(src: string): string {
  return createHash('sha256')
    .update(readFileSync(assetPath(src)))
    .digest('hex');
}

describe('product media audit', () => {
  it('keeps the seven confirmed commercial offers', () => {
    expect(getProducts()).toHaveLength(7);
  });

  it('resolves every color to its own declared media or an explicit pending state', () => {
    for (const product of getProducts()) {
      for (const color of product.colors) {
        const resolved = mediaForProductColor(product, color.id);

        expect(resolved.colorId, `${product.slug}:${color.id}`).toBe(color.id);

        if (color.media?.src) {
          expect(resolved.src, `${product.slug}:${color.id}`).toBe(color.media.src);
          expect(existsSync(assetPath(resolved.src!)), resolved.src).toBe(true);
          continue;
        }

        expect(resolved.status, `${product.slug}:${color.id}`).toBe('pending');
        expect(resolved.src, `${product.slug}:${color.id}`).toBeUndefined();
        expect(resolved.alt).toContain(color.name);
        expect(resolved.pendingReason).toContain(color.name);
      }
    }
  });

  it('keeps available colors distinct and present in the product gallery', () => {
    for (const product of getProducts()) {
      const colorMedia = product.colors
        .map((color) => color.media)
        .filter((media): media is NonNullable<typeof media> => Boolean(media?.src));
      const galleryKeys = new Set(
        galleryForProduct(product).map((media) => media.src ?? media.alt),
      );

      for (const media of colorMedia) {
        expect(galleryKeys).toContain(media.src);
      }

      if (colorMedia.length > 1) {
        expect(new Set(colorMedia.map((media) => assetHash(media.src!))).size).toBe(
          colorMedia.length,
        );
      }
    }
  });

  it.runIf(process.env.AUDIT_BUILD_OUTPUT === '1')(
    'includes every declared available color asset in the static export',
    () => {
      for (const product of getProducts()) {
        for (const color of product.colors) {
          if (!color.media?.src) continue;
          expect(existsSync(assetPath(color.media.src, 'out')), color.media.src).toBe(true);
        }
      }
    },
  );
});
