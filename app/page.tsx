import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Hero } from '@/components/home/Hero';
import { getProducts } from '@/domain/products/products';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductGrid products={getProducts()} />
    </>
  );
}
