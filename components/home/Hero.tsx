import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config';
import { HeroShirt3D } from './HeroShirt3D';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.index} aria-label="Coleção 01">
        <span>01</span>
        <span>Movimento</span>
      </div>
      <div className={styles.productStage}>
        <HeroShirt3D />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{STORE_CONFIG.brandName} / Campo Grande</p>
        <h1 id="hero-title">
          Conforto <span>em movimento</span>
        </h1>
        <p className={styles.lead}>Peças autorais para o movimento de todos os dias.</p>
        <div className={styles.actions}>
          <Link href="#colecao" className="buttonPrimary">
            Ver coleção
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
    </section>
  );
}
