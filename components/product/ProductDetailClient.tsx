'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { galleryForProduct, mediaForProductColor, productMediaKey } from '@/domain/products/media';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct, ProductColorId, ProductMedia } from '@/types/commerce';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const firstColorId =
    product.colors.find((color) => color.media?.cutoutStatus === 'available')?.id ??
    product.colors[0]?.id;
  const [selectedColorId, setSelectedColorId] = useState<ProductColorId | undefined>(firstColorId);
  const [selectedGalleryMediaKey, setSelectedGalleryMediaKey] = useState<string>();
  const gallery = useMemo(() => galleryForProduct(product), [product]);
  const selectedColorMedia = selectedColorId
    ? mediaForProductColor(product, selectedColorId)
    : product.media;
  const activeMedia =
    gallery.find((media) => productMediaKey(media) === selectedGalleryMediaKey) ??
    selectedColorMedia;
  const selectedColor = product.colors.find((color) => color.id === selectedColorId);
  const zoomDialogRef = useRef<HTMLDialogElement>(null);
  const mediaButtonRef = useRef<HTMLButtonElement>(null);

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
    setSelectedGalleryMediaKey(undefined);
  }

  function handleThumbnailChange(media: ProductMedia) {
    if (media.colorId) setSelectedColorId(media.colorId);
    setSelectedGalleryMediaKey(productMediaKey(media));
  }

  return (
    <>
      <section className={styles.page}>
        <div className={styles.mediaColumn}>
          <button
            ref={mediaButtonRef}
            className={styles.mediaButton}
            type="button"
            onClick={openZoom}
            aria-label={`Ampliar ${activeMedia.alt}`}
          >
            <ProductMediaFrame
              key={productMediaKey(activeMedia)}
              media={activeMedia}
              productName={product.name}
              priority
            />
            <span>Ampliar imagem</span>
          </button>
          {selectedColor && (
            <p className={styles.selectedVariant}>
              Cor selecionada: <strong>{selectedColor.name}</strong>
            </p>
          )}
          {activeMedia.pendingReason && (
            <p className={styles.pendingMedia}>{activeMedia.pendingReason}</p>
          )}
          {gallery.length > 1 && (
            <div className={styles.thumbnails} aria-label="Miniaturas do produto">
              {gallery.map((media) => (
                <button
                  key={productMediaKey(media)}
                  type="button"
                  className={
                    productMediaKey(media) === productMediaKey(activeMedia)
                      ? styles.activeThumbnail
                      : ''
                  }
                  onClick={() => handleThumbnailChange(media)}
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
            selectedColorId={selectedColorId ?? product.colors[0]!.id}
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
          onClose={() => mediaButtonRef.current?.focus()}
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
