'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../admin.module.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('E-mail ou senha inválidos.');
      setPending(false);
      return;
    }
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    window.location.assign(
      assurance?.nextLevel === 'aal2' && assurance.currentLevel !== 'aal2'
        ? '/admin/mfa'
        : '/admin',
    );
  }

  return (
    <form className={styles.loginCard} onSubmit={submit}>
      <p className={styles.eyebrow}>ART Commerce</p>
      <h1>Administração</h1>
      <p>Acesso somente para usuários convidados. Não há cadastro público.</p>
      <label>
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        <span>Senha</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
