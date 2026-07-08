'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../admin.module.css';

export function LoginForm({ initialError = '' }: { initialError?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');

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

  async function sendRecovery() {
    setError('');
    setNotice('');
    if (!email.trim() || !email.includes('@')) {
      setError('Informe o e-mail administrativo para receber o link.');
      return;
    }

    setPending(true);
    const supabase = createClient();
    const redirectTo = new URL('/admin/definir-senha?flow=recovery', window.location.origin);
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo.toString(),
    });
    setPending(false);
    if (recoveryError) {
      setError('Não foi possível enviar o link agora. Tente novamente mais tarde.');
      return;
    }
    setNotice('Se o e-mail estiver autorizado, um link de recovery será enviado.');
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
      {error || initialError ? (
        <p className={styles.error} role="alert">
          {error || initialError}
        </p>
      ) : null}
      {notice ? (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
      <button
        className={styles.secondaryAction}
        type="button"
        onClick={sendRecovery}
        disabled={pending}
      >
        Esqueci minha senha
      </button>
    </form>
  );
}
