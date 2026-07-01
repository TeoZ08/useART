import { redirect } from 'next/navigation';
import { AdminAuthorizationError, requireAdmin } from '@/lib/auth/admin';
import { MfaClient } from './MfaClient';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  try {
    return await requireAdmin(['owner', 'admin'], { enforceMfa: false });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) redirect('/admin/login');
    throw error;
  }
}

export default async function MfaPage() {
  await verifyAdmin();
  return (
    <main className={styles.loginPage}>
      <MfaClient />
    </main>
  );
}
