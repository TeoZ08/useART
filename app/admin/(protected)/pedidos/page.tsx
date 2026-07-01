import Link from 'next/link';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney } from '@/lib/money';
import styles from '../../admin.module.css';

const filtersSchema = z.object({
  q: z.string().trim().max(80).optional(),
  status: z.string().max(40).optional(),
  payment: z.string().max(40).optional(),
  shipping: z.string().max(40).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = filtersSchema.parse(
    Object.fromEntries(Object.entries(raw).filter(([, value]) => typeof value === 'string')),
  );
  const db = createAdminClient();
  let query = db
    .from('orders')
    .select(
      'id, order_code, created_at, customer_name, customer_phone_normalized, shipping_method, total_cents, payment_status, status',
    )
    .order('created_at', { ascending: false })
    .limit(200);
  if (filters.q) {
    const digits = filters.q.replace(/\D/g, '');
    query =
      digits.length >= 6
        ? query.ilike('customer_phone_normalized', `%${digits}%`)
        : query.ilike('order_code', `%${filters.q.replace(/[%_]/g, '')}%`);
  }
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.payment) query = query.eq('payment_status', filters.payment);
  if (filters.shipping) query = query.eq('shipping_method', filters.shipping);
  if (filters.from)
    query = query.gte('created_at', new Date(`${filters.from}T00:00:00`).toISOString());
  if (filters.to)
    query = query.lte('created_at', new Date(`${filters.to}T23:59:59.999`).toISOString());
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao carregar pedidos: ${error.message}`);
  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Operação</p>
        <h1>Pedidos</h1>
        <p>Pedidos persistidos, cotações e andamento de produção.</p>
      </header>
      <form className={`${styles.panel} ${styles.formGrid}`}>
        <label>
          <span>Código ou telefone</span>
          <input name="q" defaultValue={filters.q} />
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={filters.status ?? ''}>
            <option value="">Todos</option>
            {[
              'draft',
              'quote_requested',
              'awaiting_payment',
              'payment_pending',
              'paid',
              'in_production',
              'ready_for_pickup',
              'shipped',
              'delivered',
              'cancelled',
              'refunded',
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Pagamento</span>
          <select name="payment" defaultValue={filters.payment ?? ''}>
            <option value="">Todos</option>
            {[
              'not_created',
              'pending',
              'approved',
              'rejected',
              'cancelled',
              'refunded',
              'charged_back',
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Entrega</span>
          <select name="shipping" defaultValue={filters.shipping ?? ''}>
            <option value="">Todas</option>
            <option value="pickup">Retirada</option>
            <option value="local_delivery">Campo Grande</option>
            <option value="national_quote">Nacional</option>
          </select>
        </label>
        <label>
          <span>De</span>
          <input type="date" name="from" defaultValue={filters.from} />
        </label>
        <label>
          <span>Até</span>
          <input type="date" name="to" defaultValue={filters.to} />
        </label>
        <div className={styles.full}>
          <button className={styles.button}>Filtrar</button>
        </div>
      </form>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/pedidos/${order.id}`}>{order.order_code}</Link>
                  <br />
                  <small>
                    {new Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(order.created_at))}
                  </small>
                </td>
                <td>
                  {order.customer_name}
                  <br />
                  <small>{order.customer_phone_normalized}</small>
                </td>
                <td>{order.shipping_method}</td>
                <td>{order.total_cents === null ? 'A cotar' : formatMoney(order.total_cents)}</td>
                <td>{order.payment_status}</td>
                <td>
                  <span className={styles.status}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
