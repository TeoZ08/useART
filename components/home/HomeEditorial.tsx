import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { formatMoney } from '@/lib/money';
import type { CatalogProduct, ProductColorId, ProductMedia } from '@/types/commerce';
import styles from './HomeEditorial.module.css';

interface HomeEditorialProps {
  products: CatalogProduct[];
}

function mediaForColor(product: CatalogProduct, colorId: ProductColorId): ProductMedia {
  return product.colors.find((color) => color.id === colorId)?.media ?? product.media;
}

function getProduct(products: CatalogProduct[], slug: string): CatalogProduct {
  const product = products.find((item) => item.slug === slug);

  if (!product) throw new Error(`Produto editorial não encontrado: ${slug}`);

  return product;
}

export function HomeEditorial({ products }: HomeEditorialProps) {
  const lateral = getProduct(products, 'camiseta-hibrida-logo-lateral');
  const central = getProduct(products, 'camiseta-hibrida-logo-central');
  const assinatura = getProduct(products, 'camiseta-solid-masculina-assinatura-lateral');
  const kit = getProduct(products, 'kit-selecao-3-camisetas');
  const featured = [
    { product: lateral, colorId: 'preto' as const, index: '01' },
    { product: central, colorId: 'marrom' as const, index: '02' },
    { product: assinatura, colorId: 'preto' as const, index: '03' },
  ];

  return (
    <>
      <aside className={styles.infoBar} aria-label="Informações da operação">
        <p>PRIMEIRACOMPRA - 10%</p>
        <p>Sob encomenda</p>
        <p>Campo Grande/MS - entrega por R$ 10</p>
      </aside>

      <section id="colecao" className={styles.selection} aria-labelledby="selection-title">
        <div className={styles.sectionHeader}>
          <p className="sectionEyebrow">Seleção 01</p>
          <h2 id="selection-title" className="sectionTitle">
            Peças para acompanhar o ritmo
          </h2>
          <p className="sectionLead">
            Três peças autorais, prontas para diferentes ritmos e combinações.
          </p>
        </div>
        <div className={styles.featuredGrid}>
          {featured.map(({ product, colorId, index }, itemIndex) => {
            const media = mediaForColor(product, colorId);

            return (
              <article
                className={`${styles.featuredItem} ${
                  itemIndex === 1 ? styles.featuredItemOffset : ''
                }`}
                key={product.slug}
              >
                <Link href={`/produto/${product.slug}`} className={styles.featuredMedia}>
                  <span className={styles.featuredIndex} aria-hidden="true">
                    {index}
                  </span>
                  <ProductMediaFrame media={media} productName={product.name} />
                </Link>
                <div className={styles.featuredDetails}>
                  <div>
                    <p>{product.line}</p>
                    <h3>
                      <Link href={`/produto/${product.slug}`}>{product.name}</Link>
                    </h3>
                  </div>
                  <strong>{formatMoney(product.priceCents)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="movimento" className={styles.functionSection} aria-labelledby="function-title">
        <div className={styles.functionContent}>
          <p className="sectionEyebrow">Material e função</p>
          <h2 id="function-title" className="sectionTitle">
            Feita para o movimento real.
          </h2>
        </div>
        <div className={styles.functionFacts}>
          <dl className={styles.functionList}>
            <div>
              <dt>UV 30</dt>
              <dd>Proteção confirmada para a linha Híbrida.</dd>
            </div>
            <div>
              <dt>Sob encomenda</dt>
              <dd>Produção alinhada à escolha de cada peça.</dd>
            </div>
            <div>
              <dt>Moletom três cabos</dt>
              <dd>Estrutura confirmada para o moletom ART.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.kitSection} aria-labelledby="kit-title">
        <div className={styles.kitType} aria-hidden="true">
          <span>01</span>
          <span>02</span>
          <span>03</span>
        </div>
        <div className={styles.kitContent}>
          <p className="sectionEyebrow">Kit Seleção</p>
          <h2 id="kit-title" className="sectionTitle">
            Três peças. Três escolhas.
          </h2>
          <p>Escolha aplicação, cor e tamanho em cada uma das três camisetas.</p>
          <div className={styles.kitMeta}>
            <span>3 camisetas configuráveis</span>
            <span>{formatMoney(kit.priceCents)}</span>
          </div>
          <Link className="buttonPrimary" href={`/produto/${kit.slug}`}>
            Montar meu kit
          </Link>
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="manifesto-title">
        <p className="sectionEyebrow">ART / Campo Grande, MS</p>
        <h2 id="manifesto-title">ART é roupa para acompanhar o movimento.</h2>
        <p>Criada em Campo Grande para vestir o ritmo de todos os dias.</p>
      </section>
    </>
  );
}
