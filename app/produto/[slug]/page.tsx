import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { CatalogFallbackNotice } from '@/components/catalog/CatalogFallbackNotice';
import { getProductSlugs } from '@/domain/products/products';
import { getCatalogSnapshot, getProductSnapshot } from '@/services/catalog/catalog-service';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductSnapshot(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seo.title,
    description: product.seo.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [result, catalog] = await Promise.all([getProductSnapshot(slug), getCatalogSnapshot()]);
  const product = result.product;

  if (!product) {
    notFound();
  }

  return (
    <>
      <CatalogFallbackNotice message={result.warning ?? catalog.warning} />
      <ProductDetailClient
        key={product.slug}
        product={product}
        relatedProducts={catalog.products
          .filter((candidate) => candidate.slug !== product.slug)
          .slice(0, 3)}
      />
    </>
  );
}
