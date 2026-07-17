'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import styles from './OrderStatus.module.css';

function safeOrderUrl(value: string | null): string | null {
  return value && /^\/pedido\/[A-Za-z0-9_-]{32,128}$/.test(value) ? value : null;
}

export function PaymentReturnActions({
  retry = false,
  paymentId,
}: {
  retry?: boolean;
  paymentId?: string;
}) {
  const orderUrl = useSyncExternalStore(
    () => () => undefined,
    () => safeOrderUrl(sessionStorage.getItem('art.last-order-url')),
    () => null,
  );
  const [reconciliation, setReconciliation] = useState<
    'idle' | 'checking' | 'confirmed' | 'waiting'
  >(paymentId ? 'checking' : 'idle');

  useEffect(() => {
    if (!paymentId) return;
    void fetch('/api/pagamentos/reconciliar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
      .then((response) => setReconciliation(response.ok ? 'confirmed' : 'waiting'))
      .catch(() => setReconciliation('waiting'));
  }, [paymentId]);

  return (
    <div className={styles.actions}>
      {orderUrl ? (
        <Link className={styles.button} href={orderUrl}>
          {retry ? 'Tentar pagar novamente' : 'Acompanhar pedido'}
        </Link>
      ) : null}
      {reconciliation === 'checking' ? (
        <p className={styles.muted}>Confirmando pagamento…</p>
      ) : null}
      {reconciliation === 'waiting' ? (
        <p className={styles.muted}>Ainda estamos aguardando a confirmação do Mercado Pago.</p>
      ) : null}
      {reconciliation === 'confirmed' ? (
        <p className={styles.muted}>Pagamento confirmado.</p>
      ) : null}
      <Link className={styles.link} href="/conta">
        Ver minha conta
      </Link>
      <Link className={styles.link} href="/">
        Voltar à loja
      </Link>
    </div>
  );
}
