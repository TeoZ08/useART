import 'server-only';

import type { CatalogSnapshot } from '@/repositories/catalog/catalog-repository';
import { catalogSeed } from '@/data/catalog.seed';
import { StaticCatalogRepository } from '@/repositories/catalog/static-catalog-repository';
import { SupabaseCatalogRepository } from '@/repositories/catalog/supabase-catalog-repository';
import type { CatalogProduct } from '@/types/commerce';

const remoteRepository = new SupabaseCatalogRepository();
const fallbackRepository = new StaticCatalogRepository();

const launchMediaSlugs = new Set(['moletom-art', 'kit-selecao-3-camisetas']);

function applyLaunchMedia(product: CatalogProduct | null): CatalogProduct | null {
  if (!product) return product;

  const localProduct = catalogSeed.find((candidate) => candidate.slug === product.slug);
  const shouldUseLocalMedia =
    launchMediaSlugs.has(product.slug) || (!product.media.src && Boolean(localProduct?.media.src));
  if (!localProduct || !shouldUseLocalMedia) return product;

  return {
    ...product,
    colors: localProduct.colors,
    media: localProduct.media,
    gallery: localProduct.gallery,
  };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const products = await remoteRepository.listActive();
    if (products.length !== 7)
      throw new Error(`Catálogo remoto retornou ${products.length} produtos.`);
    return {
      products: products.map((product) => applyLaunchMedia(product)!),
      source: 'supabase',
    };
  } catch (error) {
    console.error('catalog.remote_unavailable', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return {
      products: await fallbackRepository.listActive(),
      source: 'static-fallback',
      warning: 'Não foi possível carregar a coleção agora. Tente novamente em instantes.',
    };
  }
}

export async function getProductSnapshot(slug: string) {
  try {
    const product = await remoteRepository.findActiveBySlug(slug);
    return { product: applyLaunchMedia(product), source: 'supabase' as const };
  } catch (error) {
    console.error('catalog.product_remote_unavailable', {
      slug,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return {
      product: await fallbackRepository.findActiveBySlug(slug),
      source: 'static-fallback' as const,
      warning: 'Não foi possível carregar esta peça agora. Tente novamente em instantes.',
    };
  }
}
