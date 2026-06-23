'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CART_CHANGED_EVENT, localCartRepository } from '@/domain/cart/cartRepository';
import { STORE_CONFIG } from '@/lib/config';
import styles from './SiteHeader.module.css';

function readCartCount(): number {
  return localCartRepository.read().reduce((sum, item) => sum + item.quantity, 0);
}

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === '/';

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

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (menuOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    }

    if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }

  return (
    <header
      className={`${styles.header} ${isHome ? styles.homeHeader : styles.staticHeader} ${
        isHome && isScrolled ? styles.scrolledHomeHeader : ''
      }`}
    >
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
          <Link href="/#colecao">Coleção</Link>
          <Link href="/#produtos">Produtos</Link>
          <Link href="/entrega">Entrega</Link>
          <Link href="/contato">Contato</Link>
        </nav>
        <div className={styles.actions}>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
          <Link href="/carrinho" className={styles.cartLink} aria-label="Abrir carrinho">
            <span>Carrinho</span>
            <b aria-live="polite">{cartCount}</b>
          </Link>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        id="menu-mobile"
        className={styles.mobileDialog}
        aria-label="Menu principal"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className={styles.mobileDialogInner}>
          <div className={styles.mobileDialogHeader}>
            <span>ART / Navegação</span>
            <button ref={closeButtonRef} type="button" onClick={closeMenu}>
              Fechar
            </button>
          </div>
          <nav className={styles.mobileNav} aria-label="Navegação mobile">
            <Link href="/#colecao" onClick={closeMenu}>
              Coleção
            </Link>
            <Link href="/#produtos" onClick={closeMenu}>
              Produtos
            </Link>
            <Link href="/carrinho" onClick={closeMenu}>
              Carrinho ({cartCount})
            </Link>
            <Link href="/entrega" onClick={closeMenu}>
              Entrega
            </Link>
            <Link href="/contato" onClick={closeMenu}>
              Contato
            </Link>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
