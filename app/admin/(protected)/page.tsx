import { createAdminClient } from '@/lib/supabase/admin';
import { formatMoney } from '@/lib/money';
import styles from '../admin.module.css';

export default async function AdminDashboardPage() {
  const db = createAdminClient();
  const [orders, products] = await Promise.all([
    db.from('orders').select('status, payment_status, total_cents'),
    db.from('products').select('active, review_required'),
  ]);
  if (orders.error || products.error) throw new Error('Não foi possível carregar o dashboard.');
  const rows = orders.data ?? [];
  const count = (statuses: string[]) =>
    rows.filter((order) => statuses.includes(order.status)).length;
  const revenue = rows
    .filter((order) => order.payment_status === 'approved')
    .reduce((sum, order) => sum + (order.total_cents ?? 0), 0);
  const metrics = [
    ['Novos', count(['draft'])],
    ['Cotações', count(['quote_requested'])],
    ['Aguardando pagamento', count(['awaiting_payment', 'payment_pending'])],
    ['Pagos', count(['paid'])],
    ['Em produção', count(['in_production'])],
    ['Prontos', count(['ready_for_pickup'])],
    ['Receita aprovada', formatMoney(revenue)],
    ['Produtos ativos', products.data?.filter((product) => product.active).length ?? 0],
    ['Pendências', products.data?.filter((product) => product.review_required).length ?? 0],
  ];

  return (
    <>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Operação</p>
        <h1>Resumo</h1>
        <p>Indicadores operacionais, sem estimativas decorativas.</p>
      </header>
      <section className={styles.metrics}>
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
    </>
  );
}
