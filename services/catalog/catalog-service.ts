import 'server-only';

import type { CatalogSnapshot } from '@/repositories/catalog/catalog-repository';
import { StaticCatalogRepository } from '@/repositories/catalog/static-catalog-repository';
import { SupabaseCatalogRepository } from '@/repositories/catalog/supabase-catalog-repository';

const remoteRepository = new SupabaseCatalogRepository();
const fallbackRepository = new StaticCatalogRepository();

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const products = await remoteRepository.listActive();
    if (products.length !== 7)
      throw new Error(`Catálogo remoto retornou ${products.length} produtos.`);
    return { products, source: 'supabase' };
  } catch (error) {
    console.error('catalog.remote_unavailable', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return {
      products: await fallbackRepository.listActive(),
      source: 'static-fallback',
      warning: 'Catálogo em modo de consulta. Compras estão temporariamente indisponíveis.',
    };
  }
}

export async function getProductSnapshot(slug: string) {
  try {
    const product = await remoteRepository.findActiveBySlug(slug);
    return { product, source: 'supabase' as const };
  } catch (error) {
    console.error('catalog.product_remote_unavailable', {
      slug,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return {
      product: await fallbackRepository.findActiveBySlug(slug),
      source: 'static-fallback' as const,
      warning: 'Produto em modo de consulta. Compras estão temporariamente indisponíveis.',
    };
  }
}
