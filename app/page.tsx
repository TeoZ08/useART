import { ProductGrid } from '@/components/catalog/ProductGrid';
import { HomeEditorial } from '@/components/home/HomeEditorial';
import { Hero } from '@/components/home/Hero';
import { getProducts } from '@/domain/products/products';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeEditorial products={getProducts()} />
      <ProductGrid products={getProducts()} />
    </>
  );
}
