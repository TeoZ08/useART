import Image from 'next/image';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src={STORE_CONFIG.logo.dark}
            width={72}
            height={48}
            alt="ART"
            className={styles.logo}
          />
          <div>
            <strong>{STORE_CONFIG.brandName}</strong>
            <p>{STORE_CONFIG.slogan}</p>
            <p>{STORE_CONFIG.handle}</p>
          </div>
        </div>
        <nav className={styles.menu} aria-label="Links de rodapé">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/trocas">Trocas</Link>
          <Link href="/entrega">Entrega</Link>
          <Link href="/contato">Contato</Link>
        </nav>
        <div className={styles.info}>
          <strong>Atendimento</strong>
          <p>WhatsApp: {STORE_CONFIG.whatsappDisplay}</p>
          <p>{STORE_CONFIG.location}</p>
          <p>CNPJ: {STORE_CONFIG.cnpj}</p>
          <p>Pagamento, produção e envio são conferidos no atendimento.</p>
        </div>
      </div>
      <p className={styles.copy}>
        Copyright {STORE_CONFIG.brandName} - {STORE_CONFIG.cnpj} - 2026. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
