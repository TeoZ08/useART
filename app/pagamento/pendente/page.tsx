import { PaymentReturnActions } from '@/components/orders/PaymentReturnActions';
import styles from '@/components/orders/OrderStatus.module.css';

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id: paymentId } = await searchParams;
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento pendente</p>
      <h1 className={styles.title}>Estamos acompanhando.</h1>
      <p>
        Alguns meios de pagamento levam mais tempo para confirmar. O status será atualizado
        automaticamente.
      </p>
      <PaymentReturnActions paymentId={paymentId} />
    </section>
  );
}
