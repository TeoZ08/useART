'use client';

import { useState } from 'react';
import styles from './Account.module.css';

export function AccountPayOrderButton({ orderId }: { orderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/conta/create-preference', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
        body: JSON.stringify({ orderId }),
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
      <button className={styles.primaryButton} type="button" disabled={pending} onClick={pay}>
        {pending ? 'Abrindo pagamento…' : 'Continuar pagamento'}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
