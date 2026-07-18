import { CatalogFallbackNotice } from '@/components/catalog/CatalogFallbackNotice';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getCatalogSnapshot } from '@/services/catalog/catalog-service';

export const metadata = { title: 'Catálogo', description: 'Coleção ART.' };

export default async function CatalogPage() {
  const catalog = await getCatalogSnapshot();

  return (
    <>
      <CatalogFallbackNotice message={catalog.warning} />
      <ProductGrid products={catalog.products} />
    </>
  );
}
