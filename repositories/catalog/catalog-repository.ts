import type { CatalogProduct } from '@/types/commerce';

export interface CatalogRepository {
  listActive(): Promise<CatalogProduct[]>;
  findActiveBySlug(slug: string): Promise<CatalogProduct | null>;
}

export type CatalogSnapshot = {
  products: CatalogProduct[];
  source: 'supabase' | 'static-fallback';
  warning?: string;
};
