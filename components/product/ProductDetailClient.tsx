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

const EDITORIAL_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'moletom-art': 'Moletom ART em tecido três cabos, com identidade gráfica direta da marca.',
  'camiseta-hibrida-logo-lateral': 'Camiseta Híbrida com logo lateral da ART e proteção UV 30.',
  'camiseta-hibrida-logo-central': 'Camiseta Híbrida com logo central da ART e proteção UV 30.',
  'camiseta-hibrida-assinatura-lateral':
    'Camiseta Híbrida com assinatura lateral da ART e proteção UV 30.',
  'kit-selecao-3-camisetas':
    'Três camisetas para configurar individualmente por aplicação, cor e tamanho.',
  'camiseta-solid-masculina-logo-central': 'Camiseta Solid Masculina com logo central da ART.',
  'camiseta-solid-masculina-assinatura-lateral':
    'Camiseta Solid Masculina com assinatura lateral da ART.',
};

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
  const editorialDescription = EDITORIAL_DESCRIPTIONS[product.slug] ?? product.description;
  const editorialFacts = product.confirmedFacts.filter(
    (fact) => !fact.toLocaleLowerCase('pt-BR').startsWith('preço confirmado'),
  );
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
          <p className={styles.description}>{editorialDescription}</p>
          <div className={styles.facts}>
            <div>
              <h2>Detalhes</h2>
              <ul>
                {editorialFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
                <li>
                  {product.operation.mode === 'sob-encomenda'
                    ? 'Produção sob encomenda.'
                    : product.operation.label}
                </li>
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
              <h2>Entrega local</h2>
              <p>Retirada gratuita ou entrega em Campo Grande/MS por R$ 10.</p>
            </section>
            <section>
              <h2>Outras localidades</h2>
              <p>O frete nacional é cotado a partir do endereço informado no checkout.</p>
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
