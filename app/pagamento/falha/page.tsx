import { PaymentReturnActions } from '@/components/orders/PaymentReturnActions';
import styles from '@/components/orders/OrderStatus.module.css';

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id: paymentId } = await searchParams;
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento não concluído</p>
      <h1 className={styles.title}>Tente novamente.</h1>
      <p>
        Nenhuma cobrança foi confirmada. Volte ao link do pedido para iniciar uma nova tentativa ou
        fale com a ART.
      </p>
      <PaymentReturnActions retry paymentId={paymentId} />
    </section>
  );
}
