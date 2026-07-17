import { PaymentReturnActions } from '@/components/orders/PaymentReturnActions';
import styles from '@/components/orders/OrderStatus.module.css';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id: paymentId } = await searchParams;
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento recebido</p>
      <h1 className={styles.title}>Tudo certo.</h1>
      <p>
        Estamos confirmando o pagamento. Isso pode levar alguns instantes; o status será atualizado
        pelo Mercado Pago.
      </p>
      <PaymentReturnActions paymentId={paymentId} />
    </section>
  );
}
