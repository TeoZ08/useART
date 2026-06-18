import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { getProductBySlug, getProductSlugs } from '@/domain/products/products';
import { formatMoney } from '@/lib/money';
import styles from './ProductPage.module.css';

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
    <section className={styles.page}>
      <div className={styles.mediaColumn}>
        <ProductMediaFrame media={product.media} productName={product.name} priority />
        {product.media.pendingReason && (
          <p className={styles.pendingMedia}>{product.media.pendingReason}</p>
        )}
      </div>
      <div className={styles.content}>
        <p className="sectionEyebrow">
          {product.line} / {product.category}
        </p>
        <h1>{product.name}</h1>
        <strong className={styles.price}>{formatMoney(product.priceCents)}</strong>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.facts}>
          <div>
            <h2>Confirmado</h2>
            <ul>
              {product.confirmedFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
              <li>{product.operation.label}</li>
              {product.operation.leadTime && <li>{product.operation.leadTime}</li>}
            </ul>
          </div>
          <div>
            <h2>Pendente</h2>
            <ul>
              {product.pendingFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </div>
        <ProductPurchasePanel product={product} />
      </div>
    </section>
  );
}
