'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { calculateCartTotals, removeCartItem, updateCartItemQuantity } from '@/domain/cart/cart';
import {
  CART_CHANGED_EVENT,
  COUPON_CHANGED_EVENT,
  localCartRepository,
  readStoredCoupon,
  writeStoredCoupon,
} from '@/domain/cart/cartRepository';
import { describeSelection } from '@/domain/cart/selection';
import { applyCoupon } from '@/domain/coupon/coupon';
import { formatMoney } from '@/lib/money';
import type { CartItem } from '@/types/commerce';
import styles from './CartClient.module.css';

function subscribeToCart(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(CART_CHANGED_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function subscribeToCoupon(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(COUPON_CHANGED_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(COUPON_CHANGED_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getCartSnapshot(): string {
  return JSON.stringify(localCartRepository.read());
}

function getServerCartSnapshot(): string {
  return '[]';
}

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartClient() {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const couponCode = useSyncExternalStore(subscribeToCoupon, readStoredCoupon, () => '');
  const items = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);

  const coupon = useMemo(
    () => applyCoupon(calculateSubtotalClient(items), couponCode),
    [couponCode, items],
  );
  const totals = useMemo(() => calculateCartTotals(items, couponCode), [couponCode, items]);

  function persist(nextItems: CartItem[]) {
    localCartRepository.write(nextItems);
  }

  function updateCoupon(nextCoupon: string) {
    writeStoredCoupon(nextCoupon);
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className="sectionEyebrow">Carrinho</p>
        <h1 className="sectionTitle">Revise seu pedido</h1>
        <p className="sectionLead">
          Confira as peças e quantidades antes de escolher a forma de entrega.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="emptyState">
          <p>Seu carrinho está vazio.</p>
          <Link className="buttonPrimary" href="/#produtos">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.items}>
            {items.map((item) => (
              <article className={styles.item} key={item.id}>
                <div className={styles.thumb}>
                  {item.image.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image.src} alt={item.image.alt} />
                  ) : (
                    <span>ART</span>
                  )}
                </div>
                <div className={styles.itemContent}>
                  <div>
                    <strong>{item.productName}</strong>
                    <p>{formatMoney(item.unitPriceCents)}</p>
                  </div>
                  <ul>
                    {describeSelection(item.selection).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className={styles.itemActions}>
                    <Link href={`/produto/${item.productSlug}`}>Editar seleção</Link>
                    <button
                      type="button"
                      onClick={() => persist(removeCartItem(items, item.id))}
                      aria-label={`Remover ${item.productName}`}
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className={styles.quantity}>
                  <button
                    type="button"
                    onClick={() =>
                      persist(updateCartItemQuantity(items, item.id, item.quantity - 1))
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      persist(updateCartItemQuantity(items, item.id, item.quantity + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className={styles.summary} aria-label="Resumo do carrinho">
            <h2>Resumo</h2>
            <label className="formField">
              <span>Cupom</span>
              <input
                value={couponCode}
                onChange={(event) => updateCoupon(event.target.value)}
                placeholder="PRIMEIRACOMPRA"
              />
            </label>
            <p
              className={coupon.status === 'invalid' ? styles.couponInvalid : styles.couponMessage}
            >
              {coupon.message}
            </p>
            <div className={styles.summaryRows}>
              <div>
                <span>Subtotal</span>
                <b>{formatMoney(totals.subtotalCents)}</b>
              </div>
              <div>
                <span>Desconto</span>
                <b>- {formatMoney(totals.discountCents)}</b>
              </div>
              <div>
                <span>Frete</span>
                <b>Escolhido no checkout</b>
              </div>
              <div className={styles.total}>
                <span>Estimativa no carrinho</span>
                <b>{formatMoney(totals.subtotalCents - totals.discountCents)}</b>
              </div>
            </div>
            <Link className="buttonPrimary" href="/checkout" data-testid="go-to-checkout">
              Ir para checkout
            </Link>
            <button className="buttonSecondary" type="button" onClick={() => persist([])}>
              Limpar carrinho
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function calculateSubtotalClient(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}
