import Link from 'next/link';
import styles from '@/components/orders/OrderStatus.module.css';

export default function PaymentSuccessPage() {
  return (
    <section className={styles.shell}>
      <p className={styles.eyebrow}>Pagamento recebido</p>
      <h1 className={styles.title}>Tudo certo.</h1>
      <p>
        Estamos confirmando o pagamento. Acompanhe o pedido pelo link que você recebeu no checkout.
      </p>
      <div className={styles.actions}>
        <Link className={styles.link} href="/">
          Voltar à loja
        </Link>
      </div>
    </section>
  );
}
