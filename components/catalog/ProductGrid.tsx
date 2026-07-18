'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { mediaForProductColor } from '@/domain/products/media';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct, ProductColorId } from '@/types/commerce';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: CatalogProduct[];
}

const filters = ['Todos', 'Camiseta', 'Moletom', 'Kit'] as const;

function defaultColorId(product: CatalogProduct) {
  return (
    product.colors.find((color) => color.id === 'preto')?.id ??
    product.colors.find((color) => color.media?.cutoutStatus === 'available')?.id ??
    product.colors[0]?.id
  );
}

function mediaForCatalog(product: CatalogProduct) {
  return (
    product.colors.find((color) => color.media?.cutoutStatus === 'available')?.media ??
    product.media
  );
}

export function ProductGrid({ products }: ProductGridProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todos');
  const [sort, setSort] = useState('featured');
  const [selectedColorByProduct, setSelectedColorByProduct] = useState<
    Record<string, ProductColorId | undefined>
  >({});

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => filter === 'Todos' || product.category === filter)
      .filter((product) => {
        const normalized = query.trim().toLowerCase();
        return normalized ? product.name.toLowerCase().includes(normalized) : true;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.priceCents - b.priceCents;
        if (sort === 'price-desc') return b.priceCents - a.priceCents;
        return products.indexOf(a) - products.indexOf(b);
      });
  }, [filter, products, query, sort]);

  return (
    <section id="produtos" className={styles.section}>
      <div className={styles.top}>
        <div>
          <p className="sectionEyebrow">Catálogo oficial</p>
          <h2 className="sectionTitle">Catálogo</h2>
          <p className="sectionLead">Escolha sua peça, cor e tamanho.</p>
          <div className={styles.tabs} aria-label="Filtrar catálogo">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? styles.activeTab : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.controls}>
          <label>
            <span>Buscar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome do produto"
            />
          </label>
          <label>
            <span>Ordenar</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </label>
        </div>
      </div>

      {visibleProducts.length ? (
        <div className={styles.grid}>
          {visibleProducts.map((product) => {
            const selectedColorId = selectedColorByProduct[product.slug] ?? defaultColorId(product);
            const selectedMedia = selectedColorId
              ? mediaForProductColor(product, selectedColorId)
              : mediaForCatalog(product);

            return (
              <article className={styles.card} key={product.slug}>
                <Link
                  href={`/produto/${product.slug}`}
                  className={styles.cardLink}
                  aria-label={`Abrir ${product.name}`}
                />
                <ProductMediaFrame media={selectedMedia} productName={product.name} compact />
                <div className={styles.info}>
                  <p>
                    {product.line} / {product.category}
                  </p>
                  <div className={styles.titleRow}>
                    <h3>{product.name}</h3>
                    <strong>{formatMoney(product.priceCents)}</strong>
                  </div>
                  <small>
                    {product.operation.mode === 'sob-encomenda'
                      ? 'Sob encomenda'
                      : product.operation.label}
                  </small>
                  <div className={styles.bottom}>
                    <div className={styles.swatches} aria-label="Cores disponíveis">
                      {product.colors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          className={selectedColorId === color.id ? styles.selectedSwatch : ''}
                          style={{ background: color.hex }}
                          aria-label={`Ver ${product.name} na cor ${color.name}`}
                          aria-pressed={selectedColorId === color.id}
                          onMouseEnter={() =>
                            setSelectedColorByProduct((current) => ({
                              ...current,
                              [product.slug]: color.id,
                            }))
                          }
                          onFocus={() =>
                            setSelectedColorByProduct((current) => ({
                              ...current,
                              [product.slug]: color.id,
                            }))
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setSelectedColorByProduct((current) => ({
                              ...current,
                              [product.slug]: color.id,
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="emptyState">Nenhum produto encontrado.</div>
      )}
    </section>
  );
}
