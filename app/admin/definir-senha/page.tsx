import type { Metadata } from 'next';
import { PasswordForm } from './PasswordForm';
import styles from '../admin.module.css';

export const metadata: Metadata = {
  title: 'Definir senha administrativa',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function DefinePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>;
}) {
  const { flow } = await searchParams;
  return (
    <main className={styles.loginPage}>
      <PasswordForm flow={flow === 'invite' ? 'invite' : 'recovery'} />
    </main>
  );
}
