'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../admin.module.css';

type Enrollment = { id: string; qrCode: string; secret: string };

export function MfaClient() {
  const [level, setLevel] = useState('carregando');
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      if (data?.currentLevel === 'aal2') setLevel('verificado');
      else setLevel('pendente');
    });
  }, []);

  async function enroll() {
    setError('');
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'ART Admin',
    });
    if (enrollError) return setError(enrollError.message);
    setEnrollment({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify() {
    if (!enrollment) return;
    setError('');
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrollment.id,
    });
    if (challengeError) return setError(challengeError.message);
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId: challenge.id,
      code,
    });
    if (verifyError) return setError(verifyError.message);
    window.location.assign('/admin');
  }

  return (
    <section className={styles.loginCard}>
      <p className={styles.eyebrow}>Segurança</p>
      <h1>MFA</h1>
      {level === 'verificado' ? (
        <>
          <p>Esta sessão já possui autenticação em dois fatores.</p>
          <a className={styles.button} href="/admin">
            Continuar
          </a>
        </>
      ) : enrollment ? (
        <>
          <p>Leia o QR code no aplicativo autenticador e confirme o código.</p>
          {/* O SVG é gerado pelo Supabase Auth, não por upload de usuário. */}
          <div dangerouslySetInnerHTML={{ __html: enrollment.qrCode }} />
          <p>
            Chave manual: <code>{enrollment.secret}</code>
          </p>
          <label>
            <span>Código de seis dígitos</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            />
          </label>
          <button type="button" onClick={verify}>
            Verificar
          </button>
        </>
      ) : (
        <>
          <p>Owner e admin precisam de TOTP antes de uma ativação live.</p>
          <button type="button" onClick={enroll} disabled={level === 'carregando'}>
            Configurar autenticador
          </button>
        </>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
