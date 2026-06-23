import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.gridLineOne} aria-hidden="true" />
      <div className={styles.gridLineTwo} aria-hidden="true" />
      <div className={styles.index} aria-label="Coleção 01">
        <span>01</span>
        <span>Movimento</span>
      </div>
      <div className={styles.productStage}>
        <Image
          src="/assets/products/cutouts/hybrid-logo-lateral-preto.png"
          width={2048}
          height={2048}
          alt="Camiseta Híbrida ART preta com logo lateral"
          className={styles.mainShirt}
          priority
        />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{STORE_CONFIG.brandName} / Streetwear funcional</p>
        <h1 id="hero-title">
          Conforto <span>em movimento</span>
        </h1>
        <p className={styles.lead}>
          Peças urbanas para acompanhar o seu ritmo, produzidas predominantemente sob encomenda.
        </p>
        <div className={styles.actions}>
          <Link href="#colecao" className="buttonPrimary">
            Explorar coleção
          </Link>
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            className="textLink"
            target="_blank"
            rel="noreferrer"
          >
            Falar com a ART
          </a>
        </div>
      </div>
      <p className={styles.productData}>
        Híbrida / logo lateral <span>R$ 45,00</span>
      </p>
    </section>
  );
}
