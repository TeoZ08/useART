import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CatalogFallbackNotice } from '@/components/catalog/CatalogFallbackNotice';
import { HomeEditorial } from '@/components/home/HomeEditorial';
import { Hero } from '@/components/home/Hero';
import { getCatalogSnapshot } from '@/services/catalog/catalog-service';

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  return (
    <>
      <Hero />
      <CatalogFallbackNotice message={catalog.warning} />
      <HomeEditorial products={catalog.products} />
      <ProductGrid products={catalog.products} />
    </>
  );
}
