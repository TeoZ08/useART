import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { PayOrderButton } from '@/components/orders/PayOrderButton';
import styles from '@/components/orders/OrderStatus.module.css';
import { formatMoney } from '@/lib/money';
import { getServerEnv } from '@/lib/env';
import { getPublicOrder } from '@/services/orders/public-order';
import { consumeRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Acompanhar pedido',
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  quote_requested: 'Cotação de frete solicitada',
  awaiting_payment: 'Aguardando pagamento',
  payment_pending: 'Pagamento em análise',
  paid: 'Pagamento aprovado',
  in_production: 'Em produção',
  ready_for_pickup: 'Pronto para retirada',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token.length < 32 || token.length > 128) notFound();
  if (!(await consumeRateLimit(await headers(), 'orders:public-status', 60, 60))) notFound();
  const order = await getPublicOrder(token);
  if (!order) notFound();
  const env = getServerEnv();
  const canPay =
    env.PAYMENTS_ENABLED &&
    order.total_cents !== null &&
    ['awaiting_payment', 'payment_pending'].includes(order.status);

  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pedido confirmado</p>
      <h1 className={styles.title}>{order.order_code}</h1>
      <span className={styles.status}>{statusLabel[order.status] ?? order.status}</span>

      <div className={styles.card}>
        {order.order_items.map((item, index) => (
          <div
            className={styles.item}
            key={`${item.sku_snapshot ?? item.product_name_snapshot}-${index}`}
          >
            <span>
              <strong>{item.product_name_snapshot}</strong>
              <br />
              <span className={styles.muted}>Quantidade: {item.quantity}</span>
            </span>
            <strong>{formatMoney(item.unit_price_cents * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotal_cents)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Desconto</span>
          <span>− {formatMoney(order.discount_cents)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Entrega</span>
          <span>
            {order.shipping_cents === null ? 'A cotar' : formatMoney(order.shipping_cents)}
          </span>
        </div>
        <div className={styles.totalRow}>
          <strong>Total</strong>
          <strong>
            {order.total_cents === null ? 'Após cotação' : formatMoney(order.total_cents)}
          </strong>
        </div>
      </div>

      <div className={styles.actions}>
        {canPay ? <PayOrderButton publicToken={token} /> : null}
        <Link className={styles.link} href="/">
          Continuar na loja
        </Link>
      </div>
    </section>
  );
}
