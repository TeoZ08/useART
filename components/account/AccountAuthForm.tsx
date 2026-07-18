'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './Account.module.css';

export function AccountAuthForm({ initialError = '' }: { initialError?: string }) {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim() || !email.includes('@')) {
      setError('Informe o e-mail usado no pedido.');
      return;
    }

    setPending(true);
    try {
      const redirectTo = new URL('/auth/confirm?next=/conta', window.location.origin);
      const { error: authError } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo.toString() },
      });
      if (authError) throw authError;
      setNotice('Se o e-mail for válido, enviamos um link seguro para acessar sua conta.');
    } catch {
      setError('Não foi possível enviar o link agora. Tente novamente em alguns instantes.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.authCard} onSubmit={submit}>
      <p className={styles.eyebrow}>Conta ART</p>
      <h1>Seus pedidos, quando quiser.</h1>
      <p>A conta é opcional. Use o mesmo e-mail informado no checkout para ver seus pedidos.</p>
      <p>
        O acesso é feito por link seguro enviado para o seu e-mail — não há senha tradicional. Se
        ele não chegar, confira a caixa de spam e solicite outro link.
      </p>
      <label>
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      {error || initialError ? <p className={styles.error}>{error || initialError}</p> : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Receber link de acesso'}
      </button>
    </form>
  );
}
