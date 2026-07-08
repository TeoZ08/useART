import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { requireAdmin } from '@/lib/auth/admin';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let authenticated = false;
  try {
    await requireAdmin();
    authenticated = true;
  } catch {
    authenticated = false;
  }
  if (authenticated) redirect('/admin');
  const { error } = await searchParams;
  const initialError =
    error === 'expired_link'
      ? 'O link expirou ou já foi utilizado. Solicite um novo link.'
      : error === 'invalid_link'
        ? 'O link de acesso é inválido.'
        : '';
  return (
    <main className={styles.loginPage}>
      <LoginForm initialError={initialError} />
    </main>
  );
}
