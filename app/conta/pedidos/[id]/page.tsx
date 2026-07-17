import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import styles from '@/components/account/Account.module.css';
import { describeSelection } from '@/domain/cart/selection';
import { formatMoney } from '@/lib/money';
import { orderStatusLabel, shippingMethodLabel } from '@/lib/orders/presentation';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrder } from '@/services/orders/customer-orders';
import type { CartItemSelection } from '@/types/commerce';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pedido da conta', robots: { index: false, follow: false } };

function addressLabel(address: unknown): string {
  if (!address || typeof address !== 'object') return 'Retirada ou entrega combinada com a ART.';
  const value = address as Record<string, unknown>;
  return [value.street, value.number, value.neighborhood, value.city, value.state]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(', ');
}

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { data } = await (await createClient()).auth.getUser();
  if (!data.user?.email || !data.user.email_confirmed_at) redirect('/conta');
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const order = await getCustomerOrder(data.user.email, id);
  if (!order) notFound();
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Detalhes do pedido</p>
      <h1 className={styles.title}>{order.order_code}</h1>
      <p className={styles.lead}>
        <span className={styles.status}>{orderStatusLabel(order.status)}</span>
      </p>
      <section className={styles.detailGrid}>
        <div>
          <span>Entrega</span>
          <strong>{shippingMethodLabel(order.shipping_method)}</strong>
          <p>{addressLabel(order.address)}</p>
        </div>
        <div>
          <span>Próxima ação</span>
          <strong>
            {['awaiting_payment', 'payment_pending'].includes(order.status)
              ? 'Continue o pagamento para confirmar o pedido.'
              : 'Acompanhe as atualizações deste pedido na sua conta.'}
          </strong>
        </div>
      </section>
      <section className={styles.detailCard}>
        <h2>Itens</h2>
        {order.order_items.map((item, index) => (
          <div className={styles.detailItem} key={`${item.product_name_snapshot}-${index}`}>
            <div>
              <strong>
                {item.quantity}x {item.product_name_snapshot}
              </strong>
              <ul>
                {describeSelection(item.selection as CartItemSelection).map((selection) => (
                  <li key={selection}>{selection}</li>
                ))}
              </ul>
            </div>
            <strong>{formatMoney(item.unit_price_cents * item.quantity)}</strong>
          </div>
        ))}
        <div className={styles.detailTotals}>
          <span>
            Subtotal <strong>{formatMoney(order.subtotal_cents)}</strong>
          </span>
          <span>
            Desconto <strong>− {formatMoney(order.discount_cents)}</strong>
          </span>
          <span>
            Frete{' '}
            <strong>
              {order.shipping_cents === null ? 'A cotar' : formatMoney(order.shipping_cents)}
            </strong>
          </span>
          <span>
            Total{' '}
            <strong>
              {order.total_cents === null ? 'Após cotação' : formatMoney(order.total_cents)}
            </strong>
          </span>
        </div>
      </section>
    </section>
  );
}
