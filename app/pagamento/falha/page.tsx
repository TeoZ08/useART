import Link from 'next/link';
import styles from '@/components/orders/OrderStatus.module.css';

export default function PaymentFailurePage() {
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento não concluído</p>
      <h1 className={styles.title}>Tente novamente.</h1>
      <p>
        Nenhuma cobrança foi confirmada. Volte ao link do pedido para iniciar uma nova tentativa ou
        fale com a ART.
      </p>
      <div className={styles.actions}>
        <Link className={styles.link} href="/">
          Voltar à loja
        </Link>
      </div>
    </section>
  );
}
