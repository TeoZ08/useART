'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { validateAdminPassword } from '@/lib/auth/password-policy';
import { createClient } from '@/lib/supabase/client';
import styles from '../admin.module.css';

type PasswordFlow = 'invite' | 'recovery';

export function PasswordForm({ flow }: { flow: PasswordFlow }) {
  const [sessionState, setSessionState] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSessionState(data.session ? 'ready' : 'invalid');
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSessionState(session ? 'ready' : 'invalid');
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateAdminPassword(password, confirmation);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError('Não foi possível definir a senha. Solicite um novo link e tente novamente.');
      setPending(false);
      return;
    }

    setPassword('');
    setConfirmation('');
    window.location.replace(flow === 'invite' ? '/admin/mfa' : '/admin');
  }

  if (sessionState === 'loading') {
    return (
      <section className={styles.loginCard} aria-live="polite">
        <p className={styles.eyebrow}>ART Commerce</p>
        <h1>Validando link</h1>
        <p>Aguarde enquanto confirmamos sua sessão administrativa.</p>
      </section>
    );
  }

  if (sessionState === 'invalid') {
    return (
      <section className={styles.loginCard}>
        <p className={styles.eyebrow}>Segurança</p>
        <h1>Link inválido</h1>
        <p>Este link expirou ou já foi utilizado. Solicite um novo convite ou recovery.</p>
        <Link className={styles.button} href="/admin/login">
          Voltar ao login
        </Link>
      </section>
    );
  }

  return (
    <form className={styles.loginCard} onSubmit={submit}>
      <p className={styles.eyebrow}>{flow === 'invite' ? 'Ativar acesso' : 'Recovery'}</p>
      <h1>Definir senha</h1>
      <p>Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo.</p>
      <label>
        <span>Nova senha</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={12}
          required
        />
      </label>
      <label>
        <span>Confirmar nova senha</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          minLength={12}
          required
        />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar nova senha'}
      </button>
    </form>
  );
}
