'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { calculateCartTotals } from '@/domain/cart/cart';
import {
  CART_CHANGED_EVENT,
  COUPON_CHANGED_EVENT,
  localCartRepository,
  readStoredCoupon,
} from '@/domain/cart/cartRepository';
import { describeSelection } from '@/domain/cart/selection';
import { buildOrderId, type AddressData, type CustomerData } from '@/domain/orders/order';
import {
  validateAddress,
  validateCustomer,
  type ValidationErrors,
} from '@/domain/orders/validation';
import {
  shippingQuoteProvider,
  type ShippingMethodId,
  type ShippingQuote,
} from '@/domain/shipping/shipping';
import { hasNoErrors } from '@/lib/validation';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/money';
import type { CartItem } from '@/types/commerce';
import styles from './CheckoutClient.module.css';

const paymentNote = 'Pagamento a combinar no atendimento. Pix manual pode ser informado pela loja.';

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

export function CheckoutClient() {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const couponCode = useSyncExternalStore(subscribeToCoupon, readStoredCoupon, () => '');
  const items = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', email: '' });
  const [address, setAddress] = useState<AddressData>({ state: 'MS', city: 'Campo Grande' });
  const [shipping, setShipping] = useState<ShippingQuote>(
    shippingQuoteProvider.quote({ methodId: 'retirada-art' }),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [prepared, setPrepared] = useState(false);

  const totals = useMemo(
    () => calculateCartTotals(items, couponCode, shipping),
    [couponCode, items, shipping],
  );
  const shippingOptions = shippingQuoteProvider.list();

  function updateCustomer(field: keyof CustomerData, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function updateAddress(field: keyof AddressData, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function chooseShipping(methodId: ShippingMethodId) {
    const quote = shippingQuoteProvider.quote({ methodId });
    setShipping(quote);
    setErrors({});
  }

  function openWhatsApp() {
    const nextErrors = {
      ...validateCustomer(customer),
      ...validateAddress(address, shipping),
    };

    setErrors(nextErrors);

    if (!items.length || !hasNoErrors(nextErrors)) {
      return;
    }

    const order = {
      id: buildOrderId(),
      createdAt: new Date().toISOString(),
      customer,
      address,
      shipping,
      paymentNote,
      items,
      couponCode: couponCode.trim().toUpperCase(),
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
    };

    window.open(buildWhatsAppUrl(order), '_blank', 'noopener,noreferrer');
    setPrepared(true);
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className="sectionEyebrow">Checkout assistido</p>
        <h1 className="sectionTitle">Preparar pedido</h1>
        <p className="sectionLead">
          Nenhum pagamento ou envio é confirmado aqui. O botão apenas prepara a mensagem para você
          enviar no WhatsApp.
        </p>
      </div>

      {!items.length ? (
        <div className="emptyState">
          <p>Seu carrinho está vazio.</p>
          <Link className="buttonPrimary" href="/#produtos">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.form}>
            <section className={styles.panel}>
              <h2>Contato</h2>
              <label className="formField">
                <span>Nome</span>
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer('name', event.target.value)}
                  autoComplete="name"
                />
                {errors.name && <small className="fieldError">{errors.name}</small>}
              </label>
              <label className="formField">
                <span>WhatsApp</span>
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer('phone', event.target.value)}
                  autoComplete="tel"
                />
                {errors.phone && <small className="fieldError">{errors.phone}</small>}
              </label>
              <label className="formField">
                <span>E-mail opcional</span>
                <input
                  value={customer.email}
                  onChange={(event) => updateCustomer('email', event.target.value)}
                  autoComplete="email"
                />
              </label>
            </section>

            <section className={styles.panel}>
              <h2>Entrega</h2>
              <div className={styles.optionList}>
                {shippingOptions.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={shipping.id === option.id ? styles.selectedOption : ''}
                    onClick={() => chooseShipping(option.id)}
                  >
                    <span>
                      <strong>{option.name}</strong>
                      <small>{option.detail}</small>
                    </span>
                    <b>
                      {option.priceCents === null ? 'A confirmar' : formatMoney(option.priceCents)}
                    </b>
                  </button>
                ))}
              </div>

              {shipping.requiresAddress ? (
                <div className={styles.addressGrid}>
                  <label className="formField">
                    <span>CEP</span>
                    <input
                      value={address.cep ?? ''}
                      onChange={(event) => updateAddress('cep', event.target.value)}
                    />
                    {errors.cep && <small className="fieldError">{errors.cep}</small>}
                  </label>
                  <label className="formField">
                    <span>Estado</span>
                    <input
                      value={address.state ?? ''}
                      onChange={(event) => updateAddress('state', event.target.value.toUpperCase())}
                    />
                    {errors.state && <small className="fieldError">{errors.state}</small>}
                  </label>
                  <label className="formField">
                    <span>Rua</span>
                    <input
                      value={address.street ?? ''}
                      onChange={(event) => updateAddress('street', event.target.value)}
                    />
                    {errors.street && <small className="fieldError">{errors.street}</small>}
                  </label>
                  <label className="formField">
                    <span>Número</span>
                    <input
                      value={address.number ?? ''}
                      onChange={(event) => updateAddress('number', event.target.value)}
                    />
                    {errors.number && <small className="fieldError">{errors.number}</small>}
                  </label>
                  <label className="formField">
                    <span>Bairro</span>
                    <input
                      value={address.district ?? ''}
                      onChange={(event) => updateAddress('district', event.target.value)}
                    />
                    {errors.district && <small className="fieldError">{errors.district}</small>}
                  </label>
                  <label className="formField">
                    <span>Cidade</span>
                    <input
                      value={address.city ?? ''}
                      onChange={(event) => updateAddress('city', event.target.value)}
                    />
                    {errors.city && <small className="fieldError">{errors.city}</small>}
                  </label>
                  <label className="formField">
                    <span>Complemento</span>
                    <input
                      value={address.complement ?? ''}
                      onChange={(event) => updateAddress('complement', event.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <p className="noticeBox">Retirada combinada diretamente com a ART pelo WhatsApp.</p>
              )}
            </section>

            <section className={styles.panel}>
              <h2>Pagamento</h2>
              <p className="noticeBox">{paymentNote}</p>
            </section>
          </div>

          <aside className={styles.summary}>
            <h2>Revisão</h2>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div className={styles.summaryItem} key={item.id}>
                  <strong>
                    {item.quantity}x {item.productName}
                  </strong>
                  <ul>
                    {describeSelection(item.selection).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <b>{formatMoney(item.unitPriceCents * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className={styles.rows}>
              <div>
                <span>Subtotal</span>
                <b>{formatMoney(totals.subtotalCents)}</b>
              </div>
              <div>
                <span>Cupom</span>
                <b>{couponCode.trim() ? couponCode.trim().toUpperCase() : 'Nenhum'}</b>
              </div>
              <div>
                <span>Desconto</span>
                <b>- {formatMoney(totals.discountCents)}</b>
              </div>
              <div>
                <span>Frete</span>
                <b>
                  {totals.shippingCents === null
                    ? 'A confirmar'
                    : formatMoney(totals.shippingCents)}
                </b>
              </div>
              <div className={styles.total}>
                <span>Total estimado</span>
                <b>{totals.totalCents === null ? 'A confirmar' : formatMoney(totals.totalCents)}</b>
              </div>
            </div>
            <button className="buttonPrimary" type="button" onClick={openWhatsApp}>
              Abrir pedido no WhatsApp
            </button>
            {prepared && (
              <p className="noticeBox" data-testid="prepared-message">
                A mensagem foi preparada. Envie-a no WhatsApp para concluir a solicitação.
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
