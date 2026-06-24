import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { getProductBySlug, getProductSlugs } from '@/domain/products/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      key={product.slug}
      product={product}
      relatedProducts={getProductSlugs()
        .filter((candidateSlug) => candidateSlug !== product.slug)
        .slice(0, 3)
        .map((candidateSlug) => getProductBySlug(candidateSlug))
        .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))}
    />
  );
}
