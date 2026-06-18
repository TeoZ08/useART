'use client';

import { useMemo, useState } from 'react';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct, ProductColorId, ProductMedia } from '@/types/commerce';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: CatalogProduct;
}

function keyForMedia(media: ProductMedia): string {
  return media.src ?? media.alt;
}

function mediaForColor(product: CatalogProduct, colorId: ProductColorId): ProductMedia {
  return product.colors.find((color) => color.id === colorId)?.media ?? product.media;
}

function galleryForProduct(product: CatalogProduct, activeMedia: ProductMedia): ProductMedia[] {
  const media = [
    activeMedia,
    ...product.colors.flatMap((color) => (color.media ? [color.media] : [])),
    ...product.gallery,
  ];

  return media.filter(
    (item, index, source) =>
      source.findIndex((candidate) => keyForMedia(candidate) === keyForMedia(item)) === index,
  );
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const firstColorId = product.colors[0]?.id;
  const [selectedColorId, setSelectedColorId] = useState<ProductColorId | undefined>(firstColorId);
  const [activeMedia, setActiveMedia] = useState<ProductMedia>(
    firstColorId ? mediaForColor(product, firstColorId) : product.media,
  );
  const gallery = useMemo(() => galleryForProduct(product, activeMedia), [activeMedia, product]);

  function handleColorChange(colorId: ProductColorId) {
    setSelectedColorId(colorId);
    setActiveMedia(mediaForColor(product, colorId));
  }

  return (
    <section className={styles.page}>
      <div className={styles.mediaColumn}>
        <ProductMediaFrame media={activeMedia} productName={product.name} priority />
        {activeMedia.pendingReason && (
          <p className={styles.pendingMedia}>{activeMedia.pendingReason}</p>
        )}
        {gallery.length > 1 && (
          <div className={styles.thumbnails} aria-label="Miniaturas do produto">
            {gallery.map((media) => (
              <button
                key={keyForMedia(media)}
                type="button"
                className={
                  keyForMedia(media) === keyForMedia(activeMedia) ? styles.activeThumbnail : ''
                }
                onClick={() => setActiveMedia(media)}
                aria-label={`Ver ${media.alt}`}
              >
                <ProductMediaFrame media={media} productName={product.name} compact />
              </button>
            ))}
          </div>
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
        <ProductPurchasePanel
          product={product}
          selectedColorId={selectedColorId}
          onColorChange={handleColorChange}
        />
      </div>
    </section>
  );
}
