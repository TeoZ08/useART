import Link from 'next/link';
import { formatMoney } from '@/lib/money';
import type { CustomerOrder } from '@/services/orders/customer-orders';
import { AccountPayOrderButton } from './AccountPayOrderButton';
import styles from './Account.module.css';

const statusLabel: Record<string, string> = {
  quote_requested: 'Frete em cotação',
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

export function CustomerOrders({ orders }: { orders: CustomerOrder[] }) {
  if (!orders.length) {
    return <p className={styles.lead}>Ainda não há pedidos associados a este e-mail.</p>;
  }

  return (
    <div className={styles.orders}>
      {orders.map((order) => {
        const canPay =
          order.total_cents !== null &&
          ['awaiting_payment', 'payment_pending'].includes(order.status);
        return (
          <article className={styles.order} key={order.id}>
            <div className={styles.orderTop}>
              <strong className={styles.orderCode}>{order.order_code}</strong>
              <span className={styles.status}>{statusLabel[order.status] ?? order.status}</span>
            </div>
            <div className={styles.orderMeta}>
              <span>{new Intl.DateTimeFormat('pt-BR').format(new Date(order.created_at))}</span>
              <strong>
                {order.total_cents === null ? 'Após cotação' : formatMoney(order.total_cents)}
              </strong>
            </div>
            <ul className={styles.orderItems}>
              {order.order_items.map((item, index) => (
                <li key={`${item.product_name_snapshot}-${index}`}>
                  {item.quantity}x {item.product_name_snapshot}
                </li>
              ))}
            </ul>
            <div className={styles.orderActions}>
              <Link className={styles.secondaryButton} href={`/conta/pedidos/${order.id}`}>
                Ver detalhes
              </Link>
              {canPay ? <AccountPayOrderButton orderId={order.id} /> : null}
            </div>
            {canPay ? (
              <p className={styles.paymentHint}>
                Retome o pagamento deste pedido sem criar uma nova solicitação.
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
