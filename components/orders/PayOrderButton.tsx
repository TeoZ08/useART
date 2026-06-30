'use client';

import { useState } from 'react';
import styles from './OrderStatus.module.css';

export function PayOrderButton({ publicToken }: { publicToken: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function startPayment() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({ publicToken }),
      });
      const body = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !body.checkoutUrl)
        throw new Error(body.error ?? 'Pagamento indisponível.');
      window.location.assign(body.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pagamento indisponível.');
      setPending(false);
    }
  }

  return (
    <div>
      <button className={styles.button} type="button" disabled={pending} onClick={startPayment}>
        {pending ? 'Abrindo pagamento…' : 'Pagar com Mercado Pago'}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
