'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './Account.module.css';

export function AccountSignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await createClient().auth.signOut();
    window.location.assign('/conta');
  }

  return (
    <button className={styles.secondaryButton} type="button" disabled={pending} onClick={signOut}>
      {pending ? 'Saindo…' : 'Sair da conta'}
    </button>
  );
}
