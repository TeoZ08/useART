import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wave} aria-hidden="true">
        <Image src="/assets/brand/art-footer-motion-wave.svg" width={1600} height={360} alt="" />
      </div>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src={STORE_CONFIG.logo.dark}
            width={72}
            height={48}
            alt="ART"
            className={styles.logo}
          />
          <strong>{STORE_CONFIG.brandName}</strong>
        </div>
        <nav className={styles.menu} aria-label="Links de rodapé">
          <Link href="/#colecao">Coleção</Link>
          <Link href="/entrega">Entrega</Link>
          <Link href="/trocas">Trocas</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
        </nav>
        <div className={styles.info}>
          <strong>Campo Grande/MS</strong>
          <a href={STORE_CONFIG.instagramUrl} target="_blank" rel="noreferrer">
            Instagram: {STORE_CONFIG.handle}
          </a>
          <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} target="_blank" rel="noreferrer">
            WhatsApp: {STORE_CONFIG.whatsappDisplay}
          </a>
          <p>Retirada gratuita. Entrega local por R$ 10.</p>
        </div>
      </div>
      <div className={styles.copy}>
        <p>
          ART — {STORE_CONFIG.location} — CNPJ {STORE_CONFIG.cnpj}
        </p>
        <p>Copyright 2026. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
