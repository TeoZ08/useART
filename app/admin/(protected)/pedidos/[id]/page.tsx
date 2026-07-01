import { notFound } from 'next/navigation';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { requireAdmin } from '@/lib/auth/admin';
import { getServerEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney } from '@/lib/money';
import {
  cancelOrder,
  generatePaymentLink,
  quoteNationalShipping,
  transitionOrder,
  updateOrderNotes,
} from '../actions';
import styles from '../../../admin.module.css';

const transitions: Record<string, { target: string; label: string }[]> = {
  paid: [{ target: 'in_production', label: 'Iniciar produção' }],
  in_production: [{ target: 'ready_for_pickup', label: 'Marcar como pronto' }],
  ready_for_pickup: [
    { target: 'delivered', label: 'Marcar como entregue' },
    { target: 'shipped', label: 'Registrar envio' },
  ],
  shipped: [{ target: 'delivered', label: 'Marcar como entregue' }],
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const [orderResult, historyResult, paymentsResult] = await Promise.all([
    db.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle(),
    db.from('order_status_history').select('*').eq('order_id', id).order('created_at'),
    db
      .from('payment_attempts')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ]);
  if (!orderResult.data) notFound();
  const error = orderResult.error ?? historyResult.error ?? paymentsResult.error;
  if (error) throw new Error(`Falha ao carregar pedido: ${error.message}`);
  const order = orderResult.data;
  const env = getServerEnv();
  const message = encodeURIComponent(
    `Olá, ${order.customer_name}. Sobre o pedido ${order.order_code} da ART: `,
  );
  const transitionOptions = transitions[order.status] ?? [];
  const canCancel =
    actor.role !== 'operator' &&
    !['approved', 'refunded'].includes(order.payment_status) &&
    !['cancelled', 'delivered', 'refunded'].includes(order.status);

  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Pedido</p>
        <h1>{order.order_code}</h1>
        <p>
          <span className={styles.status}>{order.status}</span> • pagamento {order.payment_status}
        </p>
      </header>
      <div className={styles.toolbar}>
        <a
          className={styles.button}
          href={`https://wa.me/${order.customer_phone_normalized}?text=${message}`}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp
        </a>
      </div>
      <section className={styles.panel}>
        <h2>Cliente e entrega</h2>
        <dl className={styles.details}>
          <div>
            <dt>Nome</dt>
            <dd>{order.customer_name}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{order.customer_phone}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{order.customer_email || 'Não informado'}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{order.shipping_method}</dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>{order.address ? JSON.stringify(order.address) : 'Retirada'}</dd>
          </div>
          <div>
            <dt>Rastreio</dt>
            <dd>
              {order.tracking_code ?? 'Não informado'}
              {order.tracking_url ? (
                <>
                  {' '}
                  •{' '}
                  <a href={order.tracking_url} target="_blank" rel="noreferrer">
                    abrir
                  </a>
                </>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>
      <section className={styles.panel}>
        <h2>Itens</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Seleção</th>
                <th>Qtd.</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name_snapshot}</td>
                  <td>{item.sku_snapshot}</td>
                  <td>
                    <pre className={styles.json}>{JSON.stringify(item.selection, null, 2)}</pre>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unit_price_cents * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.rows}>
          <div>
            <span>Subtotal</span>
            <b>{formatMoney(order.subtotal_cents)}</b>
          </div>
          <div>
            <span>Desconto</span>
            <b>− {formatMoney(order.discount_cents)}</b>
          </div>
          <div>
            <span>Frete</span>
            <b>{order.shipping_cents === null ? 'A cotar' : formatMoney(order.shipping_cents)}</b>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <b>{order.total_cents === null ? 'Após cotação' : formatMoney(order.total_cents)}</b>
          </div>
        </div>
      </section>

      {order.status === 'quote_requested' ? (
        <section className={styles.panel}>
          <h2>Cotar frete nacional</h2>
          <form action={quoteNationalShipping} className={styles.formGrid}>
            <input type="hidden" name="orderId" value={order.id} />
            <label>
              <span>Frete em centavos</span>
              <input name="shippingCents" type="number" min="0" required />
            </label>
            <label className={styles.full}>
              <span>Observação</span>
              <textarea name="note" />
            </label>
            <div className={styles.full}>
              <button className={styles.button}>Confirmar cotação</button>
            </div>
          </form>
        </section>
      ) : null}

      {transitionOptions.length ? (
        <section className={styles.panel}>
          <h2>Andamento</h2>
          {transitionOptions.map((transition) => (
            <form action={transitionOrder} className={styles.formGrid} key={transition.target}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="targetStatus" value={transition.target} />
              {transition.target === 'shipped' ? (
                <>
                  <label>
                    <span>Código de rastreio</span>
                    <input name="trackingCode" required />
                  </label>
                  <label>
                    <span>URL de rastreio</span>
                    <input name="trackingUrl" type="url" />
                  </label>
                </>
              ) : null}
              <label className={styles.full}>
                <span>Observação</span>
                <textarea name="note" />
              </label>
              <div className={styles.full}>
                <button className={styles.button}>{transition.label}</button>
              </div>
            </form>
          ))}
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2>Notas internas</h2>
        <form action={updateOrderNotes} className={styles.formGrid}>
          <input type="hidden" name="orderId" value={order.id} />
          <label className={styles.full}>
            <textarea name="notes" defaultValue={order.notes ?? ''} maxLength={2000} />
          </label>
          <div className={styles.full}>
            <button className={styles.button}>Salvar observação</button>
          </div>
        </form>
      </section>

      {canCancel ? (
        <section className={styles.panel}>
          <h2>Cancelar pedido</h2>
          <form action={cancelOrder} className={styles.formGrid}>
            <input type="hidden" name="orderId" value={order.id} />
            <label className={styles.full}>
              <span>Motivo obrigatório</span>
              <textarea name="note" required minLength={3} />
            </label>
            <div className={styles.full}>
              <ConfirmSubmitButton message="Cancelar o pedido e liberar cupom/estoque reservado?">
                Cancelar pedido
              </ConfirmSubmitButton>
            </div>
          </form>
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2>Pagamentos</h2>
        {env.PAYMENTS_ENABLED &&
        order.total_cents !== null &&
        order.status === 'awaiting_payment' ? (
          <form action={generatePaymentLink}>
            <input type="hidden" name="orderId" value={order.id} />
            <button className={styles.button}>Gerar link de pagamento</button>
          </form>
        ) : (
          <p>Geração bloqueada pela feature flag ou pelo estado do pedido.</p>
        )}
        {(paymentsResult.data ?? []).length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Preferência</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {paymentsResult.data?.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(payment.created_at))}
                    </td>
                    <td>{payment.preference_id ?? '—'}</td>
                    <td>{payment.provider_payment_id ?? '—'}</td>
                    <td>{payment.status}</td>
                    <td>{formatMoney(payment.amount_cents)}</td>
                    <td>
                      {payment.checkout_url ? (
                        <a href={payment.checkout_url} target="_blank" rel="noreferrer">
                          Abrir
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhuma tentativa. Pagamentos permanecem desativados sem credenciais de teste.</p>
        )}
      </section>
      <section className={styles.panel}>
        <h2>Histórico</h2>
        <ol className={styles.timeline}>
          {historyResult.data?.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.to_status}</strong>
              <span>
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(entry.created_at))}{' '}
                • {entry.source}
              </span>
              {entry.note ? <p>{entry.note}</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
