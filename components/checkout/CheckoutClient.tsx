'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  CART_CHANGED_EVENT,
  COUPON_CHANGED_EVENT,
  localCartRepository,
  readStoredCoupon,
} from '@/domain/cart/cartRepository';
import { describeSelection } from '@/domain/cart/selection';
import type { AddressData, CustomerData } from '@/domain/orders/order';
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
import { STORE_CONFIG } from '@/lib/config';
import { formatMoney } from '@/lib/money';
import { hasNoErrors } from '@/lib/validation';
import type { CartItem, CartItemSelection } from '@/types/commerce';
import styles from './CheckoutClient.module.css';

type CreatedOrder = {
  orderCode: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number | null;
  totalCents: number | null;
  orderUrl: string;
  paymentUrl: string | null;
};

const IDEMPOTENCY_STORAGE_KEY = 'art.checkout.idempotency.v1';

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

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function checkoutSelection(selection: CartItemSelection) {
  if (selection.type === 'simple') {
    return { type: 'simple' as const, colorId: selection.colorId, size: selection.size };
  }
  return {
    type: 'kit' as const,
    pieces: selection.pieces.map((piece) => ({
      pieceNumber: piece.pieceNumber,
      applicationId: piece.applicationId,
      colorId: piece.colorId,
      size: piece.size,
    })),
  };
}

function shippingMethod(methodId: ShippingMethodId) {
  if (methodId === 'retirada-art') return 'pickup' as const;
  if (methodId === 'campo-grande-ms') return 'local_delivery' as const;
  return 'national_quote' as const;
}

function idempotencyKeyFor(fingerprint: string): string {
  try {
    const stored = JSON.parse(sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) ?? '{}') as {
      fingerprint?: string;
      key?: string;
    };
    if (stored.fingerprint === fingerprint && stored.key) return stored.key;
  } catch {
    // A malformed browser cache is replaced below.
  }
  const key = crypto.randomUUID();
  sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ fingerprint, key }));
  return key;
}

export function CheckoutClient() {
  const cartSnapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => '[]');
  const couponCode = useSyncExternalStore(subscribeToCoupon, readStoredCoupon, () => '');
  const items = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', email: '' });
  const [address, setAddress] = useState<AddressData>({ state: 'MS', city: 'Campo Grande' });
  const [shipping, setShipping] = useState<ShippingQuote>(
    shippingQuoteProvider.quote({ methodId: 'retirada-art' }),
  );
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder>();
  const estimatedSubtotal = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
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
    setShipping(shippingQuoteProvider.quote({ methodId }));
    setErrors({});
  }

  async function submitOrder() {
    const nextErrors = {
      ...validateCustomer(customer),
      ...validateAddress(address, shipping),
      ...(privacyAccepted ? {} : { privacy: 'Aceite os termos para criar o pedido.' }),
    };
    setErrors(nextErrors);
    setServerError('');
    if (!items.length || !hasNoErrors(nextErrors)) return;

    const method = shippingMethod(shipping.id);
    const payload = {
      customer,
      shipping:
        method === 'pickup'
          ? { method }
          : {
              method,
              address: {
                postalCode: address.cep ?? '',
                street: address.street ?? '',
                number: address.number ?? '',
                complement: address.complement || undefined,
                neighborhood: address.district ?? '',
                city: address.city ?? '',
                state: address.state ?? '',
              },
            },
      couponCode: couponCode.trim().toUpperCase() || undefined,
      privacyTermsVersion: '2026-06-30',
      privacyAccepted: true,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        selection: checkoutSelection(item.selection),
        imageSnapshot: item.image.src,
      })),
    };
    const fingerprint = JSON.stringify(payload);
    const idempotencyKey = idempotencyKeyFor(fingerprint);

    setPending(true);
    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
        body: fingerprint,
      });
      const body = (await response.json()) as CreatedOrder & { error?: string };
      if (!response.ok || !body.orderCode) throw new Error(body.error ?? 'Pedido não criado.');
      setCreatedOrder(body);
      localCartRepository.clear();
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Não foi possível criar o pedido.');
    } finally {
      setPending(false);
    }
  }

  if (createdOrder) {
    return (
      <section className={styles.page} data-testid="order-created">
        <div className={styles.header}>
          <p className="sectionEyebrow">Pedido criado</p>
          <h1 className="sectionTitle">{createdOrder.orderCode}</h1>
          <p className="sectionLead">Guarde o código e o link de acompanhamento do pedido.</p>
        </div>
        <div className={styles.confirmation}>
          <div className={styles.rows}>
            <div>
              <span>Subtotal</span>
              <b>{formatMoney(createdOrder.subtotalCents)}</b>
            </div>
            <div>
              <span>Desconto</span>
              <b>− {formatMoney(createdOrder.discountCents)}</b>
            </div>
            <div>
              <span>Entrega</span>
              <b>
                {createdOrder.shippingCents === null
                  ? 'A cotar'
                  : formatMoney(createdOrder.shippingCents)}
              </b>
            </div>
            <div className={styles.total}>
              <span>Total</span>
              <b>
                {createdOrder.totalCents === null
                  ? 'Após cotação'
                  : formatMoney(createdOrder.totalCents)}
              </b>
            </div>
          </div>
          <Link className="buttonPrimary" href={createdOrder.orderUrl}>
            Acompanhar pedido
          </Link>
          <a
            className="buttonSecondary"
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            Falar com a ART
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className="sectionEyebrow">Checkout ART</p>
        <h1 className="sectionTitle">Criar pedido</h1>
        <p className="sectionLead">Informe seus dados e escolha a forma de entrega.</p>
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
                  type="email"
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
                    <b>{option.priceCents === null ? 'A cotar' : formatMoney(option.priceCents)}</b>
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
                      autoComplete="postal-code"
                    />
                    {errors.cep && <small className="fieldError">{errors.cep}</small>}
                  </label>
                  <label className="formField">
                    <span>Estado</span>
                    <input
                      value={address.state ?? ''}
                      maxLength={2}
                      onChange={(event) => updateAddress('state', event.target.value.toUpperCase())}
                    />
                    {errors.state && <small className="fieldError">{errors.state}</small>}
                  </label>
                  <label className="formField">
                    <span>Rua</span>
                    <input
                      value={address.street ?? ''}
                      onChange={(event) => updateAddress('street', event.target.value)}
                      autoComplete="address-line1"
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
                      autoComplete="address-line2"
                    />
                  </label>
                </div>
              ) : (
                <p className="noticeBox">
                  Retirada sem taxa. Horário e local são combinados com a ART.
                </p>
              )}
            </section>

            <section className={styles.panel}>
              <h2>Consentimento</h2>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                />
                <span>
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank">
                    Termos
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" target="_blank">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
              {errors.privacy && <small className="fieldError">{errors.privacy}</small>}
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
                <span>Subtotal no carrinho</span>
                <b>{formatMoney(estimatedSubtotal)}</b>
              </div>
              <div>
                <span>Cupom</span>
                <b>
                  {couponCode.trim() ? `${couponCode.trim().toUpperCase()} — a validar` : 'Nenhum'}
                </b>
              </div>
              <div>
                <span>Frete</span>
                <b>{shipping.priceCents === null ? 'A cotar' : formatMoney(shipping.priceCents)}</b>
              </div>
              <div className={styles.total}>
                <span>Total final</span>
                <b>Exibido após confirmar</b>
              </div>
            </div>
            <button
              className="buttonPrimary"
              type="button"
              disabled={pending}
              onClick={submitOrder}
            >
              {pending ? 'Criando pedido…' : 'Confirmar e criar pedido'}
            </button>
            {serverError && (
              <p className={styles.serverError} role="alert">
                {serverError}
              </p>
            )}
            <p className="noticeBox">
              Pagamentos online permanecem desativados. O pedido pode ser acompanhado e tratado com
              a ART.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
