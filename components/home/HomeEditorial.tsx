import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatMoney } from '@/lib/money';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import type { CatalogProduct } from '@/types/commerce';
import styles from './HomeEditorial.module.css';

interface HomeEditorialProps {
  products: CatalogProduct[];
  catalog: ReactNode;
}

function getProduct(products: CatalogProduct[], slug: string): CatalogProduct {
  const product = products.find((item) => item.slug === slug);

  if (!product) throw new Error(`Produto editorial não encontrado: ${slug}`);

  return product;
}

export function HomeEditorial({ products, catalog }: HomeEditorialProps) {
  const kit = getProduct(products, 'kit-selecao-3-camisetas');

  return (
    <>
      <aside className={styles.infoBar} aria-label="Informações da operação">
        <p>Sob encomenda</p>
        <p>Retirada ART</p>
        <p>Campo Grande/MS — entrega local por R$ 10</p>
        <p>PRIMEIRACOMPRA — 10%</p>
      </aside>

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

      {catalog}

      <section className={styles.kitSection} aria-labelledby="kit-title">
        <div className={styles.kitType} aria-hidden="true">
          <ProductMediaFrame media={kit.media} productName={kit.name} />
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
