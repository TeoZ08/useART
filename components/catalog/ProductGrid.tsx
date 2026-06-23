'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct } from '@/types/commerce';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: CatalogProduct[];
}

const filters = ['Todos', 'Camiseta', 'Moletom', 'Kit'] as const;

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
          <h2 className="sectionTitle">Catálogo completo</h2>
          <p className="sectionLead">
            Sete ofertas confirmadas, compra assistida e sem frete ou pagamento simulado.
          </p>
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
          {visibleProducts.map((product) => (
            <article className={styles.card} key={product.slug}>
              <Link href={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
                <ProductMediaFrame
                  media={mediaForCatalog(product)}
                  productName={product.name}
                  compact
                />
              </Link>
              <div className={styles.info}>
                <p>
                  {product.line} / {product.category}
                </p>
                <div className={styles.titleRow}>
                  <h3>
                    <Link href={`/produto/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <strong>{formatMoney(product.priceCents)}</strong>
                </div>
                <small>{product.operation.label}</small>
                <div className={styles.bottom}>
                  <div className={styles.swatches} aria-label="Cores disponíveis">
                    {product.colors.map((color) => (
                      <span
                        key={color.id}
                        style={{ background: color.hex }}
                        title={color.name}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                  <Link href={`/produto/${product.slug}`}>Ver produto</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="emptyState">Nenhum produto encontrado.</div>
      )}
    </section>
  );
}
