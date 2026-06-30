import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { requireAdmin } from '@/lib/auth/admin';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  let authenticated = false;
  try {
    await requireAdmin();
    authenticated = true;
  } catch {
    authenticated = false;
  }
  if (authenticated) redirect('/admin');
  return (
    <main className={styles.loginPage}>
      <LoginForm />
    </main>
  );
}
