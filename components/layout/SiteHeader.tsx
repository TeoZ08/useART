'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CART_CHANGED_EVENT, localCartRepository } from '@/domain/cart/cartRepository';
import { STORE_CONFIG } from '@/lib/config';
import styles from './SiteHeader.module.css';

function readCartCount(): number {
  return localCartRepository.read().reduce((sum, item) => sum + item.quantity, 0);
}

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => setCartCount(readCartCount());

    update();
    window.addEventListener(CART_CHANGED_EVENT, update);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.promo}>
        <span>PRIMEIRACOMPRA: 10% de desconto</span>
        <span>Pedido assistido pelo WhatsApp</span>
        <span>Produtos sob encomenda</span>
      </div>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="Voltar para a página inicial">
          <Image
            src={STORE_CONFIG.logo.dark}
            width={72}
            height={48}
            alt="ART"
            className={styles.logo}
            priority
          />
          <span>{STORE_CONFIG.brandName}</span>
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <Link href="/#produtos">Produtos</Link>
          <Link href="/carrinho">Carrinho</Link>
          <Link href="/contato">Contato</Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/#produtos" className={styles.buyLink}>
            Comprar
          </Link>
          <Link href="/carrinho" className={styles.cartButton} aria-label="Abrir carrinho">
            <span aria-hidden="true">Bag</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </Link>
        </div>
      </div>
    </header>
  );
}
