import Image from 'next/image';
import Link from 'next/link';
import { ProductMediaFrame } from '@/components/ui/ProductMediaFrame';
import { formatMoney } from '@/lib/money';
import { STORE_CONFIG } from '@/lib/config';
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
        <p>Produção predominantemente sob encomenda</p>
        <p>Campo Grande/MS - entrega por R$ 10</p>
      </aside>

      <section id="colecao" className={styles.selection} aria-labelledby="selection-title">
        <div className={styles.sectionHeader}>
          <p className="sectionEyebrow">Seleção 01</p>
          <h2 id="selection-title" className="sectionTitle">
            Peças para acompanhar o ritmo
          </h2>
          <p className="sectionLead">
            Uma seleção inicial da linha Híbrida e Solid. Cor, tamanho e disponibilidade são
            confirmados com a ART antes da produção.
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

      <section className={styles.functionSection} aria-labelledby="function-title">
        <div className={styles.functionProduct} aria-hidden="true">
          <Image
            src="/assets/products/cutouts/hybrid-logo-lateral-marrom.png"
            width={2048}
            height={2048}
            alt=""
          />
        </div>
        <div className={styles.functionContent}>
          <p className="sectionEyebrow">Produto e função</p>
          <h2 id="function-title" className="sectionTitle">
            Feita para o movimento real.
          </h2>
          <dl className={styles.functionList}>
            <div>
              <dt>Híbrida</dt>
              <dd>Proteção UV 30 confirmada para a linha.</dd>
            </div>
            <div>
              <dt>Conforto</dt>
              <dd>Peças urbanas para acompanhar rotinas em movimento.</dd>
            </div>
            <div>
              <dt>Produção</dt>
              <dd>Operação predominantemente sob encomenda.</dd>
            </div>
            <div>
              <dt>Moletom ART</dt>
              <dd>Tecido três cabos confirmado. Peso ainda pendente.</dd>
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
            Três peças, três escolhas.
          </h2>
          <p>
            Configure aplicação, cor e tamanho de cada camiseta de forma independente. A composição
            final do Kit ainda está em produção e não será simulada com uma foto que não existe.
          </p>
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
        <p>
          Peças urbanas, funcionais e produzidas majoritariamente sob encomenda em Campo Grande.
        </p>
      </section>

      <section className={styles.delivery} aria-labelledby="delivery-title">
        <div>
          <p className="sectionEyebrow">Compra assistida</p>
          <h2 id="delivery-title" className="sectionTitle">
            Compra direta, confirmação humana.
          </h2>
        </div>
        <div className={styles.deliveryList}>
          <p>
            <strong>Pedido</strong>
            Escolha suas peças e prepare a mensagem pelo WhatsApp.
          </p>
          <p>
            <strong>Retirada</strong>
            Retirada ART sem taxa, combinada no atendimento.
          </p>
          <p>
            <strong>Entrega</strong>
            Campo Grande/MS por R$ 10. Outras localidades com frete a confirmar.
          </p>
        </div>
        <a
          className="textLink"
          href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
        >
          Falar com a ART
        </a>
      </section>
    </>
  );
}
