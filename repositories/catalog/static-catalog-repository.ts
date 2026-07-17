import { catalogSeed } from '@/data/catalog.seed';
import type { CatalogRepository } from '@/repositories/catalog/catalog-repository';

export class StaticCatalogRepository implements CatalogRepository {
  async listActive() {
    return catalogSeed.map((product) => ({ ...product, variants: [], commerceAvailable: false }));
  }

  async findActiveBySlug(slug: string) {
    const product = catalogSeed.find((candidate) => candidate.slug === slug);
    return product ? { ...product, variants: [], commerceAvailable: false } : null;
  }
}
