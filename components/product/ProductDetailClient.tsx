'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct, ProductColorId, ProductMedia } from '@/types/commerce';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
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

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const firstColorId =
    product.colors.find((color) => color.media?.cutoutStatus === 'available')?.id ??
    product.colors[0]?.id;
  const [selectedColorId, setSelectedColorId] = useState<ProductColorId | undefined>(firstColorId);
  const [activeMedia, setActiveMedia] = useState<ProductMedia>(
    firstColorId ? mediaForColor(product, firstColorId) : product.media,
  );
  const gallery = useMemo(() => galleryForProduct(product, activeMedia), [activeMedia, product]);
  const zoomDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = zoomDialogRef.current;

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function openZoom() {
    zoomDialogRef.current?.showModal();
  }

  function handleColorChange(colorId: ProductColorId) {
    setSelectedColorId(colorId);
    setActiveMedia(mediaForColor(product, colorId));
  }

  return (
    <>
      <section className={styles.page}>
        <div className={styles.mediaColumn}>
          <button
            className={styles.mediaButton}
            type="button"
            onClick={openZoom}
            aria-label={`Ampliar ${activeMedia.alt}`}
          >
            <ProductMediaFrame media={activeMedia} productName={product.name} priority />
            <span>Ampliar imagem</span>
          </button>
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
          <div className={styles.productNotes}>
            <section>
              <h2>Guia de medidas</h2>
              <p>
                A grade disponível está no seletor. O guia de medidas revisado pela ART ainda está
                pendente.
              </p>
            </section>
            <section>
              <h2>Composição e cuidados</h2>
              <p>
                Informações detalhadas de composição e cuidados serão confirmadas antes da venda.
              </p>
            </section>
          </div>
        </div>
        <dialog
          ref={zoomDialogRef}
          className={styles.zoomDialog}
          aria-label={`Imagem ampliada: ${activeMedia.alt}`}
        >
          <div className={styles.zoomContent}>
            <button type="button" onClick={() => zoomDialogRef.current?.close()}>
              Fechar
            </button>
            <ProductMediaFrame media={activeMedia} productName={product.name} priority />
          </div>
        </dialog>
      </section>
      <section className={styles.related} aria-labelledby="related-title">
        <p className="sectionEyebrow">Continue explorando</p>
        <h2 id="related-title" className="sectionTitle">
          Outras peças
        </h2>
        <div className={styles.relatedGrid}>
          {relatedProducts.map((relatedProduct) => {
            const relatedMedia =
              relatedProduct.colors.find((color) => color.media?.cutoutStatus === 'available')
                ?.media ?? relatedProduct.media;

            return (
              <Link
                href={`/produto/${relatedProduct.slug}`}
                className={styles.relatedItem}
                key={relatedProduct.slug}
              >
                <ProductMediaFrame media={relatedMedia} productName={relatedProduct.name} compact />
                <span>{relatedProduct.name}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
