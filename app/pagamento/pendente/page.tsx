import Link from 'next/link';
import styles from '@/components/orders/OrderStatus.module.css';

export default function PaymentPendingPage() {
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento pendente</p>
      <h1 className={styles.title}>Estamos acompanhando.</h1>
      <p>
        Alguns meios de pagamento levam mais tempo para confirmar. O status será atualizado
        automaticamente.
      </p>
      <div className={styles.actions}>
        <Link className={styles.link} href="/">
          Voltar à loja
        </Link>
      </div>
    </section>
  );
}
