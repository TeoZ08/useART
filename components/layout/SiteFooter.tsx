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
          <strong>{STORE_CONFIG.brandName}</strong>
          <p>{STORE_CONFIG.slogan}</p>
        </div>
        <nav className={styles.menu} aria-label="Links de rodapé">
          <Link href="/#colecao">Coleção</Link>
          <Link href="/#produtos">Produtos</Link>
          <Link href="/carrinho">Carrinho</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/trocas">Trocas</Link>
          <Link href="/entrega">Entrega</Link>
        </nav>
        <div className={styles.info}>
          <strong>Campo Grande/MS</strong>
          <a href={STORE_CONFIG.instagramUrl} target="_blank" rel="noreferrer">
            {STORE_CONFIG.handle}
          </a>
          <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} target="_blank" rel="noreferrer">
            WhatsApp: {STORE_CONFIG.whatsappDisplay}
          </a>
          <p>CNPJ: {STORE_CONFIG.cnpj}</p>
        </div>
        <div className={styles.operation}>
          <strong>Pedido assistido</strong>
          <p>Pagamento, produção e envio são conferidos pela ART antes da confirmação.</p>
        </div>
      </div>
      <div className={styles.copy}>
        <p>
          ART - {STORE_CONFIG.location} - {STORE_CONFIG.cnpj}
        </p>
        <p>Copyright 2026. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
