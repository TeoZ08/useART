import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.watermark} aria-hidden="true">
        <Image src={STORE_CONFIG.logo.dark} width={220} height={148} alt="" />
        <span>ART</span>
      </div>
      <div className={styles.productStage} aria-hidden="true">
        <Image
          src="/assets/products/hybrid-logo-lateral/preto.png"
          width={650}
          height={780}
          alt=""
          className={styles.secondaryShirt}
          priority
        />
        <Image
          src="/assets/products/hybrid-logo-lateral/marrom.png"
          width={650}
          height={780}
          alt=""
          className={styles.mainShirt}
          priority
        />
        <Image
          src="/assets/products/solid-assinatura/preto.png"
          width={650}
          height={780}
          alt=""
          className={styles.tertiaryShirt}
          priority
        />
      </div>
      <div className={styles.content}>
        <p>{STORE_CONFIG.handle} / streetwear funcional</p>
        <h1>{STORE_CONFIG.brandName}</h1>
        <span>{STORE_CONFIG.slogan}</span>
        <div className={styles.actions}>
          <Link href="#produtos" className="buttonPrimary">
            Ver produtos
          </Link>
          <Link href="#produtos" className="buttonSecondary">
            Comprar
          </Link>
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            className={styles.whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            Falar no WhatsApp
          </a>
        </div>
        <div className={styles.meta} aria-label="Destaques da loja">
          <span>Sete ofertas oficiais</span>
          <span>Pedido assistido</span>
          <span>Campo Grande/MS</span>
        </div>
      </div>
    </section>
  );
}
